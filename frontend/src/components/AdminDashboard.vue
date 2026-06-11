<template>
  <div class="p-4">
    <h2 class="text-2xl mb-4">Admin Dashboard</h2>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <h3 class="font-medium">Gestión de abogados</h3>
        <LawyersList :token="token" @select="onSelect" />
        <div v-if="selected" class="mt-4 border p-3 bg-white shadow-sm">
          <div class="font-semibold">{{ selected.name }}</div>
          <div class="text-sm text-gray-600">{{ selected.province }} — {{ selected.municipality }}</div>
          <div class="text-sm mt-2">Especialidad: {{ selected.specialization || '—' }}</div>
          <div class="text-sm mt-1">Contacto: {{ selected.email || '—' }}</div>
        </div>
      </div>
      <div class="col-span-2">
        <h3 class="font-medium">Cronograma</h3>
        <MonthSchedule :token="token" :page-size-prop="pageSize" />
      </div>
    </div>
  </div>
</template>

<script>
import LawyersList from './LawyersList.vue'
import MonthSchedule from './MonthSchedule.vue'
export default {
  props: ['token'],
  components: { LawyersList, MonthSchedule },
  data(){ return { selected: null, pageSize: 25 } },
  methods: { onSelect(l){ this.selected = l } }
}
</script>
