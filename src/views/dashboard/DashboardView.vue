<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const selectedOffice = ref('')
const offices = ['Registrar', 'Admission', 'Cashier']
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container class="pa-4">
        <v-card class="mx-auto mt-6 pa-4" max-width="800">
          <h1 class="font-weight-bold">Welcome, Student</h1>
          <v-select v-model="selectedOffice" :items="offices" label="Select Office" variant="outlined" class="mb-4"/>
        </v-card>
      </v-container>
    </template>
  </AppLayout>
</template>
