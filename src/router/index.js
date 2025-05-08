import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import MyQueuesView from '@/views/queues/MyQueuesView.vue'
import HistoryView from '@/views/history/HistoryView.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
// import QueueStatusView from '@/views/auth/StatusView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-queues',
      name: 'my-queues',
      component: MyQueuesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // {
    //   path: '/queue-status',
    //   name: 'Status',
    //   component: StatusView,
    // },
  ],
})

router.beforeEach((to, from, next) => {
  const userData = localStorage.getItem('user')
  const isAuthenticated = !!userData
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin) {
    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router