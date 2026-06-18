<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white text-black rounded shadow-lg w-11/12 max-w-2xl p-4 max-h-[90vh] overflow-auto">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-medium">{{ headerTitle }}</h3>
        <button class="text-gray-500" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-3" novalidate>
        <div class="space-y-3">
          <div v-if="!lawyer">
            <label class="block text-sm font-medium">Abogado <span class="text-red-600">*</span></label>
            <LawyersList :token="token" @select="onChooseLawyer" :compact="true" />
            <div v-if="selectedLawyer" class="mt-2 p-2 border rounded bg-gray-50">
              <div class="font-medium">{{ selectedLawyer.name }}</div>
              <div class="text-xs text-gray-600">{{ selectedLawyer.province }} — {{ selectedLawyer.municipality }}</div>
            </div>
          </div>
        </div>
          <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="task-description" class="block text-sm font-medium">Descripción <span class="text-red-600">*</span></label>
            <input id="task-description" v-model="task.description" required placeholder="Breve descripción de la tarea" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label for="task-category" class="block text-sm font-medium">Categoría</label>
            <select id="task-category" v-model="task.category" class="border p-2 w-full rounded">
              <option value="">(ninguna)</option>
              <option>Administrativo</option>
              <option>Civil</option>
              <option>Laboral</option>
              <option>Familiar</option>
            </select>
          </div>
          <div>
            <label for="task-startDate" class="block text-sm font-medium">Fecha inicio <span class="text-red-600">*</span></label>
            <input id="task-startDate" v-model="task.startDate" type="date" required class="border p-2 w-full rounded" />
          </div>
          <div>
            <label for="task-endDate" class="block text-sm font-medium">Fecha fin <span class="text-red-600">*</span></label>
            <input id="task-endDate" v-model="task.endDate" type="date" required class="border p-2 w-full rounded" />
          </div>
          <div>
            <label for="task-startTime" class="block text-sm font-medium">Hora inicio</label>
            <input id="task-startTime" v-model="task.startTime" type="time" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label for="task-endTime" class="block text-sm font-medium">Hora fin</label>
            <input id="task-endTime" v-model="task.endTime" type="time" class="border p-2 w-full rounded" />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-3">
          <button type="button" class="px-4 py-2 border rounded bg-gray-100" @click="$emit('close')">Cancelar</button>
          <button type="submit" :disabled="saving || !canSave" class="px-4 py-2 bg-green-600 text-white rounded">
            <span v-if="!saving">Crear tarea</span>
            <span v-else>Guardando...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { showToast } from '../utils/toast'
import { baseUrl, buildHeaders } from '../utils/apiClient'
import LawyersList from './LawyersList.vue'
export default {
  props: { lawyer: { type: Object, required: false }, token: String },
  components: { LawyersList },
  data(){
    const today = new Date().toISOString().slice(0,10);
    return { selectedLawyer: null, task: { description:'', category:'', startDate: today, endDate: today, startTime:'', endTime:'' }, saving:false }
  },
  computed: {
    effectiveLawyer(){ return this.lawyer || this.selectedLawyer },
    headerTitle(){ return this.effectiveLawyer ? ('Añadir tarea para ' + this.effectiveLawyer.name) : 'Añadir tarea' },
    canSave(){ return this.task.description && this.task.startDate && this.task.endDate && this.effectiveLawyer }
  },
  methods: {
    onChooseLawyer(l){ this.selectedLawyer = l },
    async onSubmit(){
      if(!this.canSave) return;
      try{
        this.saving = true;
        const base = baseUrl('');
        const payload = {
          type: 'task',
          lawyerId: this.effectiveLawyer.id,
          description: this.task.description,
          category: this.task.category,
          startDate: this.task.startDate,
          endDate: this.task.endDate,
          startTime: this.task.startTime || null,
          endTime: this.task.endTime || null
        };
        await axios.post(baseUrl('/schedules'), payload, { headers: buildHeaders(this.token) });
        showToast('Tarea creada', 'success');
        this.$emit('added');
        this.$emit('close');
      }catch(err){
        console.error(err);
        showToast('Error al crear tarea', 'error');
      }finally{ this.saving = false }
    }
  }
}
</script>

<style scoped>
</style>
