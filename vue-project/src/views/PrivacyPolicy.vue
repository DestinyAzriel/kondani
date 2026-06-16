<template>
  <div class="min-h-screen k-page text-white relative overflow-hidden">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[130px]" style="background:radial-gradient(circle,rgba(244,183,64,.1),transparent 70%)"></div>
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
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:rgba(244,183,64,.12);color:var(--k-gold)"><Lock :size="30" /></div>
        <h1 class="k-serif" style="font-size:clamp(2rem,4vw,3rem);line-height:1.1">Privacy Policy</h1>
        <p class="text-white/55 mt-4">Your data, your control. Last updated December 2024.</p>
      </div>

      <div class="priv-cols">
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">1. Information we collect</h2>
          <p class="text-white/70 text-sm mb-3">We collect information you provide directly:</p>
          <ul class="plist">
            <li>Phone number and verification data</li>
            <li>Profile information (name, age, photos, interests)</li>
            <li>Location (your district within Malawi)</li>
            <li>Messages and interactions with other users</li>
          </ul>
        </section>

        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">2. How we use it</h2>
          <ul class="plist">
            <li>To provide and improve our dating services</li>
            <li>To match you with compatible people</li>
            <li>To process payments via Airtel Money &amp; TNM Mpamba</li>
            <li>To keep Kondani safe and prevent fraud</li>
            <li>To send important account updates</li>
          </ul>
        </section>

        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">3. Data security</h2>
          <p class="text-white/70 text-sm leading-relaxed">We use industry-standard encryption to protect your data. Your messages are private, and we never sell your personal information to third parties.</p>
        </section>

        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">4. Your rights</h2>
          <p class="text-white/70 text-sm mb-3">You have the right to:</p>
          <ul class="plist">
            <li>Access your personal data</li>
            <li>Delete your account at any time</li>
            <li>Opt out of promotional messages</li>
            <li>Update your information whenever you like</li>
          </ul>
        </section>

        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">5. Contact us</h2>
          <p class="text-white/70 text-sm mb-1">For privacy concerns or data requests:</p>
          <p class="text-gold-300 text-sm">privacy@kondani.mw</p>
          <p class="text-white/50 text-xs mt-3">We respond to all requests within 7 business days.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { Lock } from 'lucide-vue-next'
</script>

<style scoped>
.priv-cols > * { margin-bottom: 1.25rem; }
.plist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.plist li { position: relative; padding-left: 18px; font-size: 14px; color: rgba(241,248,246,.7); line-height: 1.5; }
.plist li::before { content: ""; position: absolute; left: 0; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: var(--k-gold); }
@media (min-width: 1024px) {
  .priv-cols { column-count: 2; column-gap: 1.25rem; }
  .priv-cols > * { break-inside: avoid; }
}
</style>
