<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import { useDisplay } from 'vuetify'

const router = useRouter()
const { mobile } = useDisplay()
const drawer = ref(false)
const user = ref(null)
const userMenu = ref(false)

// Load user data from localStorage
const loadUserData = () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
}

// Admin navigation items
const adminNavItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    route: '/admin'
  }
]

// Student navigation items
const studentNavItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    route: '/dashboard'
  },
  {
    title: 'My Queues',
    icon: 'mdi-ticket',
    route: '/my-queues'
  },
  {
    title: 'History',
    icon: 'mdi-history',
    route: '/history'
  }
]

// Get navigation items based on user role
const navItems = computed(() => {
  return user.value?.role === 'admin' ? adminNavItems : studentNavItems
})

// Admin menu items
const adminMenuItems = [
  {
    title: 'Admin Dashboard',
    icon: 'mdi-view-dashboard',
    route: '/admin'
  },
  { divider: true },
  {
    title: 'Logout',
    icon: 'mdi-logout',
    action: async () => {
      await supabase.auth.signOut()
      localStorage.removeItem('user')
      router.push('/')
    }
  }
]

// Student menu items
const studentMenuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    route: '/dashboard'
  },
  {
    title: 'My Queues',
    icon: 'mdi-ticket',
    route: '/my-queues'
  },
  {
    title: 'History',
    icon: 'mdi-history',
    route: '/history'
  },
  { divider: true },
  {
    title: 'Logout',
    icon: 'mdi-logout',
    action: async () => {
      await supabase.auth.signOut()
      localStorage.removeItem('user')
      router.push('/')
    }
  }
]

// Get menu items based on user role
const menuItems = computed(() => {
  return user.value?.role === 'admin' ? adminMenuItems : studentMenuItems
})

// Load user data on mount
loadUserData()
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" class="px-4">
      <v-app-bar-nav-icon
        v-if="mobile"
        @click="drawer = !drawer"
      />

      <v-app-bar-title class="font-weight-bold">
        {{ user?.role === 'admin' ? 'Admin Dashboard' : 'Q-Serve' }}
      </v-app-bar-title>

      <v-spacer />

      <!-- User Menu -->
      <v-menu
        v-model="userMenu"
        :close-on-content-click="false"
        location="bottom end"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="text-none"
          >
            <v-avatar
              color="primary"
              size="32"
              class="mr-2"
            >
              <span class="text-white font-weight-bold">
                {{ user?.full_name?.charAt(0)?.toUpperCase() }}
              </span>
            </v-avatar>
            <span class="d-none d-sm-flex">{{ user?.full_name }}</span>
          </v-btn>
        </template>

        <v-card min-width="300">
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-avatar color="primary" size="40">
                  <span class="text-white font-weight-bold">
                    {{ user?.full_name?.charAt(0)?.toUpperCase() }}
                  </span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">
                {{ user?.full_name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ user?.role === 'admin' ? 'System Administrator' : 'Student' }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item
              v-for="item in menuItems"
              :key="item.title"
              :to="item.route"
              @click="item.action && item.action()"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" />
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="!mobile"
      permanent
      class="border-r"
    >
      <v-list>
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :to="item.route"
          :title="item.title"
          :prepend-icon="item.icon"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <slot name="content" />
    </v-main>

    <!-- Bottom Navigation (Mobile) -->
    <v-bottom-navigation
      v-if="mobile"
      :model-value="router.currentRoute.value.path"
      @update:model-value="router.push($event)"
    >
      <v-btn
        v-for="item in navItems"
        :key="item.title"
        :value="item.route"
        :icon="item.icon"
      >
        {{ item.title }}
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style scoped>
.v-bottom-navigation {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
