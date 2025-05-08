<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const queues = ref([])
const loading = ref(false)

const loadUserData = async () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
    await loadQueues()
  } else {
    router.push('/')
  }
}

const loadQueues = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    queues.value = data
  } catch (error) {
    console.error('Error loading queues:', error)
  } finally {
    loading.value = false
  }
}

const cancelQueue = async (queueId) => {
  try {
    loading.value = true
    const { error } = await supabase
      .from('queue_entries')
      .update({ status: 'cancelled' })
      .eq('id', queueId)

    if (error) throw error
    await loadQueues()
  } catch (error) {
    console.error('Error cancelling queue:', error)
    alert('Failed to cancel queue. Please try again.')
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

onMounted(loadUserData)
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container class="pa-4">
        <v-row>
          <v-col cols="12" md="8" class="mx-auto">
            <v-card class="rounded-lg elevation-1">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
                My Queues
              </v-card-title>

              <v-card-text>
                <v-progress-linear
                  v-if="loading"
                  indeterminate
                  color="primary"
                />

                <v-list v-else>
                  <v-list-item
                    v-for="queue in queues"
                    :key="queue.id"
                    class="mb-2 rounded-lg"
                    :class="`bg-${getStatusColor(queue.status)}-lighten-5`"
                  >
                    <template v-slot:prepend>
                      <v-avatar
                        :color="getStatusColor(queue.status)"
                        size="40"
                        class="mr-3"
                      >
                        <v-icon color="white">
                          {{ queue.status === 'waiting' ? 'mdi-clock-outline' :
                             queue.status === 'serving' ? 'mdi-account-check' :
                             queue.status === 'completed' ? 'mdi-check-circle' :
                             'mdi-close-circle' }}
                        </v-icon>
                      </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-bold">
                      {{ queue.queue_number }}
                    </v-list-item-title>

                    <v-list-item-subtitle>
                      {{ queue.service_id }} - {{ new Date(queue.scheduled_time).toLocaleDateString() }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-chip
                        :color="getStatusColor(queue.status)"
                        size="small"
                        class="mr-2"
                      >
                        {{ queue.status }}
                      </v-chip>

                      <v-btn
                        v-if="queue.status === 'waiting'"
                        color="error"
                        variant="tonal"
                        size="small"
                        @click="cancelQueue(queue.id)"
                        :loading="loading"
                      >
                        Cancel
                      </v-btn>
                    </template>
                  </v-list-item>

                  <v-list-item v-if="queues.length === 0" class="text-center">
                    <v-list-item-title class="text-medium-emphasis">
                      No queues found
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template> 