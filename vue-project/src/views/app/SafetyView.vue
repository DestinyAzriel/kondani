<template>
  <div class="safety-view min-h-screen bg-night-950 text-white pb-24 relative overflow-hidden">

    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px]" style="background: radial-gradient(circle, rgba(45,212,191,.12), transparent 70%)"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px]" style="background: radial-gradient(circle, rgba(244,183,64,.1), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="relative z-10 bg-night-950/90 backdrop-blur-md border-b border-white/5 sticky top-0">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
        <button @click="router.back()" class="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeftIcon size="24" />
        </button>
        <h1 class="text-xl font-bold text-white tracking-tight">Safety Center</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-8">

      <!-- Safety Tips Carousel -->
      <section>
        <div class="flex items-center justify-between mb-4 px-2">
          <h2 class="text-xs font-bold text-white/40 uppercase tracking-widest">Safe Dating Tips</h2>
          <span class="text-lagoon-300 text-xs font-bold">View All</span>
        </div>
        
        <div class="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
           <!-- Tip Card 1 -->
           <div class="min-w-[280px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 snap-center">
             <div class="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
               <MessageCircleIcon size="20" />
             </div>
             <h3 class="text-white font-bold text-lg mb-2">Keep it on the app</h3>
             <p class="text-white/60 text-sm leading-relaxed">
               Don't move to WhatsApp or other apps too quickly. Keep the conversation on Kondani until you feel completely safe.
             </p>
           </div>

           <!-- Tip Card 2 -->
           <div class="min-w-[280px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 snap-center">
             <div class="w-10 h-10 rounded-full bg-lagoon-400/20 text-lagoon-300 flex items-center justify-center mb-4">
               <MapPinIcon size="20" />
             </div>
             <h3 class="text-white font-bold text-lg mb-2">Meet in Public</h3>
             <p class="text-white/60 text-sm leading-relaxed">
               For your first date, always choose a public place like a coffee shop or mall. Never meet at someone's home.
             </p>
           </div>

           <!-- Tip Card 3 -->
           <div class="min-w-[280px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 snap-center">
             <div class="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
               <ShieldIcon size="20" />
             </div>
             <h3 class="text-white font-bold text-lg mb-2">Trust your gut</h3>
             <p class="text-white/60 text-sm leading-relaxed">
               If something feels off, it probably is. You can unmatch or block anyone at any time.
             </p>
           </div>
        </div>
      </section>

      <!-- Guidelines -->
      <section class="space-y-4">
        <h2 class="text-xs font-bold text-white/40 uppercase tracking-widest pl-2">Community Guidelines</h2>
        <div class="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm p-5 space-y-4">
           <div class="flex gap-4">
             <div class="mt-1">
               <HeartIcon size="20" class="text-red-400" />
             </div>
             <div>
               <h3 class="text-white font-bold text-sm">Be Respectful</h3>
               <p class="text-white/50 text-xs mt-1 leading-relaxed">Treat everyone with kindness and respect. Harassment, hate speech, and bullying are not tolerated.</p>
             </div>
           </div>
           
           <div class="h-px bg-white/5 w-full"></div>

           <div class="flex gap-4">
             <div class="mt-1">
               <CameraIcon size="20" class="text-blue-400" />
             </div>
             <div>
               <h3 class="text-white font-bold text-sm">Be Yourself</h3>
               <p class="text-white/50 text-xs mt-1 leading-relaxed">Upload recent photos of yourself. Impersonation and fake profiles will be banned.</p>
             </div>
           </div>
        </div>
      </section>

      <!-- Tools -->
      <section class="space-y-4">
        <h2 class="text-xs font-bold text-white/40 uppercase tracking-widest pl-2">Tools & Support</h2>
        <div class="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
           <button @click="openReport" class="w-full p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
             <div>
               <p class="text-sm font-bold text-white">How to Report</p>
               <p class="text-xs text-white/40">Learn how to report suspicious behavior</p>
             </div>
             <ChevronRightIcon size="20" class="text-white/20 group-hover:text-white/60" />
           </button>
           
           <button @click="openResources" class="w-full p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
             <div>
               <p class="text-sm font-bold text-white">Safety Resources</p>
               <p class="text-xs text-white/40">Helplines and local emergency contacts</p>
             </div>
             <ChevronRightIcon size="20" class="text-white/20 group-hover:text-white/60" />
           </button>

           <button @click="openResources" class="w-full p-4 text-center hover:bg-white/5 transition-colors">
             <span class="text-xs font-bold text-white/40">View Full Safety Policy</span>
           </button>
        </div>
      </section>

      <div class="text-center pt-8 pb-12 px-8">
        <p class="text-white/30 text-xs leading-relaxed">
          Kondani is committed to your safety. If you are in immediate danger, please call local emergency services (997) properly.
        </p>
        <button @click="callEmergency" class="mt-4 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full text-xs font-bold border border-red-500/20 transition-colors">
          Call Emergency
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { 
  ArrowLeft as ArrowLeftIcon, 
  MessageCircle as MessageCircleIcon,
  MapPin as MapPinIcon,
  Shield as ShieldIcon,
  Heart as HeartIcon,
  Camera as CameraIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-vue-next'

const router = useRouter()
const { info, error } = useToast()

const openReport = () => {
  info('Report flow would open here')
}

const openResources = () => {
  info('Opening Safety Resources PDF...')
}

const callEmergency = () => {
  if (confirm('Call 997 (Police)?')) {
     window.location.href = 'tel:997'
  }
}
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
