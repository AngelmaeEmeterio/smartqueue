<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const rules = {
  email: [
    v => !!v || 'Email is required',
    v => /.+@.+\..+/.test(v) || 'Email must be valid'
  ],
  password: [
    v => !!v || 'Password is required',
    v => v.length >= 6 || 'Password must be at least 6 characters'
  ]
}

const login = async () => {
  try {
    loading.value = true
    error.value = ''

    // First, sign in with Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) throw authError

    // Get user data from users table
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)

    if (userError) throw userError

    // Check if we got exactly one user
    if (!users || users.length !== 1) {
      throw new Error('User data not found or multiple users found')
    }

    const userData = users[0]

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData))

    // Redirect based on role
    if (userData.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    console.error('Error logging in:', err)
    error.value = err.message || 'Failed to login. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="login" class="pa-4">
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
      autocomplete="current-password"
    >
      <template #append-inner>
        <v-icon
          :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click="showPassword = !showPassword"
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
      <v-icon start>mdi-login</v-icon>
      Sign In
    </v-btn>
  </v-form>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
