<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const selectedOffice = ref('')
const offices = ['Registrar', 'Admission', 'Cashier']
</script>

<!-- In template inside the card -->
<v-select
  v-model="selectedOffice"
  :items="offices"
  label="Select Office"
  variant="outlined"
  class="mb-4"
/>
