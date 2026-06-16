<template>
  <div class="min-h-screen k-page text-white relative overflow-hidden">
    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]" style="background:radial-gradient(circle,rgba(244,183,64,.1),transparent 70%)"></div>
    </div>

    <!-- Header -->
    <nav class="relative z-10 bg-night-950/80 backdrop-blur-xl border-b border-white/5 p-4">
      <div class="max-w-3xl mx-auto">
        <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
          <KondaniMark :size="38" />
          <span class="k-serif text-2xl">Kondani</span>
        </router-link>
      </div>
    </nav>

    <!-- Content -->
    <div class="relative z-10 max-w-3xl mx-auto px-4 py-16">
      <h1 class="k-serif text-4xl md:text-5xl mb-4">Privacy Policy</h1>
      <p class="text-white/60 mb-8">Last updated: December 2024</p>

      <div class="space-y-8 text-white/80 leading-relaxed">
        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
          <p class="mb-4">We collect information you provide directly:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Phone number and verification data</li>
            <li>Profile information (name, age, photos, interests)</li>
            <li>Location data (region within Malawi)</li>
            <li>Messages and interactions with other users</li>
          </ul>
        </section>

        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>To provide and improve our dating services</li>
            <li>To match you with compatible users</li>
            <li>To process payments via Airtel Money and TNM Mpamba</li>
            <li>To ensure safety and prevent fraud</li>
            <li>To send important updates about your account</li>
          </ul>
        </section>

        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4">3. Data Security</h2>
          <p>We use industry-standard encryption to protect your data. Your messages are encrypted, and we never share your personal information with third parties without your consent.</p>
        </section>

        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4">4. Your Rights</h2>
          <p class="mb-4">You have the right to:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Access your personal data</li>
            <li>Request deletion of your account</li>
            <li>Opt-out of promotional communications</li>
            <li>Update your information at any time</li>
          </ul>
        </section>

        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
          <p class="mb-2">For privacy concerns or data requests:</p>
          <p class="text-gold-300">Email: privacy@kondani.mw</p>
          <p class="text-white/60 text-sm mt-4">We respond to all requests within 7 business days.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import KondaniMark from '@/components/ui/KondaniMark.vue'
</script>
