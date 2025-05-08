<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import QueueStatus from '@/components/queue/QueueStatus.vue'
import { useDisplay } from 'vuetify'

const router = useRouter()
const { mobile } = useDisplay()
const user = ref(null)
const selectedOffice = ref('')
const selectedDate = ref('')
const selectedTime = ref('')
const datePickerVisible = ref(false)
const timePickerVisible = ref(false)
const showQueueStatus = ref(false)
const currentQueue = ref(null)
const activeTab = ref(0)
const loading = ref(false)

const offices = ['Registrar', 'Admission', 'Cashier']

// Generate time slots from 8 AM to 5 PM
const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor((i + 16) / 2)
  const minute = (i + 16) % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

// Format time to 12-hour format
const formatTimeDisplay = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

const formattedDateTime = computed(() => {
  if (!selectedDate.value || !selectedTime.value) return ''
  return `${formattedDate.value} ${formatTimeDisplay(selectedTime.value)}`
})

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
})

const loadUserData = async () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
    await loadLatestQueue()
    subscribeToQueueUpdates()
  } else {
    router.push('/')
  }
}

const loadLatestQueue = async () => {
  try {
    loading.value = true
    const { data: latestQueue, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    if (latestQueue) {
      currentQueue.value = latestQueue
      selectedOffice.value = latestQueue.service_id
      const scheduledDate = new Date(latestQueue.scheduled_time)
      selectedDate.value = scheduledDate.toISOString().split('T')[0]
      selectedTime.value = scheduledDate.toTimeString().slice(0, 5)
      showQueueStatus.value = true
      activeTab.value = 1
    }
  } catch (error) {
    console.error('Error loading queue:', error)
  } finally {
    loading.value = false
  }
}

// Add subscription to queue updates
const subscribeToQueueUpdates = () => {
  const subscription = supabase
    .channel('queue-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'queue_entries',
        filter: `user_id=eq.${user.value.id}`
      },
      async (payload) => {
        console.log('Queue updated:', payload)
        // Update the current queue if it matches
        if (currentQueue.value && currentQueue.value.id === payload.new.id) {
          currentQueue.value = payload.new
        }
        // Reload latest queue to ensure we have the most up-to-date data
        await loadLatestQueue()
      }
    )
    .subscribe()

  // Clean up subscription on component unmount
  onUnmounted(() => {
    subscription.unsubscribe()
  })
}

onMounted(loadUserData)

