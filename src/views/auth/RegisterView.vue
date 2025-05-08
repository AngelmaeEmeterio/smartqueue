<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="mx-auto" elevation="8">
              <v-card-title class="text-center pt-8">
                <v-img
                  src="/images/logo.png"
                  width="100"
                  class="mx-auto mb-4"
                  contain
                />
                <h2 class="text-h4 font-weight-bold mb-2">Create Account</h2>
                <p class="text-subtitle-1 text-medium-emphasis">Join QServe today</p>
              </v-card-title>

              <v-card-text class="pt-4">
                <RegisterForm />
              </v-card-text>

              <v-card-text class="text-center pb-8">
                <p class="text-body-1">
                  Already have an account?
                  <RouterLink class="text-primary font-weight-medium" to="/">
                    Sign In
                  </RouterLink>
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.v-card {
  border-radius: 16px;
}
</style>
