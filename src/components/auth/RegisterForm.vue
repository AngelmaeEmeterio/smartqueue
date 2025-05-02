<script setup>
import { ref } from 'vue'

const formDataDefault = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  password_confirmation: ''
}

const formData = ref({
  ...formDataDefault
})

const name = ref('')
const email = ref('')
const programYear = ref('')
const studentId = ref('')
const password = ref('')
</script>

<template>
  <v-form>
    <v-text-field
      v-model="name"
      label="Full Name"
      prepend-icon="mdi-account"
      required
    />

    <v-text-field
      v-model="email"
      label="Email"
      type="email"
      prepend-icon="mdi-email"
      required
    />

    <v-text-field
      v-model="programYear"
      label="Program & Year (e.g. BSIT 3rd Year)"
      prepend-icon="mdi-school"
      required
    />

    <v-text-field
      v-model="studentId"
      label="Student ID"
      prepend-icon="mdi-card-account-details"
      required
    />

    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      prepend-icon="mdi-lock"
      required
    />

    <v-btn color="primary" class="mt-4" block>Register</v-btn>
  </v-form>
</template>
