<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
      <!-- Header -->
      <div class="bg-[#6B0B0B] text-white px-5 py-4 flex items-center justify-between">
        <div>
          <h2 class="font-bold text-lg leading-tight">Configuración</h2>
          <p class="text-red-200 text-xs mt-0.5">Días no laborables</p>
        </div>
        <button class="text-white hover:text-red-200 text-2xl leading-none" @click="$emit('close')">×</button>
      </div>

      <!-- Body -->
      <div class="px-5 py-4">
        <p class="text-sm text-gray-500 mb-4">Marca los días en que <strong>no</strong> se pueden asignar tareas.</p>
        <div class="grid grid-cols-2 gap-2">
          <label v-for="d in days" :key="d.value"
            :class="['flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-colors',
              selected.includes(d.value) ? 'bg-red-50 border-red-300 text-red-800' : 'border-gray-200 hover:bg-gray-50']">
            <input type="checkbox" :value="d.value" v-model="selected" class="accent-[#6B0B0B] w-4 h-4" />
            <span class="text-sm font-medium">{{ d.label }}</span>
          </label>
        </div>
        <p v-if="selected.length === 7" class="text-orange-600 text-xs mt-3">
          ⚠ Todos los días están bloqueados — no se podrán crear tareas.
        </p>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3 bg-gray-50 border-t flex justify-end gap-2">
        <button class="px-4 py-1.5 text-sm rounded-lg border bg-white hover:bg-gray-100 text-gray-700" @click="$emit('close')">
          Cancelar
        </button>
        <button class="px-4 py-1.5 text-sm rounded-lg bg-[#6B0B0B] text-white hover:bg-red-900 disabled:opacity-50"
          :disabled="saving" @click="save">
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { baseUrl, buildHeaders } from '../utils/apiClient'
import { showToast } from '../utils/toast'

const DAY_LABELS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

export default {
  props: { token: String, blockedDays: { type: Array, default: () => [0, 5, 6] } },
  emits: ['close', 'saved'],
  data(){
    return {
      days: DAY_LABELS.map((label, value) => ({ label, value })),
      selected: [...this.blockedDays],
      saving: false
    }
  },
  methods: {
    async save(){
      try{
        this.saving = true;
        await axios.put(baseUrl('/config/blocked-days'), { blockedDays: this.selected }, { headers: buildHeaders(this.token) });
        showToast('Configuración guardada', 'success');
        this.$emit('saved', this.selected);
        this.$emit('close');
      }catch(err){
        showToast(err.response?.data?.message || 'Error al guardar', 'error');
      }finally{
        this.saving = false;
      }
    }
  }
}
</script>
