<template>
  <div class="p-4">
    <h2 class="text-2xl mb-4">Admin Dashboard</h2>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <h3 class="font-medium">Gestión de abogados</h3>
        <LawyersList :token="token" :is-admin="isAdmin" @select="onSelect" @selection="onSelection" @deleted="onDeleted" />
        <div v-if="activeLawyer" class="mt-4 border p-3 bg-white shadow-sm">
          <div class="font-semibold">{{ activeLawyer.name }}</div>
          <div class="text-sm text-gray-600">{{ activeLawyer.province }} — {{ activeLawyer.municipality }}</div>
          <div class="text-sm mt-2">Especialidad: {{ activeLawyer.specialization || '—' }}</div>
          <div class="text-sm mt-1">Contacto: {{ activeLawyer.email || '—' }}</div>
        </div>
      </div>
      <div class="col-span-2">
        <h3 class="font-medium">Cronograma</h3>
        <MonthSchedule :token="token" :page-size-prop="pageSize" :selected-lawyers="selectedLawyers" />
      </div>
    </div>
  </div>
</template>

<script>
import LawyersList from './LawyersList.vue'
import MonthSchedule from './MonthSchedule.vue'
export default {
  props: ['token','selectedLawyers','isAdmin'],
  components: { LawyersList, MonthSchedule },
  data(){ return { activeLawyer: null, pageSize: 25 } },
  methods:{
    onSelect(l){ this.activeLawyer = l; this.$emit('select', l) },
    onSelection(list){ this.$emit('selection', list) },
    onDeleted(id){ if(this.activeLawyer && this.activeLawyer.id === id) this.activeLawyer = null }
  }
}
</script>
