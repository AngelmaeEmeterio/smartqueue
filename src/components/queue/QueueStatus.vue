<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/utils/supabase'

const props = defineProps({
  office: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  queueNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'waiting'
  }
})

const queueStatus = ref({
  currentServing: '',
  lastCalled: '',
  estimatedWait: '15-20 minutes'
})

const queueHistory = ref([])

const statusColor = computed(() => {
  switch (props.status) {
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
})

const statusIcon = computed(() => {
  switch (props.status) {
    case 'waiting':
      return 'mdi-clock-outline'
    case 'serving':
      return 'mdi-account-outline'
    case 'completed':
      return 'mdi-check-circle-outline'
    case 'cancelled':
      return 'mdi-close-circle-outline'
    default:
      return 'mdi-help-circle-outline'
  }
})

const statusMessage = computed(() => {
  switch (props.status) {
    case 'waiting':
      return 'Please wait for your turn. You will be called soon.'
    case 'serving':
      return 'It\'s your turn! Please proceed to the counter.'
    case 'completed':
      return 'Your queue has been completed. Thank you!'
    case 'cancelled':
      return 'Your queue has been cancelled.'
    default:
      return 'Unknown status'
  }
})

const showTimeline = computed(() => props.status !== 'cancelled')

const timelineSteps = computed(() => {
  const steps = [
    {
      text: 'Queue Created',
      icon: 'mdi-ticket-outline',
      color: 'success',
      active: true,
      time: new Date().toLocaleTimeString()
    },
    {
      text: 'Waiting',
      icon: 'mdi-clock-outline',
      color: props.status === 'waiting' ? 'warning' : (props.status === 'serving' || props.status === 'completed' ? 'success' : 'grey'),
      active: ['waiting', 'serving', 'completed'].includes(props.status)
    },
    {
      text: 'Now Serving',
      icon: 'mdi-account-outline',
      color: props.status === 'serving' ? 'info' : (props.status === 'completed' ? 'success' : 'grey'),
      active: ['serving', 'completed'].includes(props.status)
    },
    {
      text: 'Completed',
      icon: 'mdi-check-circle-outline',
      color: props.status === 'completed' ? 'success' : 'grey',
      active: props.status === 'completed'
    }
  ]
  return steps
})

const fetchQueueStatus = async () => {
  try {
    // Get current serving number
    const { data: currentData } = await supabase
      .from('queue_entries')
      .select('queue_number')
      .eq('service_id', props.office)
      .eq('status', 'called')
      .order('created_at', { ascending: false })
      .limit(1)

    // Get last called number
    const { data: lastData } = await supabase
      .from('queue_entries')
      .select('queue_number')
      .eq('service_id', props.office)
      .eq('status', 'served')
      .order('created_at', { ascending: false })
      .limit(1)

    // Get queue history
    const { data: historyData } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('service_id', props.office)
      .order('created_at', { ascending: false })
      .limit(10)

    queueStatus.value.currentServing = currentData?.[0]?.queue_number || 'None'
    queueStatus.value.lastCalled = lastData?.[0]?.queue_number || 'None'
    queueHistory.value = historyData || []
  } catch (error) {
    console.error('Error fetching queue status:', error)
  }
}

onMounted(() => {
  fetchQueueStatus()
  // Set up real-time subscription
  const subscription = supabase
    .channel('queue_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'queue_entries',
        filter: `service_id=eq.${props.office}`
      }, 
      () => {
        fetchQueueStatus()
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
})
</script>

<template>
  <div class="queue-status">
    <v-card-text class="text-center pa-6">
      <v-icon
        :color="statusColor"
        size="64"
        class="mb-4"
      >
        {{ statusIcon }}
      </v-icon>
      
      <h2 class="text-h4 font-weight-bold mb-2">{{ queueNumber }}</h2>
      <p class="text-body-1 text-medium-emphasis mb-4">
        {{ office }} Office • {{ date }}
      </p>

      <v-chip
        :color="statusColor"
        size="large"
        class="mb-6 text-capitalize"
      >
        {{ status }}
      </v-chip>

      <div class="status-message text-body-1" :class="statusColor + '--text'">
        {{ statusMessage }}
      </div>

      <v-timeline v-if="showTimeline" class="mt-6" density="compact" align="start">
        <v-timeline-item
          v-for="(step, index) in timelineSteps"
          :key="index"
          :dot-color="step.color"
          :icon="step.icon"
          size="small"
        >
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2" :class="step.active ? 'font-weight-bold' : 'text-medium-emphasis'">
              {{ step.text }}
            </span>
            <span v-if="step.time" class="text-caption text-medium-emphasis">
              {{ step.time }}
            </span>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </div>
</template>

<style scoped>
.queue-status {
  max-width: 600px;
  margin: 0 auto;
}

.status-message {
  font-size: 1.1rem;
  line-height: 1.5;
}
</style> 