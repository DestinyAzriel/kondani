import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', component: () => import('@/views/LandingPage.vue') },
  { path: '/login', component: () => import('@/views/auth/LoginView.vue') },
  { path: '/register', component: () => import('@/views/auth/RegisterView.vue') },
  { path: '/onboarding', component: () => import('@/views/auth/OnboardingView.vue') },
  { path: '/verify-photo', component: () => import('@/views/auth/PhotoVerificationView.vue') },
  { path: '/privacy', component: () => import('@/views/PrivacyPolicy.vue') },
  { path: '/safety-center', component: () => import('@/views/SafetyCenterPublic.vue') },
  { path: '/support', component: () => import('@/views/SupportPage.vue') },
  { path: '/test', component: () => import('@/views/TestView.vue') }, // Test route

  // Protected routes
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    beforeEnter: async (to, from, next) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return next('/login')
      }
      if (!authStore.user) {
        try { await authStore.fetchUser() } catch (e) {}
      }
      if (authStore.user?.role === 'admin' || authStore.user?.role === 'moderator') {
        next()
      } else {
        next('/encounters')
      }
    }
  },
  {
    path: '/app',
    component: () => import('@/components/layout/AppLayout.vue'),
    children: [
      { path: '', redirect: '/encounters' },
      { path: '/feed', component: () => import('@/views/app/FeedView.vue') },
      { path: '/encounters', component: () => import('@/views/app/EncountersView.vue') },
      { path: '/daily-picks', component: () => import('@/views/app/DailyPicksView.vue') },
      { path: '/likes', component: () => import('@/views/app/LikesView.vue') },
      { path: '/chats', component: () => import('@/views/app/ChatsView.vue') },
      { path: '/chats/:id', component: () => import('@/views/app/ChatRoomView.vue') },
      { path: '/video-call/:id', component: () => import('@/views/app/VideoCallView.vue') },
      { path: '/profile', component: () => import('@/views/app/ProfileView.vue') },
      { path: '/settings', component: () => import('@/views/app/SettingsView.vue') },
      { path: '/safety', component: () => import('@/views/app/SafetyView.vue') },
      { path: '/premium', component: () => import('@/views/app/SubscriptionView.vue') }
    ],
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        next()
      } else {
        next('/login')
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

const publicRoutes = ['/', '/login', '/register', '/privacy', '/safety-center', '/support', '/test']

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Rehydrate user from backend if we have a token but no user object
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (e) {
      console.warn('Could not restore user profile:', e)
    }
  }

  const isPublic = publicRoutes.includes(to.path)

  // Unauthenticated user trying to access a protected route
  if (!authStore.isAuthenticated && !isPublic) {
    return next('/login')
  }

  if (authStore.isAuthenticated) {
    // Redirect away from login/register if already logged in
    if (to.path === '/login' || to.path === '/register') {
      if (authStore.user?.role === 'admin' || authStore.user?.role === 'moderator') {
        return next('/admin')
      }
      return next(authStore.user?.isProfileComplete ? '/encounters' : '/onboarding')
    }
  }

  next()
})

export default router