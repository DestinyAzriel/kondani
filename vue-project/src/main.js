import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './styles/animations.css'
import { activityService } from './services/activityService'
import { useAuthStore } from './stores/auth'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Display error in a more visible way
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: #e53e3e;
    color: white;
    padding: 10px;
    z-index: 9999;
    font-family: monospace;
  `;
  errorDiv.innerHTML = `ERROR: ${event.error.message || 'Unknown error'} - Check console for details`;
  document.body.appendChild(errorDiv);
});

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

// Initialize activity tracking after app mount
const authStore = useAuthStore()
if (authStore.isAuthenticated) {
  activityService.init()
}

// Watch for auth changes
router.afterEach(() => {
  if (authStore.isAuthenticated && !activityService.isActive.value) {
    activityService.init()
  }
})