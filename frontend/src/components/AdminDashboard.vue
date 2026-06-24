<template>
  <div class="p-4">
    <h2 class="text-2xl mb-4">Admin Dashboard</h2>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <h3 class="font-medium">Gestión de abogados</h3>
        <LawyersList ref="lawyersList" :token="token" :is-admin="isAdmin" @select="onSelect" @selection="onSelection" @request-delete="onRequestDelete" @request-edit="onRequestEdit" />
        <div v-if="activeLawyer" class="mt-4 border p-3 bg-white shadow-sm">
          <div class="font-semibold">{{ activeLawyer.name }}</div>
          <div class="text-sm text-gray-600">{{ activeLawyer.province }} — {{ activeLawyer.municipality }}</div>
          <div class="text-sm mt-2">Especialidad: {{ activeLawyer.specialization || '—' }}</div>
          <div class="text-sm mt-1">Contacto: {{ activeLawyer.email || '—' }}</div>
          <div class="mt-3 flex gap-2">
            <button v-if="isAdmin" class="px-3 py-1 bg-blue-600 text-white rounded" @click="openAddTask">+ Añadir tarea</button>
            <button v-if="isAdmin" class="px-3 py-1 border rounded text-blue-600" @click="onRequestEdit(activeLawyer)">Editar abogado</button>
            <button v-if="isAdmin" class="px-3 py-1 border rounded text-red-600" @click="requestDeleteActive">Eliminar abogado</button>
          </div>
        </div>
      </div>
      <div class="col-span-2">
        <h3 class="font-medium">Cronograma</h3>
        <MonthSchedule ref="monthSchedule" :token="token" :page-size-prop="pageSize" :selected-lawyers="selectedLawyers" :blocked-days="blockedDays" />
      </div>
    </div>
    <AddLawyerModal v-if="showEditModal" :edit-lawyer="editingLawyer" :token="token" @updated="onLawyerUpdated" @close="showEditModal=false" />
    <ConfirmModal v-if="showConfirmDelete" :title="pendingDelete ? ('Eliminar ' + pendingDelete.name) : 'Eliminar'" :message="pendingDelete ? ('¿Eliminar al abogado ' + pendingDelete.name + '? Esto eliminará también todas sus tareas.') : '¿Confirmar? '" @confirm="onConfirmDelete" @cancel="showConfirmDelete=false" />
    <AddTaskModal v-if="showAddTask" :lawyer="activeLawyer" :token="token" :blocked-days="blockedDays" @added="onTaskAdded" @close="showAddTask=false" />
  </div>
</template>

<script>
import LawyersList from './LawyersList.vue'
import MonthSchedule from './MonthSchedule.vue'
import ConfirmModal from './ConfirmModal.vue'
import AddTaskModal from './AddTaskModal.vue'
import AddLawyerModal from './AddLawyerModal.vue'
import axios from 'axios'
import { baseUrl, buildHeaders } from '../utils/apiClient'
import { showToast } from '../utils/toast'

export default {
  props: { token: String, selectedLawyers: Array, isAdmin: Boolean, openAddTaskSignal: Number, blockedDays: { type: Array, default: () => [0, 5, 6] } },
  components: { LawyersList, MonthSchedule, ConfirmModal, AddTaskModal, AddLawyerModal },
  data(){ return { activeLawyer: null, pageSize: 25, pendingDelete: null, showConfirmDelete:false, showAddTask:false, _lastOpenAddTaskSignal: null, editingLawyer: null, showEditModal: false } },
  methods:{
    onSelect(l){ this.activeLawyer = l; this.$emit('select', l) },
    onSelection(list){ this.$emit('selection', list) },
    onRequestDelete(l){ this.pendingDelete = l; this.showConfirmDelete = true },
    onRequestEdit(l){ this.editingLawyer = l; this.showEditModal = true },
    onLawyerUpdated(l){ if(this.activeLawyer && this.activeLawyer.id === l.id) this.activeLawyer = l; this.$emit('lawyer-updated', l); },
    requestDeleteActive(){ if(this.activeLawyer) this.onRequestDelete(this.activeLawyer) },
    async onConfirmDelete(){
      if(!this.pendingDelete) return;
      try{
        await axios.delete(baseUrl(`/lawyers/${this.pendingDelete.id}`), { headers: buildHeaders(this.token) });
        showToast('Abogado eliminado', 'success');
        // refresh list
        if(this.$refs.lawyersList && this.$refs.lawyersList.fetch) await this.$refs.lawyersList.fetch();
        if(this.activeLawyer && this.activeLawyer.id === this.pendingDelete.id) this.activeLawyer = null;
        this.$emit('lawyer-deleted', this.pendingDelete.id);
      }catch(err){
        console.error(err);
        showToast('Error al eliminar abogado', 'error');
      }finally{
        this.pendingDelete = null; this.showConfirmDelete = false;
      }
    },
    openAddTask(){ if(this.activeLawyer) this.showAddTask = true },
    async onTaskAdded(){
      showToast('Tarea añadida', 'success');
      // refresh lawyers list and month schedule so UI reflects DB changes
      if(this.$refs.lawyersList && this.$refs.lawyersList.fetch) await this.$refs.lawyersList.fetch();
      if(this.$refs.monthSchedule && this.$refs.monthSchedule.reload) await this.$refs.monthSchedule.reload();
      this.$emit('task-added');
    },
    // public helper to refresh both views (used by parent App when a lawyer is added from header)
    async refreshAll(){
      if(this.$refs.lawyersList && this.$refs.lawyersList.fetch) await this.$refs.lawyersList.fetch();
      if(this.$refs.monthSchedule && this.$refs.monthSchedule.reload) await this.$refs.monthSchedule.reload();
    }
  }
  ,watch: {
    openAddTaskSignal(newVal){
      if(!newVal) return;
      if(this._lastOpenAddTaskSignal === newVal) return;
      this._lastOpenAddTaskSignal = newVal;
      // open add task modal without preselected lawyer
      this.activeLawyer = null;
      this.showAddTask = true;
    }
  }
}
</script>
