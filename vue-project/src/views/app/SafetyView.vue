<template>
  <div class="safety-view k-page pb-28 relative overflow-hidden">
    <div class="k-stars"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]" style="background:radial-gradient(circle,rgba(244,183,64,.12),transparent 70%)"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[480px] h-[480px] rounded-full blur-[120px]" style="background:radial-gradient(circle,rgba(45,212,191,.08),transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="relative z-10 bg-night-950/90 backdrop-blur-md border-b border-white/5 sticky top-0">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        <button @click="router.back()" class="k-iconbtn"><ArrowLeftIcon :size="20" /></button>
        <h1 class="k-title" style="font-size:1.5rem">Safety Center</h1>
      </div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto px-4 pt-8">
      <!-- Hero -->
      <div class="text-center max-w-xl mx-auto mb-10">
        <div class="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style="background:rgba(244,183,64,.13);color:var(--k-gold)">
          <ShieldCheck :size="32" />
        </div>
        <h2 class="k-serif" style="font-size:clamp(1.6rem,3vw,2.2rem);line-height:1.15">Date with confidence.</h2>
        <p class="text-white/60 mt-3">Kondani is built on real, verified people — but a few smart habits keep every meetup safe.</p>
      </div>

      <!-- Safety tips -->
      <section class="mb-10">
        <p class="k-label mb-4">Safe dating tips</p>
        <div class="grid gap-4 sm:grid-cols-3">
          <div v-for="t in tips" :key="t.title" class="k-card" style="padding:22px">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4" :style="t.tile">
              <component :is="t.icon" :size="20" />
            </div>
            <h3 class="k-serif text-lg mb-2">{{ t.title }}</h3>
            <p class="text-white/60 text-sm leading-relaxed">{{ t.body }}</p>
          </div>
        </div>
      </section>

      <!-- Two columns on desktop: guidelines + tools -->
      <div class="grid lg:grid-cols-2 gap-6 items-start">
        <!-- Guidelines -->
        <section>
          <p class="k-label mb-4">Community guidelines</p>
          <div class="k-card overflow-hidden">
            <div class="flex gap-4 p-5">
              <Heart :size="20" class="mt-0.5 flex-shrink-0" style="color:var(--k-coral)" />
              <div>
                <h3 class="font-semibold text-sm">Be respectful</h3>
                <p class="text-white/55 text-xs mt-1 leading-relaxed">Treat everyone with kindness. Harassment, hate speech, and bullying are not tolerated.</p>
              </div>
            </div>
            <div class="h-px bg-white/5"></div>
            <div class="flex gap-4 p-5">
              <BadgeCheck :size="20" class="mt-0.5 flex-shrink-0" style="color:var(--k-gold)" />
              <div>
                <h3 class="font-semibold text-sm">Be yourself</h3>
                <p class="text-white/55 text-xs mt-1 leading-relaxed">Upload recent photos of yourself. Impersonation and fake profiles get banned.</p>
              </div>
            </div>
            <div class="h-px bg-white/5"></div>
            <div class="flex gap-4 p-5">
              <Lock :size="20" class="mt-0.5 flex-shrink-0" style="color:var(--k-lagoon)" />
              <div>
                <h3 class="font-semibold text-sm">Protect your privacy</h3>
                <p class="text-white/55 text-xs mt-1 leading-relaxed">Never share financial details, and keep chats on Kondani until you trust someone.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Tools -->
        <section>
          <p class="k-label mb-4">Tools &amp; support</p>
          <div class="k-card overflow-hidden">
            <button @click="openReport" class="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
              <div class="flex items-center gap-3.5">
                <span class="k-row-ic"><Flag :size="16" /></span>
                <div><p class="text-sm font-medium">How to report</p><p class="text-xs text-white/45">Report suspicious behaviour</p></div>
              </div>
              <ChevronRightIcon :size="18" class="text-white/25 group-hover:text-white/60" />
            </button>
            <button @click="openResources" class="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
              <div class="flex items-center gap-3.5">
                <span class="k-row-ic"><LifeBuoy :size="16" /></span>
                <div><p class="text-sm font-medium">Safety resources</p><p class="text-xs text-white/45">Helplines &amp; emergency contacts</p></div>
              </div>
              <ChevronRightIcon :size="18" class="text-white/25 group-hover:text-white/60" />
            </button>
            <button @click="openResources" class="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
              <div class="flex items-center gap-3.5">
                <span class="k-row-ic"><FileText :size="16" /></span>
                <div><p class="text-sm font-medium">Full safety policy</p><p class="text-xs text-white/45">How we keep Kondani safe</p></div>
              </div>
              <ChevronRightIcon :size="18" class="text-white/25 group-hover:text-white/60" />
            </button>
          </div>

          <!-- Emergency -->
          <div class="k-card mt-4 flex items-center gap-4" style="padding:18px;border-color:rgba(255,94,94,.25);background:rgba(255,94,94,.06)">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(255,94,94,.14);color:#ff6b6b"><Phone :size="19" /></div>
            <div class="flex-1"><div class="font-semibold text-sm">In immediate danger?</div><div class="text-xs text-white/55 mt-0.5">Call the Malawi Police Service.</div></div>
            <button @click="callEmergency" class="px-4 py-2 rounded-full text-sm font-bold" style="background:#ff6b6b;color:#1a0606">997</button>
          </div>
        </section>
      </div>

      <p class="text-center text-white/30 text-xs mt-10 max-w-md mx-auto leading-relaxed">
        Kondani is committed to your safety. If you are in immediate danger, please call local emergency services.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import {
  ArrowLeft as ArrowLeftIcon, MessageCircle, MapPin, Shield, ShieldCheck,
  Heart, BadgeCheck, Lock, Flag, LifeBuoy, FileText, Phone,
  ChevronRight as ChevronRightIcon
} from 'lucide-vue-next'

const router = useRouter()
const { info } = useToast()

const tips = [
  { title: 'Keep it on the app', body: "Don't rush to WhatsApp or other apps. Keep chatting on Kondani until you feel completely safe.", icon: MessageCircle, tile: 'background:rgba(244,183,64,.13);color:var(--k-gold)' },
  { title: 'Meet in public', body: 'For a first date, pick a public place like a café or mall. Never meet at someone\'s home.', icon: MapPin, tile: 'background:rgba(45,212,191,.14);color:var(--k-lagoon)' },
  { title: 'Trust your gut', body: 'If something feels off, it probably is. You can unmatch or block anyone, anytime.', icon: Shield, tile: 'background:rgba(244,183,64,.13);color:var(--k-gold)' }
]

const openReport = () => info('Tap the menu on any profile, then "Report" — our team reviews within 24 hours.')
const openResources = () => info('Safety resources are coming soon.')
const callEmergency = () => { if (confirm('Call 997 (Police)?')) window.location.href = 'tel:997' }
</script>

<style scoped>
.safety-view { overflow-x: hidden; }
</style>
