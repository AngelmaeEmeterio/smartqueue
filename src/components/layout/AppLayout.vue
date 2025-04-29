<script setup>
import { ref } from 'vue'

// Get the theme from localStorage or default to 'light'
const theme = ref('light')

// Toggle the theme and store it
function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <!-- App Bar -->
      <v-app-bar
        class="px-3"
        :color="theme === 'light' ? 'blue-lighten-1' : 'blue-darken-3'"
        border
      >
        <v-spacer></v-spacer>

        <!-- Toggle Theme Button with Icon -->
        <v-btn 
        :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="elevated"
        color="blue-lighten-3" 
        slim
        @click="onClick">
        </v-btn>
      </v-app-bar>

      <!-- Main Content -->
      <v-main>
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-main>

      <!-- Footer -->
      <v-footer
        class="font-weight-bold"
        :color="theme === 'light' ? 'blue-lighten-2' : 'blue-darken-3'"
        elevation="24"
        border
        app
      >
        2025 - QServe
      </v-footer>
    </v-app>
  </v-responsive>
</template>
