<template>
  <div class="min-h-screen k-page text-white relative overflow-hidden">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[130px]" style="background:radial-gradient(circle,rgba(244,183,64,.11),transparent 70%)"></div>
      <div class="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[130px]" style="background:radial-gradient(circle,rgba(45,212,191,.08),transparent 70%)"></div>
    </div>

    <!-- Header -->
    <nav class="relative z-10 bg-night-950/80 backdrop-blur-xl border-b border-white/5 p-4">
      <div class="max-w-5xl mx-auto">
        <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
          <KondaniMark :size="38" />
          <span class="k-serif text-2xl">Kondani</span>
        </router-link>
      </div>
    </nav>

    <div class="relative z-10 max-w-5xl mx-auto px-4 py-14 lg:py-20">
      <!-- Hero -->
      <div class="text-center max-w-2xl mx-auto mb-14">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:rgba(244,183,64,.12);color:var(--k-gold)"><ShieldCheck :size="32" /></div>
        <h1 class="k-serif" style="font-size:clamp(2rem,4vw,3rem);line-height:1.1">Your safety comes first.</h1>
        <p class="text-white/60 mt-4 text-base sm:text-lg">Kondani is built on verified, real people — and these habits keep every connection safe.</p>
      </div>

      <!-- Tips grid -->
      <section class="mb-12">
        <p class="k-label mb-4">Safe dating tips</p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="t in tips" :key="t.title" class="k-card" style="padding:22px">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4" :style="t.tile"><component :is="t.icon" :size="20" /></div>
            <h3 class="k-serif text-lg mb-2">{{ t.title }}</h3>
            <p class="text-white/60 text-sm leading-relaxed">{{ t.body }}</p>
          </div>
        </div>
      </section>

      <!-- Two columns -->
      <div class="grid lg:grid-cols-2 gap-6 items-start">
        <!-- Guidelines -->
        <section>
          <p class="k-label mb-4">Community guidelines</p>
          <div class="k-card overflow-hidden">
            <div v-for="(g, i) in guidelines" :key="i">
              <div class="flex gap-4 p-5">
                <component :is="g.icon" :size="20" class="mt-0.5 flex-shrink-0" :style="`color:${g.color}`" />
                <div><h3 class="font-semibold text-sm">{{ g.title }}</h3><p class="text-white/55 text-xs mt-1 leading-relaxed">{{ g.body }}</p></div>
              </div>
              <div v-if="i < guidelines.length - 1" class="h-px bg-white/5"></div>
            </div>
          </div>
        </section>

        <!-- Report + Emergency -->
        <section class="space-y-4">
          <p class="k-label mb-4">If something goes wrong</p>
          <div class="k-card" style="padding:20px">
            <h3 class="font-semibold mb-3 flex items-center gap-2"><Flag :size="17" style="color:var(--k-gold)" /> How to report</h3>
            <ol class="rlist">
              <li>Open the menu on the person's profile</li>
              <li>Choose “Report”</li>
              <li>Pick a reason (harassment, fake profile, scam…)</li>
              <li>Add details if you can</li>
            </ol>
            <p class="text-gold-300 text-xs mt-4">Our team reviews every report within 24 hours.</p>
          </div>

          <div class="k-card flex items-center gap-4" style="padding:18px;border-color:rgba(255,94,94,.25);background:rgba(255,94,94,.06)">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(255,94,94,.14);color:#ff6b6b"><Phone :size="19" /></div>
            <div class="flex-1"><div class="font-semibold text-sm">Malawi Police Service</div><div class="text-xs text-white/55 mt-0.5">In immediate danger, call now.</div></div>
            <a href="tel:997" class="px-4 py-2 rounded-full text-sm font-bold" style="background:#ff6b6b;color:#1a0606">997</a>
          </div>

          <div class="k-card" style="padding:18px">
            <h3 class="font-semibold text-sm mb-1">Kondani support</h3>
            <p class="text-gold-300 text-sm">support@kondani.mw</p>
            <p class="text-white/50 text-xs mt-1">Available 24/7 for urgent safety concerns.</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { ShieldCheck, MapPin, Video, Ban, Compass, MessageCircle, Users, Heart, BadgeCheck, Flag, Phone } from 'lucide-vue-next'

const tips = [
  { title: 'Meet in public', body: 'For first dates, pick a café or mall. Never meet at someone\'s home.', icon: MapPin, tile: 'background:rgba(244,183,64,.13);color:var(--k-gold)' },
  { title: 'Tell someone', body: 'Let a friend or family member know where you\'re going and when.', icon: Users, tile: 'background:rgba(45,212,191,.14);color:var(--k-lagoon)' },
  { title: 'Video call first', body: 'A quick video call helps confirm someone is who they say they are.', icon: Video, tile: 'background:rgba(244,183,64,.13);color:var(--k-gold)' },
  { title: 'Never send money', body: 'Don\'t share financial info or send money — that\'s the #1 scam sign.', icon: Ban, tile: 'background:rgba(255,122,107,.14);color:var(--k-coral)' },
  { title: 'Trust your gut', body: 'If something feels off, it probably is. Unmatch or block anytime.', icon: Compass, tile: 'background:rgba(45,212,191,.14);color:var(--k-lagoon)' },
  { title: 'Keep it on Kondani', body: 'Stay on the app until you feel completely safe with someone.', icon: MessageCircle, tile: 'background:rgba(244,183,64,.13);color:var(--k-gold)' }
]

const guidelines = [
  { title: 'Be respectful', body: 'Kindness always. Harassment, hate speech and bullying get you banned.', icon: Heart, color: 'var(--k-coral)' },
  { title: 'Be authentic', body: 'Recent photos of yourself only. Fake profiles and catfishing are removed.', icon: BadgeCheck, color: 'var(--k-gold)' },
  { title: 'No scams or solicitation', body: 'Selling, begging or scamming has no place on Kondani.', icon: Ban, color: 'var(--k-lagoon)' }
]
</script>

<style scoped>
.rlist { list-style: none; counter-reset: r; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.rlist li { position: relative; padding-left: 32px; font-size: 13.5px; color: rgba(241,248,246,.75); line-height: 1.5; counter-increment: r; }
.rlist li::before { content: counter(r); position: absolute; left: 0; top: -1px; width: 22px; height: 22px; border-radius: 50%;
  background: rgba(244,183,64,.14); color: var(--k-gold); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
</style>
