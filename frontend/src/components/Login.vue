<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-4xl grid grid-cols-2 shadow-lg rounded overflow-hidden">
      <div class="hidden md:flex items-center justify-center bg-white p-8">
        <img src="/images/login/logo.jpg" alt="Logo" class="max-h-96 object-contain w-full" />
      </div>
      <div class="p-8 bg-white flex items-center">
        <div class="w-full">
          <h2 class="text-2xl font-semibold mb-4">Log in to Schwab</h2>
          <form @submit.prevent="submit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Login ID</label>
              <input v-model="email" class="border p-2 w-full rounded" placeholder="user@example.com" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Password</label>
              <div class="relative">
                <input type="password" v-model="password" class="border p-2 w-full rounded" />
                <button type="button" class="absolute right-2 top-2 text-gray-500">👁️</button>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2"><input type="checkbox" id="remember" /><label for="remember" class="text-sm">Remember Login ID</label></div>
              <select class="border rounded p-1 text-sm">
                <option>Accounts Summary</option>
              </select>
            </div>
            <div>
              <button class="w-full bg-red-700 text-white py-2 rounded">Log In</button>
            </div>
          </form>
          <div class="mt-6 text-center text-sm text-gray-600">
            <a class="text-red-600">Forgot Login ID</a> or <a class="text-red-600">Password?</a>
          </div>
        </div>
      </div>
    </div>
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.$emit('login', { token, role: payload.role });
    }
  }
}
</script>

<style scoped>
.bg-cover { background-size: cover; }
.bg-center { background-position: center; }
</style>
