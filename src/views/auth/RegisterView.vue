<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue' // ← un-comment this
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
</script>

<template>
  <AppLayout>
    <template #content>
      <div class="login-background d-flex align-center justify-center" style="min-height: 100vh;">
      <v-row>
        <v-col cols="12" md="6" class="mx-auto pt-16">
          <v-card class="mx-auto" elevation="8" style="background-color: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px);">
            <v-card-title class="text-center">
              <v-img src="/images/logo.png"
                width="80"
                class="mx-auto mb-4"
                contain
              />
              <h3 class="font-weight-black">QServe</h3>
              <p class="font-weight-bold">Registration Form</p>
            </v-card-title>

            <v-card-text class="pt-4">
              <v-divider class="my-5" />
              <RegisterForm />
              <v-divider class="my-5" />
              <h5 class="text-center">
                Already have account?
                <RouterLink
                  class="text-blue-lighten-2 font-weight-black"
                  to="/"
                >
                  Click here to Login
                </RouterLink>
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.login-background {
  background-image: url('/smartqueue/public/images/background.jpg');
  background-size: cover;
  background-position: center;
}
</style>
