<template>
  <div class="w-full bg-[#6B0B0B] text-white flex items-center px-4 py-2">
    <div class="flex items-center">
        <img :src="logoSrc" alt="Logo" class="h-10 object-contain cursor-pointer" @click="goHome" />
      </div>
    <div class="flex-1 flex justify-center items-center">
      <div class="flex items-center gap-3">
        <div class="relative" v-if="isAdmin">
          <button class="px-3 py-1 bg-white text-[#6B0B0B] rounded text-sm flex items-center gap-2" @click="toggleAddMenu">
            <span>Adicionar</span>
            <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06-.02L10 10.88l3.71-3.69a.75.75 0 111.06 1.06l-4.24 4.22a.75.75 0 01-1.06 0L5.25 8.25a.75.75 0 01-.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div v-if="showAddMenu" class="absolute mt-2 right-0 w-48 bg-white text-black p-2 rounded shadow-lg z-50">
            <button class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded" @click="openAddLawyer">+ Nuevo abogado</button>
            <button class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded" @click="gotoAddTask">+ Añadir tarea a un abogado</button>
          </div>
        </div>
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
  data(){ return { showFilter: false, showAdd: false, showAddMenu: false } },
  computed: {
    roleLabel(){ return this.role === 'admin' ? 'Administrador' : 'Cliente' },
    isAdmin(){ return this.role === 'admin' }
  },
  methods: {
    goHome(){ this.$emit('home') },
    toggleFilter(){ this.showFilter = !this.showFilter },
    toggleAddMenu(){ this.showAddMenu = !this.showAddMenu },
    onSelection(list){ this.$emit('filter', list); this.showFilter = false; this.showAddMenu = false },
    onSelect(l){ this.$emit('filter', [l]); this.showFilter = false; this.showAddMenu = false },
    openAddLawyer(){ this.showAdd = true; this.showAddMenu = false },
    gotoAddTask(){ this.$emit('goto-admin-add-task'); this.showAddMenu = false },
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
