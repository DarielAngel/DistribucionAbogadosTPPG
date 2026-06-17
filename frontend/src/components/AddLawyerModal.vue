<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white text-black rounded shadow-lg w-11/12 max-w-2xl p-4 max-h-[90vh] overflow-auto">
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

        <div class="text-sm text-gray-600">Una vez creado el abogado, podrá añadirle tareas desde la sección del abogado seleccionado.</div>

        <div class="flex justify-between items-center gap-2 mt-3">
          <div class="text-sm text-green-600" v-if="successMessage">{{ successMessage }}</div>
            <div class="flex justify-end gap-2">
              <button type="button" class="px-4 py-2 border rounded bg-gray-100" @click="$emit('close')">Cancelar</button>
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
import { showToast } from '../utils/toast'
import { baseUrl, buildHeaders } from '../utils/apiClient'
export default {
  props: ['token'],
  data(){
    return {
      lawyer: { name:'', email:'', phone:'', province:'', municipality:'', specialization:'' },
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
    
    async onSubmit(){
      if(!this.canSave) { this.successMessage = ''; return; }
      try{
        this.saving = true;
        const headers = this.token ? { Authorization: 'Bearer ' + this.token } : {};
        // create lawyer
        const lawRes = await axios.post(baseUrl('/lawyers'), this.lawyer, { headers: buildHeaders(this.token) });
        const createdLawyer = lawRes.data;

        this.successMessage = 'Abogado creado correctamente';
        showToast('Abogado creado', 'success');
        this.$emit('added', createdLawyer);
        setTimeout(()=>{ this.$emit('close'); }, 300);
      }catch(err){
        console.error(err);
        showToast('Error al crear abogado', 'error');
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
