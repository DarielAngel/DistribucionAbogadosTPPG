<template>
  <div>
    <div class="mb-2 relative">
      <input v-model="q" placeholder="Buscar por nombre/provincia/municipio" class="border p-2 w-full" @input="onSearchInput" @keydown="onKeyDown" @blur="onBlur" />
      <ul v-if="showSuggestions && suggestions.length" class="absolute left-0 right-0 bg-white border mt-1 z-50 max-h-56 overflow-auto">
        <li v-for="(s, idx) in suggestions" :key="s.id" :class="['px-3 py-2 cursor-pointer hover:bg-gray-100', { 'bg-gray-100': idx===selectedSuggestionIndex } ]" @mousedown.prevent="selectSuggestion(s)">
          <div class="font-medium text-sm">{{ s.name }}</div>
          <div class="text-xs text-gray-600">{{ s.province }} - {{ s.municipality }}</div>
        </li>
      </ul>
    </div>
    <ul>
      <li v-for="l in lawyers" :key="l.id" :class="['border p-2 mb-1 hover:bg-red-50', { 'bg-blue-50': selectedIds.includes(l.id) } ]">
        <div class="flex items-start">
          <input type="checkbox" class="mt-1 mr-3" :checked="selectedIds.includes(l.id)" @change.stop="toggleSelect(l)" />
          <div class="flex-1 cursor-pointer" @click="$emit('select', l)">
            <div class="font-semibold text-sm">{{ l.name }}</div>
            <div class="text-xs text-gray-600">{{ l.province }} - {{ l.municipality }} • {{ l.specialization }}</div>
          </div>
          <div class="ml-3 flex items-center gap-2">
            <button v-if="isAdmin" class="text-sm text-red-600 px-2 py-1 border rounded" @click.stop="confirmDelete(l)">Eliminar</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'
import debounce from '../utils/debounce'
export default {
  props: { token: String, isAdmin: { type: Boolean, default: false } },
  data(){ return { lawyers: [], q: '', suggestions: [], showSuggestions: false, selectedSuggestionIndex: -1, selectedIds: [] } },
  created(){ this.fetch(); this.debouncedQuery = debounce(this._doSearch, 300) },
  methods: {
    // debounce moved to `src/utils/debounce.js`
    async fetch(){
      const base = (import.meta.env.VITE_API_URL||'/api');
      const url = base + '/lawyers?page=1&pageSize=100'
      const res = await axios.get(url, { headers: this.token ? { Authorization: 'Bearer ' + this.token } : {} });
      // API returns { items, total }
      this.lawyers = res.data.items || res.data;
    },
    onSearchInput(){
      const q = this.q.trim();
      if(q.length<1){ this.showSuggestions = false; this.suggestions = []; return this.fetch(); }
      this.debouncedQuery(q);
    },
    async _doSearch(q){
      const base = (import.meta.env.VITE_API_URL||'/api');
      // fetch suggestions
      try{
        const url1 = base + `/lawyers?name=${encodeURIComponent(q)}&page=1&pageSize=8`
        const res = await axios.get(url1, { headers: this.token ? { Authorization: 'Bearer ' + this.token } : {} });
        const items = res.data.items || res.data || [];
        this.suggestions = items.slice(0,8);
        this.showSuggestions = true;
        this.selectedSuggestionIndex = -1;
      }catch(e){ this.suggestions = []; this.showSuggestions = false }
      // update full list
      try{
        const url2 = base + `/lawyers?name=${encodeURIComponent(q)}&page=1&pageSize=100`
        const res2 = await axios.get(url2, { headers: this.token ? { Authorization: 'Bearer ' + this.token } : {} });
        this.lawyers = res2.data.items || res2.data || [];
      }catch(e){ /* ignore */ }
    },
    onKeyDown(e){
      if(!this.showSuggestions) return;
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, this.suggestions.length - 1);
      }else if(e.key === 'ArrowUp'){
        e.preventDefault();
        this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, 0);
      }else if(e.key === 'Enter'){
        e.preventDefault();
        if(this.selectedSuggestionIndex >= 0 && this.suggestions[this.selectedSuggestionIndex]){
          this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex]);
        }
      }else if(e.key === 'Escape'){
        this.showSuggestions = false;
      }
    },
    onBlur(){
      // small timeout to allow click to register
      setTimeout(()=>{ this.showSuggestions = false; }, 150);
    },
    selectSuggestion(s){
      this.q = s.name;
      this.showSuggestions = false;
      this.suggestions = [];
      this.$emit('select', s);
    }
    ,
    toggleSelect(l){
      const id = l.id;
      const idx = this.selectedIds.indexOf(id);
      if(idx === -1) this.selectedIds.push(id);
      else this.selectedIds.splice(idx,1);
      const selected = this.lawyers.filter(x => this.selectedIds.includes(x.id));
      this.$emit('selection', selected);
    },
    async confirmDelete(l){
      if(!confirm(`¿Eliminar al abogado "${l.name}"? Esta acción no se puede deshacer.`)) return;
      await this.deleteLawyer(l);
    },
    async deleteLawyer(l){
      try{
        const base = (import.meta.env.VITE_API_URL||'/api');
        await axios.delete(base + `/lawyers/${l.id}`, { headers: this.token ? { Authorization: 'Bearer ' + this.token } : {} });
        // remove locally
        this.lawyers = this.lawyers.filter(x => x.id !== l.id);
        // clear selection if present
        const sidx = this.selectedIds.indexOf(l.id);
        if(sidx !== -1) this.selectedIds.splice(sidx, 1);
        this.$emit('selection', this.lawyers.filter(x => this.selectedIds.includes(x.id)));
        this.$emit('deleted', l.id);
      }catch(err){
        console.error(err);
        alert('Error al eliminar: ' + (err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message));
      }
    }
  }
}
</script>
