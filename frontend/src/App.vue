<template>
  <div>
    <HeaderBar v-if="sessionReady && role" :token="token" :role="role" :logo-src="logoSrc"
      @filter="onFilter" @logout="logout" @edit="onEdit" @lawyer-added="onLawyerAdded"
      @goto-admin-add-task="gotoAddTaskFromHeader" @home="onHome" @open-settings="showSettings=true" />
    <ToastContainer />
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Provincia Abogados</h1>
      <template v-if="!sessionReady">
        <div class="text-gray-400 text-sm">Cargando…</div>
      </template>
      <template v-else>
        <Login v-if="!role" @login="onLogin" />
        <div v-else>
          <AdminDashboard ref="adminDashboard" v-if="isAdmin && !showAdminView"
            :key="'admin-'+adminKey" :token="token" :selected-lawyers="selectedLawyers"
            :is-admin="isAdmin" :open-add-task-signal="openAddTaskSignal"
            :blocked-days="blockedDays"
            @selection="onFilter" @lawyer-deleted="onLawyerDeleted" @task-added="onTaskAdded" />
          <MonthSchedule v-else :key="'ms-'+adminKey" :token="token"
            :selected-lawyers="selectedLawyers" :blocked-days="blockedDays" />
        </div>
      </template>
    </div>
    <BlockedDaysModal v-if="showSettings" :token="token" :blocked-days="blockedDays"
      @close="showSettings=false" @saved="onSettingsSaved" />
  </div>
</template>

<script>
import axios from 'axios'
import Login from './components/Login.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import MonthSchedule from './components/MonthSchedule.vue'
import CalendarView from './components/CalendarView.vue'
import HeaderBar from './components/HeaderBar.vue'
import ToastContainer from './components/ToastContainer.vue'
import BlockedDaysModal from './components/BlockedDaysModal.vue'
import { baseUrl, buildHeaders } from './utils/apiClient'
import { startSSE, stopSSE } from './utils/sse'

export default {
  components: { Login, AdminDashboard, CalendarView, MonthSchedule, HeaderBar, ToastContainer, BlockedDaysModal },
  data(){
    return {
      token: null,       // in-memory only — never persisted
      role: null,        // 'admin' | 'client' | null
      sessionReady: false,
      selectedLawyers: [],
      showAdminView: false,
      logoSrc: '/images/login/logo.jpg',
      adminKey: 0,
      openAddTaskSignal: 0,
      blockedDays: [0, 5, 6],
      showSettings: false
    }
  },
  computed: {
    isAdmin(){ return this.role === 'admin' }
  },
  async created(){
    // Restore session from HttpOnly cookie via /me — no localStorage
    try{
      const res = await axios.get(baseUrl('/auth/me'));
      this.role = res.data.role;
      await this.fetchBlockedDays();
      startSSE();
    }catch(e){ /* cookie ausente o expirada → muestra Login */ }
    finally{ this.sessionReady = true; }
  },
  methods: {
    async fetchBlockedDays(){
      try{
        const res = await axios.get(baseUrl('/config/blocked-days'));
        this.blockedDays = res.data.blockedDays;
      }catch(e){}
    },
    async onLogin({ role }){
      this.role = role;
      this.showAdminView = false;
      this.selectedLawyers = [];
      await this.fetchBlockedDays();
      startSSE();
    },
    onFilter(list){
      this.selectedLawyers = list || [];
      this.showAdminView = false;
    },
    async logout(){
      stopSSE();
      try{ await axios.post(baseUrl('/auth/logout')); }catch(e){}
      this.role = null;
      this.token = null;
      this.selectedLawyers = [];
      this.showAdminView = false;
      this.blockedDays = [0, 5, 6];
    },
    onEdit(){ if(this.isAdmin) this.showAdminView = true },
    async onLawyerAdded(){
      this.adminKey += 1;
      this.showAdminView = false;
      this.$nextTick(()=>{ if(this.$refs.adminDashboard?.refreshAll) this.$refs.adminDashboard.refreshAll(); });
    },
    onTaskAdded(){ this.adminKey += 1 },
    onLawyerDeleted(){ this.adminKey += 1 },
    gotoAddTaskFromHeader(){
      this.showAdminView = false;
      this.$nextTick(() => { this.openAddTaskSignal = (this.openAddTaskSignal || 0) + 1; });
    },
    onHome(){
      this.showAdminView = true;
      this.selectedLawyers = [];
      this.adminKey += 1;
    },
    onSettingsSaved(newBlockedDays){ this.blockedDays = newBlockedDays; }
  }
}
</script>
