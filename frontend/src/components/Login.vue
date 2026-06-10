<template>
  <div class="max-w-md">
    <h2 class="text-xl mb-2">Acceder</h2>
    <form @submit.prevent="submit">
      <div class="mb-2">
        <label class="block">Email</label>
        <input v-model="email" class="border p-2 w-full" />
      </div>
      <div class="mb-2">
        <label class="block">Password</label>
        <input type="password" v-model="password" class="border p-2 w-full" />
      </div>
      <button class="bg-blue-600 text-white px-4 py-2">Entrar</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data(){ return { email: '', password: '' } },
  methods: {
    async submit(){
      const res = await axios.post((import.meta.env.VITE_API_URL||'/api') + '/auth/login', { email: this.email, password: this.password });
      const token = res.data.token;
      // decode role from token simple parse (not secure but ok for scaffold)
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.$emit('login', { token, role: payload.role });
    }
  }
}
</script>
