<template>
  <div>
    <HeaderBar v-if="token" :token="token" :role="isAdmin ? 'admin' : 'client'" :logo-src="logoSrc" @filter="onFilter" @logout="logout" @edit="onEdit" @lawyer-added="onLawyerAdded" @goto-admin-add-task="gotoAddTaskFromHeader" @home="onHome" />
    <ToastContainer />
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Provincia Abogados</h1>
      <Login v-if="!token" @login="onLogin" />
      <div v-else>
        <AdminDashboard ref="adminDashboard" v-if="isAdmin && !showAdminView" :key="'admin-'+adminKey" :token="token" :selected-lawyers="selectedLawyers" :is-admin="isAdmin" :open-add-task-signal="openAddTaskSignal" @selection="onFilter" @lawyer-deleted="onLawyerDeleted" @task-added="onTaskAdded" />
        <MonthSchedule v-else :key="'ms-'+adminKey" :token="token" :selected-lawyers="selectedLawyers" />
      </div>
    </div>
  </div>
</template>

<script>
import Login from './components/Login.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import MonthSchedule from './components/MonthSchedule.vue'
import CalendarView from './components/CalendarView.vue'
import HeaderBar from './components/HeaderBar.vue'
import ToastContainer from './components/ToastContainer.vue'

export default {
  components: { Login, AdminDashboard, CalendarView, MonthSchedule, HeaderBar, ToastContainer },
  data(){
    return { token: null, isAdmin: false, selectedLawyers: [], showAdminView: false, logoSrc: '/images/login/logo.jpg', adminKey: 0, openAddTaskSignal: 0 }
  },
  methods: {
    onLogin({ token, role }){
      this.token = token;
      this.isAdmin = role === 'admin';
      this.showAdminView = false;
      this.selectedLawyers = [];
    },
    onFilter(list){
      this.selectedLawyers = list || [];
      this.showAdminView = false;
    },
    logout(){
      this.token = null;
      this.isAdmin = false;
      this.selectedLawyers = [];
      this.showAdminView = false;
    },
    onEdit(){ if(this.isAdmin) this.showAdminView = true },
    async onLawyerAdded(l){
      // keep admin dashboard visible and refresh its data
      this.adminKey += 1;
      this.showAdminView = false;
      this.$nextTick(()=>{ if(this.$refs.adminDashboard && this.$refs.adminDashboard.refreshAll) this.$refs.adminDashboard.refreshAll(); });
    },
    onTaskAdded(){ this.adminKey += 1 },
    onLawyerDeleted(){ this.adminKey += 1 },
    gotoAddTaskFromHeader(){
      // ensure admin dashboard is visible and open add-task modal
      this.showAdminView = false;
      this.openAddTaskSignal = (this.openAddTaskSignal || 0) + 1;
    },
    onHome(){
      // show month schedule and reset filters
      this.showAdminView = true;
      this.selectedLawyers = [];
      this.adminKey += 1;
    }
  }
}
</script>
