<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
    <transition-group name="toast" tag="div">
      <div v-for="t in toasts" :key="t.id" :class="['max-w-sm p-3 rounded shadow', t.type==='error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white']">
        <div class="flex justify-between items-start gap-2">
          <div class="text-sm">{{ t.message }}</div>
          <button class="text-sm opacity-90" @click="remove(t.id)">✕</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  data(){ return { toasts: [] } },
  created(){ window.addEventListener('app-toast', this.onToast) },
  beforeUnmount(){ window.removeEventListener('app-toast', this.onToast) },
  methods: {
    onToast(e){
      const id = Date.now() + Math.random();
      const { message, type='success', duration=4000 } = e.detail || {};
      this.toasts.push({ id, message, type });
      setTimeout(()=> this.remove(id), duration);
    },
    remove(id){ this.toasts = this.toasts.filter(t=>t.id !== id) }
  }
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .2s ease }
.toast-enter-from { opacity: 0; transform: translateY(-6px) }
.toast-leave-to { opacity: 0; transform: translateY(-6px) }
</style>
