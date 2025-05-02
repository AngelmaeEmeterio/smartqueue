<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const router = useRouter()
const studentId = ref('')

const handleLogin = () => {
  if (studentId.value.trim()) {
    router.push('/dashboard')
  } else {
    alert('Please enter your Student ID')
  }
}
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row>
        <v-col cols="12" md="6" class="mx-auto pt-16"> 
          <v-card class="mx-auto" elevation="24">
            <v-card-title class="text-center">
              <v-img
                src="/images/logo.png"
                width="80"
                class="mx-auto mb-4"
                contain
              />
              <h3 class="font-weight-black">QServe</h3>
              <p class="font-weight-bold">Login Form</p>
            </v-card-title>

            <v-card-text class="bg-surface-light pt-4">
              <v-divider class="my-5"></v-divider>

              <v-form fast-fail @submit.prevent="handleLogin">
                <v-text-field
                  v-model="studentId"
                  label="Student ID"
                  variant="outlined"
                ></v-text-field>

                <v-text-field
                  label="Password"
                  type="password"
                  variant="outlined"
                ></v-text-field>

                <v-btn class="mt-2" type="submit" block color="primary" prepend-icon="→">
                  Login
                </v-btn>
              </v-form>

              <v-divider class="my-5"></v-divider>

              <h5 class="text-center">
                Don't have account?
                <RouterLink class="text-primary" to="/register">
                  Click here to Register
                </RouterLink>
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>
