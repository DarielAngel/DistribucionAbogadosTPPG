<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
    <div class="bg-white text-black rounded shadow-lg w-11/12 max-w-md p-4">
      <div class="mb-3">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-gray-600 mt-1">{{ message }}</p>
      </div>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-2 border rounded bg-gray-100" @click="$emit('cancel')">Cancelar</button>
        <button class="px-3 py-2 bg-red-600 text-white rounded" @click="$emit('confirm')">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { title: { type: String, default: 'Confirmar' }, message: { type: String, default: '¿Confirmar acción?' } }
}
</script>

<style scoped>
</style>
