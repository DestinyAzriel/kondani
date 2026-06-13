<template>
  <div class="settings-view min-h-screen bg-deep-950 pb-24 relative overflow-hidden">
    
    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- Header -->
    <div class="relative z-10 bg-deep-950/90 backdrop-blur-md border-b border-white/5 sticky top-0">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
        <button @click="router.back()" class="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeftIcon size="24" />
        </button>
        <h1 class="text-xl font-bold text-white tracking-tight">Settings</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-8">

      <!-- Discovery Settings -->
      <section class="space-y-4">
        <h2 class="text-xs font-bold text-white/40 uppercase tracking-widest pl-2">Discovery</h2>
        
        <div class="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <!-- Location -->
          <div class="p-4 border-b border-white/5 flex items-center justify-between">
             <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                 <MapPinIcon size="16" />
               </div>
               <div>
                 <p class="text-sm font-bold text-white">Location</p>
                 <p class="text-xs text-white/50">My Current Location</p>
               </div>
             </div>
             <span class="text-white/40 text-sm">Lilongwe</span>
          </div>

          <!-- Maximum Distance -->
          <div class="p-4 border-b border-white/5 space-y-3">
             <div class="flex items-center justify-between">
               <p class="text-sm font-bold text-white">Maximum Distance</p>
               <p class="text-sm font-bold text-white/80">{{ distance }}km</p>
             </div>
             <input type="range" v-model="distance" min="1" max="100" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500">
          </div>

          <!-- Age Range -->
          <div class="p-4 border-b border-white/5 space-y-3">
             <div class="flex items-center justify-between">
               <p class="text-sm font-bold text-white">Age Range</p>
               <p class="text-sm font-bold text-white/80">{{ ageRange[0] }} - {{ ageRange[1] }}</p>
             </div>
             <div class="flex items-center gap-4">
               <input type="range" v-model="ageRange[0]" min="18" max="50" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500">
               <input type="range" v-model="ageRange[1]" min="25" max="100" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500">
             </div>
          </div>
        </div>

        <div class="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
           <div class="p-4 border-b border-white/5 flex items-center justify-between">
             <p class="text-sm font-bold text-white">Region Preference</p>
             <span class="text-emerald-500 text-xs font-bold">{{ selectedRegion }}</span>
           </div>
           
           <div class="p-2 space-y-1">
             <button 
               v-for="region in regions" 
               :key="region"
               @click="selectedRegion = region"
               class="w-full flex items-center justify-between p-3 rounded-xl transition-colors"
               :class="selectedRegion === region ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-white/5 text-white/60'"
             >
               <span class="text-sm font-medium">{{ region }}</span>
               <div v-if="selectedRegion === region" class="w-2 h-2 rounded-full bg-emerald-500"></div>
             </button>
           </div>
        </div>
      </section>

      <!-- Notifications -->
      <section class="space-y-4">
        <h2 class="text-xs font-bold text-white/40 uppercase tracking-widest pl-2">Notifications</h2>
        <div class="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
           
           <div class="p-4 border-b border-white/5 flex items-center justify-between">
             <p class="text-sm font-bold text-white">New Matches</p>
             <div 
               class="w-12 h-7 rounded-full p-1 transition-colors cursor-pointer"
               :class="notifications.matches ? 'bg-emerald-500' : 'bg-white/10'"
               @click="notifications.matches = !notifications.matches"
             >
               <div class="w-5 h-5 bg-white rounded-full shadow-sm transition-transform" :class="notifications.matches ? 'translate-x-5' : 'translate-x-0'"></div>
             </div>
           </div>

           <div class="p-4 border-b border-white/5 flex items-center justify-between">
             <p class="text-sm font-bold text-white">Messages</p>
             <div 
               class="w-12 h-7 rounded-full p-1 transition-colors cursor-pointer"
               :class="notifications.messages ? 'bg-emerald-500' : 'bg-white/10'"
               @click="notifications.messages = !notifications.messages"
             >
               <div class="w-5 h-5 bg-white rounded-full shadow-sm transition-transform" :class="notifications.messages ? 'translate-x-5' : 'translate-x-0'"></div>
             </div>
           </div>

           <div class="p-4 flex items-center justify-between">
             <p class="text-sm font-bold text-white">Promotions</p>
             <div 
               class="w-12 h-7 rounded-full p-1 transition-colors cursor-pointer"
               :class="notifications.promotions ? 'bg-emerald-500' : 'bg-white/10'"
               @click="notifications.promotions = !notifications.promotions"
             >
               <div class="w-5 h-5 bg-white rounded-full shadow-sm transition-transform" :class="notifications.promotions ? 'translate-x-5' : 'translate-x-0'"></div>
             </div>
           </div>

        </div>
      </section>

      <!-- Legal & Danger Zone -->
      <section class="space-y-4 pt-4">
        <div class="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
           <button class="w-full p-4 text-left text-sm font-bold text-white/80 hover:bg-white/5 border-b border-white/5 transition-colors">
             Privacy Policy
           </button>
           <button class="w-full p-4 text-left text-sm font-bold text-white/80 hover:bg-white/5 transition-colors">
             Terms of Service
           </button>
        </div>

        <button class="w-full p-4 rounded-2xl border border-white/10 text-white/40 font-bold hover:bg-white/5 hover:text-white transition-colors text-sm">
           Share Kondani
        </button>

        <div class="flex flex-col items-center gap-4 pt-8 pb-12">
           <p class="text-white/20 text-xs font-mono">Version 1.0.0 (Build 104)</p>
           <button class="text-red-500/80 font-bold text-sm hover:text-red-400">Delete Account</button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { ArrowLeft as ArrowLeftIcon, MapPin as MapPinIcon } from 'lucide-vue-next'

const router = useRouter()
const settingsStore = useSettingsStore()

// Use storeToRefs to keep reactivity while destructuring
const { distance, ageRange, selectedRegion, notifications } = storeToRefs(settingsStore)

const regions = ['Whole Malawi', 'Central Region', 'Southern Region', 'Northern Region']

</script>

<style scoped>
/* Custom Range Slider styling could go here if needed */
</style>
