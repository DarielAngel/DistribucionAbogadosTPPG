<template>
  <div class="w-full bg-[#6B0B0B] text-white flex items-center px-4 py-2">
    <div class="flex items-center">
      <img :src="logoSrc" alt="Logo" class="h-10 object-contain" />
    </div>
    <div class="flex-1 flex justify-center items-center">
      <div class="flex items-center gap-3">
        <button v-if="isAdmin" class="px-3 py-1 bg-white text-[#6B0B0B] rounded text-sm" @click="openAdd">Adicionar</button>
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
    <AddLawyerModal v-if="showAdd" :token="token" @close="showAdd=false" @added="onAdded" />
  </div>
</template>

<script>
import LawyersList from './LawyersList.vue'
import AddLawyerModal from './AddLawyerModal.vue'
export default {
  props: ['token','role','logoSrc'],
  components: { LawyersList, AddLawyerModal },
  data(){ return { showFilter: false, showAdd: false } },
  computed: {
    roleLabel(){ return this.role === 'admin' ? 'Administrador' : 'Cliente' },
    isAdmin(){ return this.role === 'admin' }
  },
  methods: {
    toggleFilter(){ this.showFilter = !this.showFilter },
    onSelection(list){ this.$emit('filter', list); this.showFilter = false },
    onSelect(l){ this.$emit('filter', [l]); this.showFilter = false },
    openAdd(){ this.showAdd = true },
    async onAdded(lawyer){
      // notify parent that a lawyer was added
      this.$emit('lawyer-added', lawyer);
      this.showAdd = false;
    }
  }
}
</script>

<style scoped>
.z-50{ z-index: 50 }
</style>
