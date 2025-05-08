<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
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
                <h2 class="text-h4 font-weight-bold mb-2">Welcome Back</h2>
                <p class="text-subtitle-1 text-medium-emphasis">Sign in to continue</p>
              </v-card-title>

              <v-card-text class="pt-4">
                <LoginForm />
              </v-card-text>

              <v-card-text class="text-center pb-8">
                <p class="text-body-1 mb-2">
                  Don't have an account?
                  <RouterLink class="text-primary font-weight-medium" to="/register">
                    Create Account
                  </RouterLink>
                </p>
                <p class="text-caption text-medium-emphasis">
                  Note: Student registration is only available for students.
                  Admin accounts are managed by the system administrator.
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
