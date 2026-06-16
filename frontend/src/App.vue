<template>
  <div>
    <HeaderBar v-if="token" :token="token" :role="isAdmin ? 'admin' : 'client'" :logo-src="logoSrc" @filter="onFilter" @logout="logout" @edit="onEdit" />
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Provincia Abogados</h1>
      <Login v-if="!token" @login="onLogin" />
      <div v-else>
        <AdminDashboard v-if="isAdmin && !showAdminView" :token="token" :selected-lawyers="selectedLawyers" @selection="onFilter" />
        <MonthSchedule v-else :token="token" :selected-lawyers="selectedLawyers" />
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

export default {
  components: { Login, AdminDashboard, CalendarView, MonthSchedule, HeaderBar },
  data(){
    return { token: null, isAdmin: false, selectedLawyers: [], showAdminView: false, logoSrc: '/images/login/logo.jpg' }
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
    onEdit(){ if(this.isAdmin) this.showAdminView = true }
  }
}
</script>
