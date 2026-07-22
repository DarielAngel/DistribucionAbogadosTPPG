<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-4 rounded w-11/12 max-w-2xl">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold">Herramientas administrativas</h3>
        <button class="text-sm text-gray-600" @click="$emit('close')">Cerrar</button>
      </div>
      <div class="space-y-3">
        <div>
          <button class="px-3 py-1 bg-blue-600 text-white rounded" @click="checkDb">Comprobar BD</button>
          <span class="ml-3 text-sm text-gray-600">{{ dbStatus }}</span>
        </div>
        <div>
          <button class="px-3 py-1 bg-green-600 text-white rounded" @click="fetchCounts">Ver conteos</button>
          <div v-if="counts" class="mt-2 text-sm text-gray-700">Usuarios: {{ counts.users }} — Abogados: {{ counts.lawyers }} — Tareas: {{ counts.schedules }}</div>
        </div>
        <div>
          <div class="text-sm font-medium mb-1">Exportar CSV</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 border rounded" @click="exportTable('users')">Exportar usuarios</button>
            <button class="px-3 py-1 border rounded" @click="exportTable('lawyers')">Exportar abogados</button>
            <button class="px-3 py-1 border rounded" @click="exportTable('schedules')">Exportar tareas</button>
          </div>
          <div v-if="exportMsg" class="mt-2 text-sm text-gray-600">{{ exportMsg }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { baseUrl, buildHeaders } from '../utils/apiClient'

export default {
  props: ['token'],
  data(){ return { dbStatus: '', counts: null, exportMsg: '' } },
  methods: {
    async checkDb(){
      this.dbStatus = 'Comprobando…';
      try{
        const res = await axios.get(baseUrl('/admin/db-status'), { headers: buildHeaders(this.token) });
        this.dbStatus = res.data && res.data.ok ? 'OK' : 'Error';
      }catch(e){ this.dbStatus = 'Error'; }
    },
    async fetchCounts(){
      try{
        const res = await axios.get(baseUrl('/admin/tables'), { headers: buildHeaders(this.token) });
        this.counts = res.data.counts;
      }catch(e){ this.counts = null; }
    },
    async exportTable(t){
      this.exportMsg = 'Preparando export…';
      try{
        const res = await axios.get(baseUrl('/admin/export/'+t), { headers: buildHeaders(this.token), responseType: 'blob' });
        if(res.status === 204){ this.exportMsg = 'Sin datos para exportar'; return; }
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url; a.download = t + '.csv'; document.body.appendChild(a); a.click(); a.remove();
        this.exportMsg = 'Descarga iniciada';
      }catch(e){ this.exportMsg = 'Error en export'; }
    }
  }
}
</script>
