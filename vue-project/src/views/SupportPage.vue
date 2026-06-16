<template>
  <div class="min-h-screen k-page text-white relative overflow-hidden">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[130px]" style="background:radial-gradient(circle,rgba(244,183,64,.12),transparent 70%)"></div>
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
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:rgba(244,183,64,.12);color:var(--k-gold)"><LifeBuoy :size="32" /></div>
        <h1 class="k-serif" style="font-size:clamp(2rem,4vw,3rem);line-height:1.1">How can we help?</h1>
        <p class="text-white/60 mt-4 text-base sm:text-lg">Answers to common questions, or reach us directly — we usually reply within 24 hours.</p>
      </div>

      <div class="grid lg:grid-cols-3 gap-8 items-start">
        <!-- FAQ -->
        <div class="lg:col-span-2">
          <p class="k-label mb-4">Frequently asked</p>
          <div class="space-y-3">
            <details v-for="(f, i) in faqs" :key="i" class="faq k-card">
              <summary>
                <span class="font-semibold text-[15px]">{{ f.q }}</span>
                <ChevronDown :size="18" class="chev text-white/40" />
              </summary>
              <p class="text-white/65 text-sm leading-relaxed mt-3">{{ f.a }}</p>
            </details>
          </div>
        </div>

        <!-- Contact -->
        <div class="lg:sticky lg:top-6 space-y-4">
          <div class="k-card" style="padding:20px">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:rgba(244,183,64,.12);color:var(--k-gold)"><Mail :size="18" /></div>
            <h3 class="font-semibold mb-1">Email support</h3>
            <a href="mailto:support@kondani.mw" class="text-gold-300 hover:opacity-80 transition-opacity text-sm">support@kondani.mw</a>
            <p class="text-white/50 text-xs mt-1.5">We respond within 24 hours.</p>
          </div>

          <div class="k-card" style="padding:20px">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:rgba(45,212,191,.13);color:var(--k-lagoon)"><MessageCircle :size="18" /></div>
            <h3 class="font-semibold mb-1">WhatsApp</h3>
            <p class="text-white/50 text-xs mb-3">Mon–Fri, 8AM–5PM CAT</p>
            <a href="https://wa.me/265991234567" target="_blank" class="k-btn k-btn-gold w-full" style="padding:11px;font-size:13px">Chat on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { LifeBuoy, Mail, MessageCircle, ChevronDown } from 'lucide-vue-next'

const faqs = [
  { q: 'How do I verify my profile?', a: 'Open your profile and tap “Get verified”. Take a quick selfie matching the on-screen pose — our system compares it to your photos. No ID needed.' },
  { q: 'How do I subscribe to Kondani Gold?', a: 'Tap the Gold banner on your profile or Likes page, then pay MWK 600/month via Airtel Money or TNM Mpamba. Features unlock the moment payment is confirmed.' },
  { q: 'How do I delete my account?', a: 'Go to Settings → Account actions → Delete account. This is permanent and cannot be undone.' },
  { q: 'What payment methods do you accept?', a: 'Airtel Money and TNM Mpamba for all subscriptions and in-app purchases.' },
  { q: 'How do I report someone?', a: 'Tap the menu on their profile and choose “Report”. Our team reviews every report within 24 hours.' }
]
</script>

<style scoped>
.faq { padding: 16px 18px; cursor: pointer; }
.faq summary { display: flex; align-items: center; justify-content: between; gap: 12px; list-style: none; justify-content: space-between; }
.faq summary::-webkit-details-marker { display: none; }
.faq .chev { transition: transform .25s ease; }
.faq[open] .chev { transform: rotate(180deg); }
</style>
