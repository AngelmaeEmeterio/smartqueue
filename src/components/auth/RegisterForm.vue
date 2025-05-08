<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fullName = ref('')
const studentId = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const rules = {
  fullName: [
    v => !!v || 'Full name is required',
    v => v.length >= 3 || 'Name must be at least 3 characters'
  ],
  studentId: [
    v => !!v || 'Student ID is required',
    v => /^\d{8}$/.test(v) || 'Student ID must be 8 digits'
  ],
  email: [
    v => !!v || 'Email is required',
    v => /.+@.+\..+/.test(v) || 'Email must be valid'
  ],
  password: [
    v => !!v || 'Password is required',
    v => v.length >= 6 || 'Password must be at least 6 characters',
    v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
    v => /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
    v => /[0-9]/.test(v) || 'Password must contain at least one number'
  ],
  confirmPassword: [
    v => !!v || 'Please confirm your password',
    v => v === password.value || 'Passwords do not match'
  ]
}

const register = async () => {
  try {
    loading.value = true
    error.value = ''

    // First, create the user in Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })

    if (authError) throw authError

    // Then, create the user profile in the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.id,
          email: email.value,
          full_name: fullName.value,
          student_id: studentId.value,
          role: 'student', // Default role for registered users
          created_at: new Date().toISOString()
        }
      ])

    if (profileError) throw profileError

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify({
      id: authUser.id,
      email: email.value,
      full_name: fullName.value,
      student_id: studentId.value,
      role: 'student'
    }))

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err) {
    console.error('Error registering:', err)
    error.value = err.message || 'Failed to create user profile. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="register" class="pa-4">
    <v-text-field
      v-model="fullName"
      label="Full Name"
      variant="outlined"
      density="comfortable"
      class="rounded-lg mb-4"
      placeholder="Enter your full name"
      prepend-inner-icon="mdi-account"
      :rules="rules.fullName"
      :disabled="loading"
      required
      autocomplete="name"
    />

    <v-text-field
      v-model="studentId"
      label="Student ID"
      variant="outlined"
      density="comfortable"
      class="rounded-lg mb-4"
      placeholder="Enter your 8-digit student ID"
      prepend-inner-icon="mdi-card-account-details"
      :rules="rules.studentId"
      :disabled="loading"
      required
      type="number"
      maxlength="8"
    />

    <v-text-field
      v-model="email"
      label="Email"
      type="email"
      variant="outlined"
      density="comfortable"
      class="rounded-lg mb-4"
      placeholder="Enter your email"
      prepend-inner-icon="mdi-email"
      :rules="rules.email"
      :disabled="loading"
      required
      autocomplete="email"
    />

    <v-text-field
      v-model="password"
      label="Password"
      :type="showPassword ? 'text' : 'password'"
      variant="outlined"
      density="comfortable"
      class="rounded-lg mb-4"
      placeholder="Enter your password"
      prepend-inner-icon="mdi-lock"
      :rules="rules.password"
      :disabled="loading"
      required
      autocomplete="new-password"
    >
      <template #append-inner>
        <v-icon
          :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click="showPassword = !showPassword"
          class="cursor-pointer"
        />
      </template>
    </v-text-field>

    <v-text-field
      v-model="confirmPassword"
      label="Confirm Password"
      :type="showConfirmPassword ? 'text' : 'password'"
      variant="outlined"
      density="comfortable"
      class="rounded-lg mb-4"
      placeholder="Confirm your password"
      prepend-inner-icon="mdi-lock-check"
      :rules="rules.confirmPassword"
      :disabled="loading"
      required
      autocomplete="new-password"
    >
      <template #append-inner>
        <v-icon
          :icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click="showConfirmPassword = !showConfirmPassword"
          class="cursor-pointer"
        />
      </template>
    </v-text-field>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ error }}
    </v-alert>

    <v-btn
      color="primary"
      class="rounded-lg"
      size="large"
      block
      type="submit"
      :loading="loading"
      :disabled="loading"
      elevation="2"
    >
      <v-icon start>mdi-account-plus</v-icon>
      Create Account
    </v-btn>
  </v-form>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
