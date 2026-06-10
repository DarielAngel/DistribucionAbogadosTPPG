<template>
  <div>
    <div class="mb-3">
      <label>Ver por fecha:</label>
      <input type="date" v-model="date" class="border p-1 ml-2" @change="fetch" />
    </div>
    <div v-if="items.length===0">No hay entradas para la fecha seleccionada.</div>
    <ul>
      <li v-for="it in items" :key="it.id" class="border p-2 mb-1">
        <div class="font-semibold">{{ it.Lawyer?.name || '—' }} — {{ it.type }}</div>
        <div class="text-sm">{{ it.date }} {{ it.startTime || '' }} — {{ it.description || '' }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  props: ['token'],
  data(){ return { date: new Date().toISOString().slice(0,10), items: [] } },
  created(){ this.fetch() },
  methods: {
    async fetch(){
      const res = await axios.get((import.meta.env.VITE_API_URL||'/api') + '/schedules?date=' + this.date, { headers: { Authorization: 'Bearer ' + this.token } });
      this.items = res.data;
    }
  }
}
</script>
