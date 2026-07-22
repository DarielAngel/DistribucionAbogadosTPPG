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
        <button type="button" class="px-2 py-1 border rounded bg-white text-sm" @click="reload">Refrescar</button>
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
            <th class="p-2 w-36 border-r">Abogado</th>
            <th v-for="d in daysInMonth" :key="d"
              :class="['p-1 text-center w-12 border-r last:border-r-0', dayColClass(d)]">
              <div class="font-semibold text-sm">{{ d }}</div>
              <div class="text-xs font-normal" :class="isWeekend(d) ? 'text-gray-400' : 'text-gray-500'">
                {{ dayLabel(d) }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lawyer in pagedLawyers" :key="lawyer.id" class="odd:bg-white even:bg-gray-50 hover:bg-red-50 border-b last:border-b-0">
            <td class="p-2 align-top border-r">
              <div class="font-medium text-sm leading-tight">{{ lawyer.name }}</div>
              <div class="text-xs text-gray-500">{{ lawyer.specialization }}</div>
            </td>
            <td v-for="d in daysInMonth" :key="lawyer.id + '-' + d"
              :class="['p-1 align-top text-center border-r last:border-r-0', isWeekend(d) ? 'bg-gray-100 cursor-default' : 'cursor-pointer hover:bg-red-50']"
              @click="!isWeekend(d) && onCellClick(lawyer, d)">
              <template v-if="isWeekend(d)">
                <span class="text-gray-300 text-xs">—</span>
              </template>
              <template v-else>
                <div v-if="map[lawyer.id] && map[lawyer.id][d]">
                  <span class="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                    Ocupado
                  </span>
                </div>
                <div v-else>
                  <span class="text-green-600 text-xs">Libre</span>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination inferior -->
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

    <!-- Panel Detalles del Día -->
    <div v-if="selectedCell" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" @click.self="selectedCell = null">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <!-- Header -->
        <div class="bg-[#6B0B0B] text-white px-5 py-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs uppercase tracking-wider text-red-200 mb-0.5">Detalles del día</p>
              <h2 class="text-lg font-bold leading-tight">{{ selectedCellDateLabel }}</h2>
            </div>
            <button class="text-white hover:text-red-200 text-2xl leading-none ml-4 mt-0.5" @click="selectedCell = null">×</button>
          </div>
          <div class="mt-2 flex items-center gap-2 text-sm text-red-100">
            <span>👤</span>
            <span class="font-medium">{{ selectedCell.lawyer.name }}</span>
            <span v-if="selectedCell.lawyer.specialization" class="text-red-300">· {{ selectedCell.lawyer.specialization }}</span>
          </div>
        </div>

        <!-- Body -->
        <div class="px-5 py-4 max-h-96 overflow-y-auto">
          <div v-if="selectedCell.tasks && selectedCell.tasks.length">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-3">{{ selectedCell.tasks.length }} tarea{{ selectedCell.tasks.length > 1 ? 's' : '' }}</p>
            <div v-for="t in selectedCell.tasks" :key="t.id"
              class="mb-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
              <div class="flex items-start justify-between gap-2">
                <p class="font-semibold text-gray-800 text-sm leading-tight">{{ t.description || t.type || 'Tarea sin título' }}</p>
                <span v-if="t.category" :class="['text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap', categoryClass(t.category)]">
                  {{ t.category }}
                </span>
              </div>
              <div v-if="t.startTime || t.endTime" class="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                <span>🕐</span>
                <span>{{ t.startTime ? t.startTime.slice(0,5) : '' }}{{ t.startTime && t.endTime ? ' – ' : '' }}{{ t.endTime ? t.endTime.slice(0,5) : '' }}</span>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center">
            <div class="text-4xl mb-2">📭</div>
            <p class="text-gray-500 text-sm">Sin tareas para este día</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 bg-gray-50 border-t flex justify-end">
          <button class="px-4 py-1.5 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium" @click="selectedCell = null">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import sse from '../utils/sse'
import debounce from '../utils/debounce'
import { baseUrl, buildHeaders } from '../utils/apiClient'
import { sortByName } from '../utils/sort'

const DAY_ABBR = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const CATEGORY_CLASSES = {
  'Administrativo': 'bg-blue-100 text-blue-700',
  'Civil':          'bg-purple-100 text-purple-700',
  'Laboral':        'bg-orange-100 text-orange-700',
  'Familiar':       'bg-green-100 text-green-700',
}

export default {
  props: { token: String, pageSizeProp: Number, selectedLawyers: Array, blockedDays: { type: Array, default: () => [0, 5, 6] } },
  data(){
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      lawyers: [],
      schedules: [],
      map: {},
      _totalPages: 1,
      page: 1,
      pageSize: (typeof this.pageSizeProp !== 'undefined' ? this.pageSizeProp : 10),
      pageSizes: [10],
      expandedPageSizes: false,
      totalCount: 0,
      selectedCell: null,
      today: now
    };
  },
  computed: {
    monthNames(){ return Array.from({length:12},(_,i)=> new Date(0,i).toLocaleString(undefined,{month:'long'})) },
    yearOptions(){ const y = new Date().getFullYear(); return Array.from({length:11},(_,i)=> y-5+i) },
    daysInMonth(){ return new Date(this.year, this.month+1, 0).getDate(); },
    monthLabel(){ return new Date(this.year, this.month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' }) },
    totalPages(){ return this._totalPages || 1; },
    pagedLawyers(){ return this.lawyers || []; },
    selectedCellDateLabel(){
      if(!this.selectedCell) return '';
      const d = new Date(this.year, this.month, this.selectedCell.day);
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    }
  },
  created(){
    this.reloadDebounced = debounce(()=> this.reload(), 200);
    this.fetchPage();
  },
  mounted(){
    const top = this.$refs.topScroll;
    const bottom = this.$refs.bottomScroll;
    if(top && bottom){
      top.addEventListener('scroll', ()=>{ bottom.scrollLeft = top.scrollLeft });
      bottom.addEventListener('scroll', ()=>{ top.scrollLeft = bottom.scrollLeft });
    }
    this._onScheduleCreated = (e) => { this._handleScheduleEvent(e && e.detail ? e.detail : e); };
    this._onScheduleUpdated = (e) => { this._handleScheduleEvent(e && e.detail ? e.detail : e); };
    this._onScheduleDeleted = (e) => { this._handleScheduleDeleted(e && e.detail ? e.detail : e); };
    this._onLawyerCreated = (e) => { const l = e && e.detail ? e.detail : e; if(l && l.id) this.reloadDebounced(); };
    try{
      if(sse && sse.addEventListener){
        sse.addEventListener('schedule:created', this._onScheduleCreated);
        sse.addEventListener('schedule:updated', this._onScheduleUpdated);
        sse.addEventListener('schedule:deleted', this._onScheduleDeleted);
        sse.addEventListener('lawyer:created', this._onLawyerCreated);
      }
    }catch(e){}
  },
  beforeUnmount(){
    try{
      if(sse && sse.removeEventListener){
        sse.removeEventListener('schedule:created', this._onScheduleCreated);
        sse.removeEventListener('schedule:updated', this._onScheduleUpdated);
        sse.removeEventListener('schedule:deleted', this._onScheduleDeleted);
        sse.removeEventListener('lawyer:created', this._onLawyerCreated);
      }
    }catch(e){}
  },
  watch: {
    selectedLawyers: { handler(){ this.page = 1; this.fetchPage(); }, deep: true },
    blockedDays: { handler(){ this.$forceUpdate(); }, deep: true }
  },
  methods: {
    dayOfWeek(day){ return new Date(this.year, this.month, day).getDay(); },
    isWeekend(day){ return this.blockedDays.includes(this.dayOfWeek(day)); },
    isToday(day){ return this.year === this.today.getFullYear() && this.month === this.today.getMonth() && day === this.today.getDate(); },
    dayLabel(day){ return DAY_ABBR[this.dayOfWeek(day)]; },
    dayColClass(day){
      if(this.isToday(day)) return 'bg-blue-50 text-blue-700';
      if(this.isWeekend(day)) return 'bg-gray-200 text-gray-400';
      return '';
    },
    categoryClass(cat){ return CATEGORY_CLASSES[cat] || 'bg-gray-100 text-gray-600'; },
    onCellClick(lawyer, day){
      const tasks = (this.map[lawyer.id] && this.map[lawyer.id][day]) || [];
      this.selectedCell = { lawyer, day, tasks };
    },
    expandPageSizes(){ this.pageSizes = [10,25,50,100]; this.expandedPageSizes = true; },
    async fetchPage(){
      const base = (import.meta.env.VITE_API_URL||'/api');
      if(this.selectedLawyers && this.selectedLawyers.length){
        const source = this.selectedLawyers;
        this.totalCount = source.length;
        this._totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
        const startIndex = (this.page - 1) * this.pageSize;
        const visible = source.slice(startIndex, startIndex + this.pageSize);
        this.lawyers = visible;
        try{ this.lawyers = (this.lawyers || []).slice().sort((a,b)=> String(a.name).localeCompare(String(b.name)) ); }catch(e){}
        const start = `${this.year}-${String(this.month+1).padStart(2,'0')}-01`;
        const end = `${this.year}-${String(this.month+1).padStart(2,'0')}-${String(this.daysInMonth).padStart(2,'0')}`;
        const ids = visible.map(l=>l.id).filter(Boolean).join(',');
        let schedRes;
        try{ schedRes = await axios.get(baseUrl(`/schedules?startDate=${start}&endDate=${end}` + (ids ? `&lawyerIds=${ids}` : '')), { headers: buildHeaders(this.token) }); }
        catch(e){ schedRes = { data: [] } }
        this.schedules = (schedRes && schedRes.data) ? schedRes.data : [];
        const m = {};
        for(const s of this.schedules){
          const day = new Date(s.date).getDate();
          if(!m[s.lawyerId]) m[s.lawyerId] = {};
          if(!m[s.lawyerId][day]) m[s.lawyerId][day] = [];
          m[s.lawyerId][day].push(s);
        }
        this.map = m;
        this.$nextTick(()=>{ try{ const table = this.$refs.tableRef; const topInner = this.$refs.topInner; if(table && topInner) topInner.style.width = table.scrollWidth + 'px'; }catch(e){} })
        return;
      }
      let lawRes;
      try{ lawRes = await axios.get(baseUrl(`/lawyers?page=${this.page}&pageSize=${this.pageSize}`), { headers: buildHeaders(this.token) }); }
      catch(e){ lawRes = { data: [] } }
      const lawData = (lawRes && lawRes.data) ? lawRes.data : [];
      this.lawyers = (lawData && lawData.items) ? lawData.items : lawData || [];
      try{ this.lawyers = sortByName(this.lawyers); }catch(e){}
      try{ this.lawyers = (this.lawyers || []).slice().sort((a,b)=> String(a.name).localeCompare(String(b.name)) ); }catch(e){}
      const total = (lawData && lawData.total) || (Array.isArray(lawData) ? lawData.length : 0);
      this.totalCount = total;
      this._totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
      const start = `${this.year}-${String(this.month+1).padStart(2,'0')}-01`;
      const end = `${this.year}-${String(this.month+1).padStart(2,'0')}-${String(this.daysInMonth).padStart(2,'0')}`;
      const ids = this.lawyers.map(l=>l.id).filter(Boolean).join(',');
      let schedRes2;
      try{ schedRes2 = await axios.get(baseUrl(`/schedules?startDate=${start}&endDate=${end}` + (ids ? `&lawyerIds=${ids}` : '')), { headers: buildHeaders(this.token) }); }
      catch(e){ schedRes2 = { data: [] } }
      this.schedules = (schedRes2 && schedRes2.data) ? schedRes2.data : [];
      const m = {};
      for(const s of this.schedules){
        const day = new Date(s.date).getDate();
        if(!m[s.lawyerId]) m[s.lawyerId] = {};
        if(!m[s.lawyerId][day]) m[s.lawyerId][day] = [];
        m[s.lawyerId][day].push(s);
      }
      this.map = m;
      this.$nextTick(()=>{ try{ const table = this.$refs.tableRef; const topInner = this.$refs.topInner; if(table && topInner) topInner.style.width = table.scrollWidth + 'px'; }catch(e){} })
    },
    async reload(){ this.page = 1; await this.fetchPage(); },
    async changePageSize(size){ if(typeof size !== 'undefined') this.pageSize = size; this.page = 1; await this.fetchPage(); },
    async prevPage(){ if(this.page>1){ this.page--; await this.fetchPage(); } },
    async nextPage(){ if(this.page < this.totalPages){ this.page++; await this.fetchPage(); } },
    _handleScheduleDeleted(payload){
      if(!payload) return;
      const id = payload.id;
      this.schedules = (this.schedules || []).filter(s=>s.id !== id);
      const m = Object.assign({}, this.map);
      for(const lw in m){
        for(const d in m[lw]){
          m[lw][d] = m[lw][d].filter(x=>x.id !== id);
          if(m[lw][d].length === 0) delete m[lw][d];
        }
        if(Object.keys(m[lw]||{}).length === 0) delete m[lw];
      }
      this.map = m;
    },
    _handleScheduleEvent(payload){
      if(!payload) return;
      const items = Array.isArray(payload) ? payload : [payload];
      const added = [];
      for(const s of items){
        if(!s || !s.lawyerId || !s.date) continue;
        const visibleIds = (this.lawyers || []).map(x=>x.id);
        if(visibleIds.includes(s.lawyerId)){
          if(!(this.schedules || []).some(x=>x.id === s.id)) this.schedules = [...(this.schedules||[]), s];
          const day = new Date(s.date).getDate();
          const newMap = Object.assign({}, this.map || {});
          if(!newMap[s.lawyerId]) newMap[s.lawyerId] = {};
          if(!newMap[s.lawyerId][day]) newMap[s.lawyerId][day] = [];
          if(!newMap[s.lawyerId][day].some(x=>x.id === s.id)) newMap[s.lawyerId][day] = [...newMap[s.lawyerId][day], s];
          this.map = newMap;
        }else{
          added.push(s);
        }
      }
      if(added.length) this.reload();
    }
  }
}
</script>
