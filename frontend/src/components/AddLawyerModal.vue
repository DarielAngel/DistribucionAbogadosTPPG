<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded shadow-lg w-11/12 max-w-2xl p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-medium">Adicionar abogado</h3>
        <button class="text-gray-500" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-3" novalidate>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="lawyer-name" class="block text-sm font-medium">Nombre <span class="text-red-600">*</span></label>
            <input id="lawyer-name" ref="firstInput" v-model="lawyer.name" required placeholder="Ej. Ana Pérez" class="border p-2 w-full rounded" aria-required="true" />
          </div>
          <div>
            <label for="lawyer-email" class="block text-sm font-medium">Email <span class="text-red-600">*</span></label>
            <input id="lawyer-email" v-model="lawyer.email" type="email" required placeholder="ejemplo@correo.com" class="border p-2 w-full rounded" aria-required="true" />
          </div>
          <div>
            <label for="lawyer-phone" class="block text-sm font-medium">Teléfono</label>
            <input id="lawyer-phone" v-model="lawyer.phone" placeholder="(opcional)" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label for="lawyer-spec" class="block text-sm font-medium">Especialidad</label>
            <input id="lawyer-spec" v-model="lawyer.specialization" placeholder="Ej. Civil, Familiar" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label for="lawyer-province" class="block text-sm font-medium">Provincia</label>
            <input id="lawyer-province" v-model="lawyer.province" placeholder="Ej. Provincia A" class="border p-2 w-full rounded" />
          </div>
          <div>
            <label for="lawyer-municipality" class="block text-sm font-medium">Municipio</label>
            <input id="lawyer-municipality" v-model="lawyer.municipality" placeholder="Ej. Municipio 1" class="border p-2 w-full rounded" />
          </div>
        </div>

        <div>
          <h4 class="font-medium">Tareas (opcional)</h4>
          <p class="text-xs text-gray-600">Agrega rangos de fechas y horas para crear entradas en el cronograma. Dejar vacío creará solo el abogado.</p>
          <div v-if="tasks.length===0" class="text-sm text-gray-500 mt-2">No hay tareas añadidas todavía.</div>
          <div v-for="(t, idx) in tasks" :key="idx" class="border rounded p-3 mt-2">
            <div class="flex justify-between items-center mb-2">
              <div class="text-sm font-medium">Tarea {{ idx+1 }}</div>
              <button type="button" class="text-sm text-red-600 hover:underline" @click="removeTask(idx)">Eliminar tarea</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-sm">Descripción</label>
                <input v-model="t.description" placeholder="Breve descripción" class="border p-2 w-full rounded" />
              </div>
              <div>
                <label class="text-sm">Categoría</label>
                <select v-model="t.category" class="border p-2 w-full rounded">
                  <option value="">(ninguna)</option>
                  <option>Administrativo</option>
                  <option>Civil</option>
                  <option>Laboral</option>
                  <option>Familiar</option>
                </select>
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
            <button type="button" class="px-3 py-1 bg-blue-600 text-white rounded text-sm" @click="addTask">+ Añadir tarea</button>
          </div>
        </div>

        <div class="flex justify-between items-center gap-2 mt-3">
          <div class="text-sm text-green-600" v-if="successMessage">{{ successMessage }}</div>
          <div class="flex justify-end gap-2">
            <button type="button" class="px-4 py-2 border rounded" @click="$emit('close')">Cancelar</button>
            <button type="submit" :disabled="!canSave || saving" class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60">
              <span v-if="!saving">Crear abogado</span>
              <span v-else>Guardando...</span>
            </button>
          </div>
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
      tasks: [],
      saving: false,
      successMessage: ''
    }
  },
  computed: {
    canSave(){ return this.lawyer.name && this.lawyer.email }
  },
  mounted(){
    // focus first input for accessibility
    this.$nextTick(()=>{ if(this.$refs.firstInput) this.$refs.firstInput.focus(); });
  },
  methods: {
    addTask(){
      const today = new Date().toISOString().slice(0,10);
      this.tasks.push({ description:'', category:'', startDate: today, endDate: today, startTime:'', endTime:'' })
    },
    removeTask(i){ this.tasks.splice(i,1) },
    async onSubmit(){
      if(!this.canSave) { this.successMessage = ''; return; }
      try{
        this.saving = true;
        const headers = this.token ? { Authorization: 'Bearer ' + this.token } : {};
        // create lawyer
        const lawRes = await axios.post((import.meta.env.VITE_API_URL||'/api') + '/lawyers', this.lawyer, { headers });
        const createdLawyer = lawRes.data;

        // create tasks (if any) using startDate/endDate range support
        for(const t of this.tasks){
          if(!t.startDate || !t.endDate) continue;
          // ensure endDate >= startDate
          if(new Date(t.endDate) < new Date(t.startDate)) t.endDate = t.startDate;
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

        this.successMessage = 'Abogado creado correctamente';
        // emit added and close after short delay so user sees message
        this.$emit('added', createdLawyer);
        setTimeout(()=>{ this.$emit('close'); }, 600);
      }catch(err){
        console.error(err);
        alert('Error al crear abogado: ' + (err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message));
      }finally{
        this.saving = false;
      }
    }
  }
}
</script>

<style scoped>
.z-50{ z-index: 50 }
</style>
