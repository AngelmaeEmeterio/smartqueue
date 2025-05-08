<script setup>
defineProps({
  formSuccessMessage: {
    type: String,
    default: ''
  },
  formErrorMessage: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <v-alert
    v-if="formSuccessMessage"
    type="success"
    class="mb-4"
    closable
  >
    {{ formSuccessMessage }}
  </v-alert>

  <v-alert
    v-if="formErrorMessage"
    type="error"
    class="mb-4"
    closable
  >
    {{ formErrorMessage }}
  </v-alert>
</template> 