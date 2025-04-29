<script setup>
import AppLayout from '@/components/layout/AppLayout.vue';
//import RegisterForm from '@/components/auth/RegisterForm.vue';
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
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
                  <h3 class="font-weight-black ">QServe</h3>
                  <p class="font-weight-bold">Registration Form</p>

                </v-card-title>

                <v-card-text class="pt-4">
                  <v-divider class="my-5"></v-divider>

                  <RegisterForm> </RegisterForm>
                  <v-divider class="my-5"></v-divider>

                  <h5 class="text-center">Already have account? <RouterLink class="text-blue-lighten-2 font-weight-black" to="/">Click here to Login</RouterLink></h5>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
       
  </template>

</AppLayout>

</template>