<template>
  <div>
    <div class="mb-2">
      <input v-model="q" placeholder="Buscar por nombre/provincia/municipio" class="border p-2 w-full" @input="search" />
    </div>
    <ul>
      <li v-for="l in lawyers" :key="l.id" class="border p-2 mb-1">
        <div class="font-semibold">{{ l.name }}</div>
        <div class="text-sm">{{ l.province }} - {{ l.municipality }} • {{ l.specialization }}</div>
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
      const res = await axios.get((import.meta.env.VITE_API_URL||'/api') + '/lawyers', { headers: { Authorization: 'Bearer ' + this.token } });
      this.lawyers = res.data;
    },
    search(){
      // simplistic client-side filter for scaffold
      const q = this.q.toLowerCase();
      this.lawyers = this.lawyers.filter(x => x.name.toLowerCase().includes(q) || (x.province||'').toLowerCase().includes(q) || (x.municipality||'').toLowerCase().includes(q));
    }
  }
}
</script>