const takeQueue = async () => {
  if (selectedOffice.value && selectedDate.value && selectedTime.value) {
    try {
      loading.value = true
      // Get the last queue number for the selected office
      const { data: lastQueue } = await supabase
        .from('queue_entries')
        .select('queue_number')
        .eq('service_id', selectedOffice.value)
        .order('created_at', { ascending: false })
        .limit(1)

      // Generate new queue number
      const prefix = selectedOffice.value[0].toUpperCase()
      const lastNumber = lastQueue?.[0]?.queue_number?.split('-')[1] || '0'
      const newNumber = parseInt(lastNumber) + 1
      const queueNumber = `${prefix}-${String(newNumber).padStart(3, '0')}`

      // Create new queue entry with date and time
      const scheduledDateTime = new Date(selectedDate.value)
      const [hours, minutes] = selectedTime.value.split(':')
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))

      const { data: queueData, error } = await supabase
        .from('queue_entries')
        .insert([
          {
            user_id: user.value.id,
            service_id: selectedOffice.value,
            queue_number: queueNumber,
            status: 'waiting',
            scheduled_time: scheduledDateTime.toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating queue:', error)
        throw new Error(error.message)
      }

      if (!queueData) {
        throw new Error('Failed to create queue')
      }

      currentQueue.value = queueData
      showQueueStatus.value = true
      activeTab.value = 1
    } catch (error) {
      console.error('Error creating queue:', error)
      alert(error.message || 'Failed to create queue. Please try again.')
    } finally {
      loading.value = false
    }
  } else {
    alert('Please select an office, date, and time.')
  }
}
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container class="pa-4">
        <v-row>
          <v-col cols="12" md="8" class="mx-auto">
            <v-card class="rounded-lg elevation-1">
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="primary" size="48" class="mr-3">
                    <span class="text-h5 text-white font-weight-bold">
                      {{ user?.full_name?.charAt(0)?.toUpperCase() }}
                    </span>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold mb-1">Welcome, {{ user?.full_name }}</h2>
                    <p class="text-subtitle-2 text-medium-emphasis">
                      {{ user?.student_id || 'Student' }}
                    </p>
                  </div>
                </div>

                <v-tabs v-model="activeTab" color="primary" class="mb-4">
                  <v-tab value="0">Take Queue</v-tab>
                  <v-tab value="1" :disabled="!showQueueStatus">Queue Status</v-tab>
                </v-tabs>

                <v-window v-model="activeTab">
                  <v-window-item value="0">
                    <v-form @submit.prevent="takeQueue">
                      <v-select
                        v-model="selectedOffice"
                        :items="offices"
                        label="Select Office"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        class="rounded-lg mb-4"
                        placeholder="Choose an office"
                        prepend-inner-icon="mdi-office-building"
                        :disabled="loading"
                      />

                      <v-text-field
                        v-model="formattedDate"
                        label="Select Date"
                        readonly
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        class="rounded-lg mb-4"
                        @click="datePickerVisible = true"
                        prepend-inner-icon="mdi-calendar"
                        :disabled="loading"
                      >
                        <template #append-inner>
                          <v-icon @click="datePickerVisible = true" class="cursor-pointer">
                            mdi-calendar
                          </v-icon>
                        </template>
                      </v-text-field>

                      <v-text-field
                        v-model="selectedTime"
                        label="Select Time"
                        readonly
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        class="rounded-lg mb-4"
                        @click="timePickerVisible = true"
                        prepend-inner-icon="mdi-clock"
                        :disabled="loading"
                      >
                        <template #append-inner>
                          <v-icon @click="timePickerVisible = true" class="cursor-pointer">
                            mdi-clock
                          </v-icon>
                        </template>
                      </v-text-field>

                      <v-dialog v-model="datePickerVisible" width="auto">
                        <v-date-picker
                          v-model="selectedDate"
                          @update:model-value="datePickerVisible = false"
                          title="Pick a date"
                        />
                      </v-dialog>

                      <v-dialog v-model="timePickerVisible" width="auto">
                        <v-card>
                          <v-card-title>Select Time</v-card-title>
                          <v-card-text>
                            <v-list>
                              <v-list-item
                                v-for="time in timeSlots"
                                :key="time"
                                :value="time"
                                @click="selectedTime = time; timePickerVisible = false"
                              >
                                {{ formatTimeDisplay(time) }}
                              </v-list-item>
                            </v-list>
                          </v-card-text>
                        </v-card>
                      </v-dialog>

                      <v-btn
                        color="primary"
                        class="rounded-lg"
                        size="large"
                        block
                        @click="takeQueue"
                        :loading="loading"
                        :disabled="!selectedOffice || !selectedDate || !selectedTime || loading"
                      >
                        <v-icon start>mdi-ticket</v-icon>
                        Take a Queue Number
                      </v-btn>
                    </v-form>
                  </v-window-item>

                  <v-window-item value="1">
                    <QueueStatus
                      v-if="currentQueue"
                      :office="selectedOffice"
                      :date="formattedDateTime"
                      :queue-number="currentQueue?.queue_number"
                      :status="currentQueue?.status"
                    />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>

            <v-card v-if="showQueueStatus" class="mt-4 rounded-lg elevation-1">
              <v-card-text class="pa-4">
                <v-btn
                  color="secondary"
                  variant="tonal"
                  block
                  @click="activeTab = 0"
                  prepend-icon="mdi-plus"
                  :disabled="loading"
                >
                  Take Another Queue
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.v-window {
  overflow: visible;
}
</style>
