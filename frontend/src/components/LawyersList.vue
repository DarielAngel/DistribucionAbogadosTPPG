<template>
  <div>
    <div class="mb-2">
      <input v-model="q" placeholder="Buscar por nombre/provincia/municipio" class="border p-2 w-full" @input="onSearchInput" />
    </div>
    <ul>
      <li v-for="l in lawyers" :key="l.id" class="border p-2 mb-1 cursor-pointer hover:bg-red-50" @click="$emit('select', l)">
        <div class="font-semibold text-sm">{{ l.name }}</div>
        <div class="text-xs text-gray-600">{{ l.province }} - {{ l.municipality }} • {{ l.specialization }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  props: ['token'],
  data(){ return { lawyers: [], q: '' } },
  created(){ this.fetch() },
  methods: {
    async fetch(){
      const base = (import.meta.env.VITE_API_URL||'/api');
      const res = await axios.get(base + '/lawyers?page=1&pageSize=100', { headers: { Authorization: 'Bearer ' + this.token } });
      // API returns { items, total }
      this.lawyers = res.data.items || res.data;
    },
    async onSearchInput(){
      // debounce minimal
      const q = this.q.trim();
      const base = (import.meta.env.VITE_API_URL||'/api');
      if(q.length<1){ return this.fetch(); }
      const res = await axios.get(base + `/lawyers?name=${encodeURIComponent(q)}&page=1&pageSize=100`, { headers: { Authorization: 'Bearer ' + this.token } });
      this.lawyers = res.data.items || res.data;
    }
  }
}
</script>
