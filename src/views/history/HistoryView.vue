<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const history = ref([])
const loading = ref(false)

const loadUserData = async () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
    await loadHistory()
  } else {
    router.push('/')
  }
}

const loadHistory = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('user_id', user.value.id)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })

    if (error) throw error
    history.value = data
  } catch (error) {
    console.error('Error loading history:', error)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  return status === 'completed' ? 'success' : 'error'
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
                <v-icon icon="mdi-history" class="mr-2" />
                Queue History
              </v-card-title>

              <v-card-text>
                <v-progress-linear
                  v-if="loading"
                  indeterminate
                  color="primary"
                />

                <v-timeline v-else density="compact" align="start">
                  <v-timeline-item
                    v-for="item in history"
                    :key="item.id"
                    :dot-color="getStatusColor(item.status)"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">
                        {{ new Date(item.created_at).toLocaleDateString() }}
                      </div>
                    </template>

                    <v-card class="rounded-lg">
                      <v-card-text>
                        <div class="d-flex align-center">
                          <v-avatar
                            :color="getStatusColor(item.status)"
                            size="32"
                            class="mr-3"
                          >
                            <v-icon color="white" size="small">
                              {{ item.status === 'completed' ? 'mdi-check' : 'mdi-close' }}
                            </v-icon>
                          </v-avatar>

                          <div>
                            <div class="font-weight-bold">
                              {{ item.queue_number }}
                            </div>
                            <div class="text-caption">
                              {{ item.service_id }}
                            </div>
                          </div>

                          <v-spacer />

                          <v-chip
                            :color="getStatusColor(item.status)"
                            size="small"
                          >
                            {{ item.status }}
                          </v-chip>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-timeline-item>

                  <v-timeline-item v-if="history.length === 0">
                    <v-card class="rounded-lg">
                      <v-card-text class="text-center text-medium-emphasis">
                        No history found
                      </v-card-text>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template> 