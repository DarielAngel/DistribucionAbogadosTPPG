<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Provincia Abogados</h1>
    <Login v-if="!token" @login="onLogin" />
    <div v-else>
      <AdminDashboard v-if="isAdmin" :token="token" />
      <CalendarView v-else :token="token" />
    </div>
  </div>
</template>

<script>
import Login from './components/Login.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import CalendarView from './components/CalendarView.vue'

export default {
  components: { Login, AdminDashboard, CalendarView },
  data(){
    return { token: null, isAdmin: false }
  },
  methods: {
    onLogin({ token, role }){
      this.token = token;
      this.isAdmin = role === 'admin';
    }
  }
}
</script>
