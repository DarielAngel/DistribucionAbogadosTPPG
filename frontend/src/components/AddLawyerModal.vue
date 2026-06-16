<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded shadow-lg w-11/12 max-w-2xl p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-medium">Adicionar abogado</h3>
        <button class="text-gray-500" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm">Nombre</label>
            <input v-model="lawyer.name" required class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm">Email</label>
            <input v-model="lawyer.email" type="email" required class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm">Teléfono</label>
            <input v-model="lawyer.phone" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm">Especialidad</label>
            <input v-model="lawyer.specialization" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm">Provincia</label>
            <input v-model="lawyer.province" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label class="block text-sm">Municipio</label>
            <input v-model="lawyer.municipality" class="border p-2 w-full rounded" />
          </div>
        </div>

        <div>
          <h4 class="font-medium">Tareas (opcional)</h4>
          <div v-for="(t, idx) in tasks" :key="idx" class="border rounded p-3 mt-2">
            <div class="flex justify-between items-center mb-2">
              <div class="text-sm font-medium">Tarea {{ idx+1 }}</div>
              <button type="button" class="text-sm text-red-600" @click="removeTask(idx)">Eliminar</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-sm">Descripción</label>
                <input v-model="t.description" class="border p-2 w-full rounded" />
              </div>
              <div>
                <label class="text-sm">Categoría</label>
                <input v-model="t.category" class="border p-2 w-full rounded" />
              </div>
              <div>
                <label class="text-sm">Fecha inicio</label>
                <input v-model="t.startDate" type="date" class="border p-2 w-full rounded" />
              </div>
              <div>
                <label class="text-sm">Fecha fin</label>
                <input v-model="t.endDate" type="date" class="border p-2 w-full rounded" />
              </div>
              <div>
                <label class="text-sm">Hora inicio</label>
                <input v-model="t.startTime" type="time" class="border p-2 w-full rounded" />
              </div>
              <div>
                <label class="text-sm">Hora fin</label>
                <input v-model="t.endTime" type="time" class="border p-2 w-full rounded" />
              </div>
            </div>
          </div>
          <div class="mt-2">
            <button type="button" class="px-3 py-1 bg-blue-600 text-white rounded text-sm" @click="addTask">Añadir tarea</button>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-3">
          <button type="button" class="px-4 py-2 border rounded" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  props: ['token'],
  data(){
    return {
      lawyer: { name:'', email:'', phone:'', province:'', municipality:'', specialization:'' },
      tasks: []
    }
  },
  methods: {
    addTask(){ this.tasks.push({ description:'', category:'', startDate:'', endDate:'', startTime:'', endTime:'' }) },
    removeTask(i){ this.tasks.splice(i,1) },
    async onSubmit(){
      try{
        const headers = this.token ? { Authorization: 'Bearer ' + this.token } : {};
        // create lawyer
        const lawRes = await axios.post((import.meta.env.VITE_API_URL||'/api') + '/lawyers', this.lawyer, { headers });
        const createdLawyer = lawRes.data;

        // create tasks (if any) using startDate/endDate range support
        for(const t of this.tasks){
          if(!t.startDate || !t.endDate) continue;
          const payload = {
            type: 'task',
            lawyerId: createdLawyer.id,
            description: t.description,
            category: t.category,
            startDate: t.startDate,
            endDate: t.endDate,
            startTime: t.startTime || null,
            endTime: t.endTime || null
          };
          await axios.post((import.meta.env.VITE_API_URL||'/api') + '/schedules', payload, { headers });
        }

        this.$emit('added', createdLawyer);
        this.$emit('close');
      }catch(err){
        console.error(err);
        alert('Error al crear abogado: ' + (err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message));
      }
    }
  }
}
</script>

<style scoped>
.z-50{ z-index: 50 }
</style>
