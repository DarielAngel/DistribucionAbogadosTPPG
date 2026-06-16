<template>
  <div class="w-full bg-[#6B0B0B] text-white flex items-center px-4 py-2">
    <div class="flex items-center">
      <img :src="logoSrc" alt="Logo" class="h-10 object-contain" />
    </div>
    <div class="flex-1 flex justify-center items-center">
      <div class="flex items-center gap-3">
        <button class="px-3 py-1 bg-white text-[#6B0B0B] rounded text-sm" @click="$emit('edit')">Editar</button>
        <div class="relative">
          <button class="px-3 py-1 bg-white text-[#6B0B0B] rounded text-sm" @click="toggleFilter">Filtrar abogados</button>
          <div v-if="showFilter" class="absolute mt-2 right-0 w-96 bg-white text-black p-3 rounded shadow-lg z-50">
            <LawyersList :token="token" @selection="onSelection" @select="onSelect" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="text-sm mr-2">{{ roleLabel }}</div>
      <button class="bg-white text-[#6B0B0B] px-3 py-1 rounded" @click="$emit('logout')">Cerrar sesión</button>
    </div>
  </div>
</template>

<script>
import LawyersList from './LawyersList.vue'
export default {
  props: ['token','role','logoSrc'],
  components: { LawyersList },
  data(){ return { showFilter: false } },
  computed: {
    roleLabel(){ return this.role === 'admin' ? 'Administrador' : 'Cliente' }
  },
  methods: {
    toggleFilter(){ this.showFilter = !this.showFilter },
    onSelection(list){ this.$emit('filter', list); this.showFilter = false },
    onSelect(l){ this.$emit('filter', [l]); this.showFilter = false }
  }
}
</script>

<style scoped>
.z-50{ z-index: 50 }
</style>
