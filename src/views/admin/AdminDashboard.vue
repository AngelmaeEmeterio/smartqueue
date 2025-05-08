<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const queues = ref([])
const loading = ref(false)
const selectedOffice = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')
const activeTab = ref(0)
const stats = ref({
  total: 0,
  waiting: 0,
  serving: 0,
  completed: 0,
  cancelled: 0
})

const offices = ['Registrar', 'Admission', 'Cashier']
const statuses = ['waiting', 'serving', 'completed', 'cancelled']

const loadUserData = async () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
    if (user.value.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    await loadQueues()
    await loadStats()
  } else {
    router.push('/')
  }
}

const loadStats = async () => {
  try {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('status')

    if (error) throw error

    stats.value = {
      total: data.length,
      waiting: data.filter(q => q.status === 'waiting').length,
      serving: data.filter(q => q.status === 'serving').length,
      completed: data.filter(q => q.status === 'completed').length,
      cancelled: data.filter(q => q.status === 'cancelled').length
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadQueues = async () => {
  try {
    loading.value = true
    let query = supabase
      .from('queue_entries')
      .select(`
        *,
        users (
          full_name,
          student_id
        )
      `)
      .order('created_at', { ascending: false })

    if (selectedOffice.value) {
      query = query.eq('service_id', selectedOffice.value)
    }

    if (selectedStatus.value) {
      query = query.eq('status', selectedStatus.value)
    }

    if (searchQuery.value) {
      query = query.or(`users.full_name.ilike.%${searchQuery.value}%,users.student_id.ilike.%${searchQuery.value}%,queue_number.ilike.%${searchQuery.value}%`)
    }

    const { data, error } = await query

    if (error) throw error
    queues.value = data
  } catch (error) {
    console.error('Error loading queues:', error)
  } finally {
    loading.value = false
  }
}

const updateQueueStatus = async (queueId, newStatus) => {
  try {
    if (!statuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${statuses.join(', ')}`)
    }

    loading.value = true
    const { data, error } = await supabase
      .from('queue_entries')
      .update({ status: newStatus })
      .eq('id', queueId)
      .select()

    if (error) {
      console.error('Error updating queue:', error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      throw new Error('Queue not found')
    }

    // Update local state
    const updatedQueue = data[0]
    const index = queues.value.findIndex(q => q.id === queueId)
    if (index !== -1) {
      queues.value[index] = { ...queues.value[index], ...updatedQueue }
    }

    // Refresh stats
    await loadStats()
  } catch (error) {
    console.error('Error updating queue:', error)
    alert(error.message || 'Failed to update queue status. Please try again.')
  } finally {
    loading.value = false
  }
}

const deleteQueue = async (queueId) => {
  try {
    if (!confirm('Are you sure you want to delete this queue?')) {
      return
    }

    loading.value = true
    const { error } = await supabase
      .from('queue_entries')
      .delete()
      .eq('id', queueId)

    if (error) {
      throw new Error(error.message)
    }

    // Update local state
    queues.value = queues.value.filter(q => q.id !== queueId)
    await loadStats()
  } catch (error) {
    console.error('Error deleting queue:', error)
    alert('Failed to delete queue. Please try again.')
  } finally {
    loading.value = false
  }
}

const clearAllQueues = async () => {
  try {
    if (!confirm('Are you sure you want to clear all queues? This action cannot be undone.')) {
      return
    }

    loading.value = true
    const { error } = await supabase
      .from('queue_entries')
      .delete()
      .neq('id', 0) // This will delete all rows

    if (error) {
      throw new Error(error.message)
    }

    // Update local state
    queues.value = []
    await loadStats()
  } catch (error) {
    console.error('Error clearing queues:', error)
    alert('Failed to clear queues. Please try again.')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'waiting':
      return 'warning'
    case 'serving':
      return 'info'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'grey'
  }
}

// Format date and time to readable format
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  const formattedDate = date.toLocaleDateString()
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${formattedDate} ${hour12}:${minutes} ${ampm}`
}

onMounted(loadUserData)
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container class="pa-4">
        <!-- Stats Cards -->
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card class="rounded-lg" color="primary" theme="dark">
              <v-card-text>
                <div class="text-h6 mb-2">Total Queues</div>
                <div class="text-h4">{{ stats.total }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card class="rounded-lg" color="warning" theme="dark">
              <v-card-text>
                <div class="text-h6 mb-2">Waiting</div>
                <div class="text-h4">{{ stats.waiting }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card class="rounded-lg" color="info" theme="dark">
              <v-card-text>
                <div class="text-h6 mb-2">Serving</div>
                <div class="text-h4">{{ stats.serving }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card class="rounded-lg" color="success" theme="dark">
              <v-card-text>
                <div class="text-h6 mb-2">Completed</div>
                <div class="text-h4">{{ stats.completed }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Queue Management -->
        <v-card class="mt-4 rounded-lg">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-shield-account" class="mr-2" />
            Queue Management
            <v-spacer />
            <!-- <v-btn
              color="error"
              variant="tonal"
              prepend-icon="mdi-delete-sweep"
              @click="clearAllQueues"
              :loading="loading"
              :disabled="queues.length === 0"
            >
              Clear All Queues
            </v-btn> -->
          </v-card-title>

          <v-card-text>
            <!-- Filters -->
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Search"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="rounded-lg"
                  placeholder="Search by name, ID, or queue number"
                  prepend-inner-icon="mdi-magnify"
                  @update:model-value="loadQueues"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedOffice"
                  :items="offices"
                  label="Filter by Office"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="rounded-lg"
                  placeholder="All Offices"
                  prepend-inner-icon="mdi-office-building"
                  @update:model-value="loadQueues"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedStatus"
                  :items="statuses"
                  label="Filter by Status"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="rounded-lg"
                  placeholder="All Statuses"
                  prepend-inner-icon="mdi-filter"
                  @update:model-value="loadQueues"
                />
              </v-col>
            </v-row>

            <v-progress-linear
              v-if="loading"
              indeterminate
              color="primary"
              class="mt-4"
            />

            <v-table v-else class="mt-4">
              <thead>
                <tr>
                  <th>Queue #</th>
                  <th>Student</th>
                  <th>Office</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="queue in queues" :key="queue.id">
                  <td class="font-weight-bold">{{ queue.queue_number }}</td>
                  <td>
                    <div>{{ queue.users?.full_name }}</div>
                    <div class="text-caption">{{ queue.users?.student_id }}</div>
                  </td>
                  <td>{{ queue.service_id }}</td>
                  <td>{{ formatDateTime(queue.scheduled_time) }}</td>
                  <td>
                    <v-chip
                      :color="getStatusColor(queue.status)"
                      size="small"
                    >
                      {{ queue.status }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn-group>
                      <v-btn
                        v-if="queue.status === 'waiting'"
                        color="info"
                        variant="tonal"
                        size="small"
                        @click="updateQueueStatus(queue.id, 'serving')"
                        :loading="loading"
                      >
                        Start Serving
                      </v-btn>
                      <v-btn
                        v-if="queue.status === 'serving'"
                        color="success"
                        variant="tonal"
                        size="small"
                        @click="updateQueueStatus(queue.id, 'completed')"
                        :loading="loading"
                      >
                        Complete
                      </v-btn>
                      <v-btn
                        v-if="['waiting', 'serving'].includes(queue.status)"
                        color="error"
                        variant="tonal"
                        size="small"
                        @click="updateQueueStatus(queue.id, 'cancelled')"
                        :loading="loading"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="error"
                        variant="tonal"
                        size="small"
                        @click="deleteQueue(queue.id)"
                        :loading="loading"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-btn-group>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div v-if="queues.length === 0" class="text-center pa-4">
              <p class="text-medium-emphasis">No queues found</p>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </template>
  </AppLayout>
</template> 