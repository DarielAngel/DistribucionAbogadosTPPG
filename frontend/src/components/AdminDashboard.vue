<template>
  <div>
    <h2 class="text-lg font-semibold mb-3">Administrador</h2>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <h3 class="font-medium">Gestión de abogados</h3>
        <LawyersList :token="token" />
      </div>
      <div>
        <h3 class="font-medium">Cronograma</h3>
        <CalendarView :token="token" />
      </div>
    </div>
  </div>
</template>

<script>
import LawyersList from './LawyersList.vue'
import CalendarView from './CalendarView.vue'
export default { props: ['token'], components: { LawyersList, CalendarView } }
</script>
