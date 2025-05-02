<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useRouter } from 'vue-router'
import { useDate } from 'vuetify'

const router = useRouter()

const selectedOffice = ref('')
const selectedDate = ref('')
const datePickerVisible = ref(false)

const offices = ['Registrar', 'Admission', 'Cashier']

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
})

const takeQueue = () => {
  if (selectedOffice.value && selectedDate.value) {
    const prefix = selectedOffice.value[0].toUpperCase()
    const randomCurrent = Math.floor(Math.random() * 30) + 1
    const myNum = randomCurrent + 1

    const currentServing = `${prefix}-${randomCurrent}`
    const lastCalled = `${prefix}-${randomCurrent - 1}`
    const queueNumber = `${prefix}-${myNum}`

    router.push({
      name: 'QueueStatus',
      query: {
        office: selectedOffice.value,
        date: formattedDate.value,
        queue: queueNumber,
        current: currentServing,
        last: lastCalled,
      }
    })
  } else {
    alert('Please select an office and date.')
  }
}
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container class="pa-4">
        <v-card width="100%" max-width="800" class="pa-5 mx-auto mt-6 rounded-lg elevation-1">
          <h1 class="font-weight-bold mb-2">Welcome, Student</h1>
          <p class="text-subtitle-5 mb-4">Please select an office and date to get a queue number.</p>

          <v-form>
            <v-select
              v-model="selectedOffice"
              :items="offices"
              label="Select Office"
              variant="outlined"
              density="comfortable"
              hide-details
              class="rounded-lg mb-4"
              placeholder="Choose an office"
            />

            <!-- Date Picker Text Field with Icon -->
            <v-text-field
              v-model="formattedDate"
              label="Select Date"
              readonly
              variant="outlined"
              density="comfortable"
              hide-details
              class="rounded-lg mb-4"
              @click="datePickerVisible = true"
            >
              <template #append-inner>
                <v-icon @click="datePickerVisible = true" class="cursor-pointer">mdi-calendar</v-icon>
              </template>
            </v-text-field>

            <v-dialog v-model="datePickerVisible" width="auto">
              <v-date-picker
                v-model="selectedDate"
                @update:model-value="datePickerVisible = false"
                title="Pick a date"
              />
            </v-dialog>

            <v-btn color="blue" class="rounded-lg" size="large" block @click="takeQueue">
              Take a Queue Number
            </v-btn>
          </v-form>
        </v-card>
      </v-container>
    </template>
  </AppLayout>
</template>
