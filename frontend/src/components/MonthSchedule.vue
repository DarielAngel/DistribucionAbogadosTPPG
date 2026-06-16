<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium">Cronograma del mes</h3>
      <div class="flex items-center gap-3">
          <div class="text-sm text-gray-600">{{ monthLabel }}</div>
          <select v-model.number="month" @change="fetchPage" class="border rounded px-2 py-1 text-sm">
            <option v-for="(m,i) in monthNames" :key="i" :value="i">{{ m }}</option>
          </select>
          <select v-model.number="year" @change="fetchPage" class="border rounded px-2 py-1 text-sm">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
          <button class="px-2 py-1 border rounded bg-white text-sm" @click="fetchPage">Refrescar</button>
        </div>
    </div>
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <label class="text-sm">Filas por página:</label>
        <select v-model.number="pageSize" @change="changePageSize()" class="border rounded px-2 py-1">
          <option v-for="s in pageSizes" :key="s" :value="s">{{ s }}</option>
        </select>
        <button v-if="!expandedPageSizes" class="text-sm text-blue-600 ml-2" @click="expandPageSizes">Más opciones</button>
        <div class="text-sm text-gray-600">Mostrando {{ (page-1)*pageSize + 1 }} - {{ Math.min(page*pageSize, totalCount) }} de {{ totalCount }}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-2 py-1 border rounded bg-white" :disabled="page===1" @click="prevPage">Anterior</button>
        <div class="text-sm">Página {{ page }} / {{ totalPages }}</div>
        <button class="px-2 py-1 border rounded bg-white" :disabled="page===totalPages" @click="nextPage">Siguiente</button>
      </div>
    </div>
    <!-- Top synchronized scrollbar -->
    <div ref="topScroll" class="overflow-x-auto overflow-y-hidden" style="height:16px;">
      <div ref="topInner" style="height:1px;"></div>
    </div>
    <div ref="bottomScroll" class="overflow-auto border rounded">
      <table ref="tableRef" class="min-w-full table-fixed text-sm">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th class="p-2 w-36">Abogado</th>
            <th v-for="d in daysInMonth" :key="d" class="p-1 text-center w-10">{{ d }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lawyer in pagedLawyers" :key="lawyer.id" class="odd:bg-white even:bg-gray-50 hover:bg-red-50">
            <td class="p-2 align-top"> <div class="font-medium">{{ lawyer.name }}</div><div class="text-xs text-gray-600">{{ lawyer.specialization }}</div></td>
            <td v-for="d in daysInMonth" :key="lawyer.id + '-' + d" class="p-1 align-top text-center cursor-pointer" @click="onCellClick(lawyer,d)">
              <div v-if="map[lawyer.id] && map[lawyer.id][d]" class="flex flex-col items-center">
                <div class="inline-block bg-red-100 text-red-800 px-1 rounded text-xxs">Ocupado</div>
              </div>
              <div v-else class="text-green-600">Libre</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination inferior (duplicada, se sincroniza con el superior) -->
    <div class="flex items-center justify-between mt-2">
      <div class="flex items-center gap-2">
        <label class="text-sm">Filas por página:</label>
        <select v-model.number="pageSize" @change="changePageSize()" class="border rounded px-2 py-1">
          <option v-for="s in pageSizes" :key="s + '-bottom'" :value="s">{{ s }}</option>
        </select>
        <button v-if="!expandedPageSizes" class="text-sm text-blue-600 ml-2" @click="expandPageSizes">Más opciones</button>
        <div class="text-sm text-gray-600">Mostrando {{ (page-1)*pageSize + 1 }} - {{ Math.min(page*pageSize, totalCount) }} de {{ totalCount }}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-2 py-1 border rounded bg-white" :disabled="page===1" @click="prevPage">Anterior</button>
        <div class="text-sm">Página {{ page }} / {{ totalPages }}</div>
        <button class="px-2 py-1 border rounded bg-white" :disabled="page===totalPages" @click="nextPage">Siguiente</button>
      </div>
    </div>
    <!-- Detalle de la casilla seleccionada -->
    <div v-if="selectedCell" class="fixed right-6 bottom-6 bg-white border rounded shadow-lg p-4 w-72 z-50">
      <div class="flex justify-between items-center mb-2">
        <div class="font-medium">Detalle del día</div>
        <button class="text-sm text-gray-500" @click="selectedCell = null">Cerrar</button>
      </div>
      <div class="text-sm text-gray-700 mb-1"><strong>Abogado:</strong> {{ selectedCell.lawyer.name }}</div>
      <div class="text-sm text-gray-700 mb-1"><strong>Día:</strong> {{ selectedCell.day }} de {{ monthLabel }}</div>
      <div class="text-sm text-gray-700"><strong>Tarea:</strong>
        <div v-if="selectedCell.tasks && selectedCell.tasks.length">
          <ul class="list-disc pl-5 mt-1">
            <li v-for="t in selectedCell.tasks" :key="t.id">{{ t.type || t.description || 'Tarea sin título' }} — {{ t.startTime || 'hora no especificada' }}</li>
          </ul>
        </div>
        <div v-else class="text-gray-500 mt-1">Ninguna tarea</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  props: ['token','pageSizeProp','selectedLawyers'],
  data(){
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), lawyers: [], schedules: [], map: {}, _totalPages: 1,
      // pagination
      page: 1,
      pageSize: (typeof this.pageSizeProp !== 'undefined' ? this.pageSizeProp : 10),
      // start with only 10 available, expand on user request
      pageSizes: [10],
      expandedPageSizes: false,
      totalCount: 0,
      selectedCell: null
    };
  },
  computed: {
    monthNames(){ return Array.from({length:12},(_,i)=> new Date(0,i).toLocaleString(undefined,{month:'long'})) },
    yearOptions(){ const y = new Date().getFullYear(); return Array.from({length:11},(_,i)=> y-5+i) },
    daysInMonth(){ return new Date(this.year, this.month+1, 0).getDate(); },
    monthLabel(){ return new Date(this.year, this.month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' }) },
    totalPages(){ return this._totalPages || 1; },
    pagedLawyers(){ return this.lawyers || []; }
  },
  mounted(){
    // sync top and bottom scrolls
    const top = this.$refs.topScroll;
    const bottom = this.$refs.bottomScroll;
    if(top && bottom){
      top.addEventListener('scroll', ()=>{ bottom.scrollLeft = top.scrollLeft });
      bottom.addEventListener('scroll', ()=>{ top.scrollLeft = bottom.scrollLeft });
    }
  },
  created(){ this.fetchPage() },
  watch: {
    selectedLawyers: { handler(){ this.page = 1; this.fetchPage(); }, deep: true }
  },
  methods: {
    onCellClick(lawyer, day){
      const tasks = (this.map[lawyer.id] && this.map[lawyer.id][day]) || [];
      this.selectedCell = { lawyer, day, tasks };
    },
    expandPageSizes(){
      this.pageSizes = [10,25,50,100];
      this.expandedPageSizes = true;
    },
    async fetchPage(){
      const headers = this.token ? { Authorization: 'Bearer ' + this.token } : {};
      const base = (import.meta.env.VITE_API_URL||'/api');

      // If a selection filter is active, use it as the source and paginate client-side
      if(this.selectedLawyers && this.selectedLawyers.length){
        const source = this.selectedLawyers;
        this.totalCount = source.length;
        this._totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
        const startIndex = (this.page - 1) * this.pageSize;
        const visible = source.slice(startIndex, startIndex + this.pageSize);
        this.lawyers = visible;

        const start = `${this.year}-${String(this.month+1).padStart(2,'0')}-01`;
          const end = `${this.year}-${String(this.month+1).padStart(2,'0')}-${String(this.daysInMonth).padStart(2,'0')}`;
        const ids = visible.map(l=>l.id).filter(Boolean).join(',');
        const schedRes = await axios.get(base + `/schedules?startDate=${start}&endDate=${end}` + (ids ? `&lawyerIds=${ids}` : ''), { headers });
        this.schedules = schedRes.data || [];

        const m = {};
        for(const s of this.schedules){
          const ld = new Date(s.date);
          const day = ld.getDate();
          if(!m[s.lawyerId]) m[s.lawyerId] = {};
          if(!m[s.lawyerId][day]) m[s.lawyerId][day] = [];
          m[s.lawyerId][day].push(s);
        }
        this.map = m;
        this.$nextTick(()=>{
          try{
            const table = this.$refs.tableRef;
            const topInner = this.$refs.topInner;
            if(table && topInner) topInner.style.width = table.scrollWidth + 'px';
          }catch(e){/* ignore */}
        })
        return;
      }

      // Default: server-side paged lawyers
      const lawRes = await axios.get(base + `/lawyers?page=${this.page}&pageSize=${this.pageSize}`, { headers });
      this.lawyers = lawRes.data.items || lawRes.data || [];
      const total = (lawRes.data && lawRes.data.total) || (Array.isArray(lawRes.data) ? lawRes.data.length : 0);
      this.totalCount = total;
      this._totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));

      const start = `${this.year}-${String(this.month+1).padStart(2,'0')}-01`;
      const end = `${this.year}-${String(this.month+1).padStart(2,'0')}-${String(this.daysInMonth).padStart(2,'0')}`;
      const ids = this.lawyers.map(l=>l.id).filter(Boolean).join(',');
      const schedRes = await axios.get(base + `/schedules?startDate=${start}&endDate=${end}` + (ids ? `&lawyerIds=${ids}` : ''), { headers });
      this.schedules = schedRes.data || [];

      const m = {};
      for(const s of this.schedules){
        const ld = new Date(s.date);
        const day = ld.getDate();
        if(!m[s.lawyerId]) m[s.lawyerId] = {};
        if(!m[s.lawyerId][day]) m[s.lawyerId][day] = [];
        m[s.lawyerId][day].push(s);
      }
      this.map = m;
      this.$nextTick(()=>{
        try{
          const table = this.$refs.tableRef;
          const topInner = this.$refs.topInner;
          if(table && topInner) topInner.style.width = table.scrollWidth + 'px';
        }catch(e){/* ignore */}
      })
    },
    async reload(){
      this.page = 1;
      await this.fetchPage();
    },
    async changePageSize(size){
      if(typeof size !== 'undefined') this.pageSize = size;
      this.page = 1;
      await this.fetchPage();
    },
    async prevPage(){ if(this.page>1){ this.page--; await this.fetchPage(); } },
    async nextPage(){ if(this.page < this.totalPages){ this.page++; await this.fetchPage(); } }
  }
}
</script>

<style scoped>
.text-xxs{ font-size:10px }
</style>
