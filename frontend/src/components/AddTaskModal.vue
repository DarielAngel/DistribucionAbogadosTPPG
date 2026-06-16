<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded shadow-lg w-11/12 max-w-2xl p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-medium">Añadir tarea para {{ lawyer.name }}</h3>
        <button class="text-gray-500" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-3" novalidate>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium">Descripción <span class="text-red-600">*</span></label>
            <input v-model="task.description" required placeholder="Breve descripción de la tarea" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium">Categoría</label>
            <select v-model="task.category" class="border p-2 w-full rounded">
              <option value="">(ninguna)</option>
              <option>Administrativo</option>
              <option>Civil</option>
              <option>Laboral</option>
              <option>Familiar</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium">Fecha inicio <span class="text-red-600">*</span></label>
            <input v-model="task.startDate" type="date" required class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium">Fecha fin <span class="text-red-600">*</span></label>
            <input v-model="task.endDate" type="date" required class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium">Hora inicio</label>
            <input v-model="task.startTime" type="time" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium">Hora fin</label>
            <input v-model="task.endTime" type="time" class="border p-2 w-full rounded" />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-3">
          <button type="button" class="px-4 py-2 border rounded" @click="$emit('close')">Cancelar</button>
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
export default {
  props: { lawyer: { type: Object, required: true }, token: String },
  data(){
    const today = new Date().toISOString().slice(0,10);
    return { task: { description:'', category:'', startDate: today, endDate: today, startTime:'', endTime:'' }, saving:false }
  },
  computed: {
    canSave(){ return this.task.description && this.task.startDate && this.task.endDate }
  },
  methods: {
    async onSubmit(){
      if(!this.canSave) return;
      try{
        this.saving = true;
        const base = (import.meta.env.VITE_API_URL||'/api');
        const payload = {
          type: 'task',
          lawyerId: this.lawyer.id,
          description: this.task.description,
          category: this.task.category,
          startDate: this.task.startDate,
          endDate: this.task.endDate,
          startTime: this.task.startTime || null,
          endTime: this.task.endTime || null
        };
        await axios.post(base + '/schedules', payload, { headers: this.token ? { Authorization: 'Bearer ' + this.token } : {} });
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
