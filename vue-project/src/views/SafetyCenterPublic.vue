<template>
  <div class="min-h-screen bg-deep-950 text-white relative overflow-hidden">
    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
    </div>

    <!-- Header -->
    <nav class="relative z-10 bg-deep-950/80 backdrop-blur-xl border-b border-white/5 p-4">
      <div class="max-w-7xl mx-auto">
        <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-xl">❤️</span>
          </div>
          <span class="text-2xl font-bold font-display">Kondani</span>
        </router-link>
      </div>
    </nav>

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <div class="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          🛡️
        </div>
        <h1 class="text-4xl md:text-5xl font-bold font-display mb-4">Safety Center</h1>
        <p class="text-white/60">Your safety is our top priority. Here's how we keep you protected.</p>
      </div>

      <div class="space-y-8">
        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">💡</span> Safe Dating Tips
          </h2>
          <ul class="space-y-3 text-white/80">
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-1">✓</span>
              <span>Meet in public places for first dates</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-1">✓</span>
              <span>Tell a friend or family member where you're going</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-1">✓</span>
              <span>Use video calls to verify identity before meeting</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-1">✓</span>
              <span>Never share financial information or send money</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 mt-1">✓</span>
              <span>Trust your instincts - if something feels wrong, it probably is</span>
            </li>
          </ul>
        </section>

        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">🚨</span> How to Report
          </h2>
          <p class="text-white/80 mb-4">If you encounter inappropriate behavior:</p>
          <ol class="space-y-3 text-white/80 list-decimal list-inside ml-4">
            <li>Tap the three dots on the user's profile</li>
            <li>Select "Report User"</li>
            <li>Choose the reason (harassment, fake profile, scam, etc.)</li>
            <li>Provide details if possible</li>
          </ol>
          <p class="text-emerald-400 mt-4">Our team reviews all reports within 24 hours.</p>
        </section>

        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">📱</span> Emergency Contacts
          </h2>
          <div class="space-y-4">
            <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 class="font-bold text-white mb-2">Malawi Police Service</h3>
              <a href="tel:997" class="text-2xl font-bold text-red-400 hover:text-red-300">997</a>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 class="font-bold text-white mb-2">Kondani Support</h3>
              <p class="text-emerald-400">support@kondani.mw</p>
              <p class="text-white/60 text-sm mt-1">Available 24/7 for urgent safety concerns</p>
            </div>
          </div>
        </section>

        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-4">Community Guidelines</h2>
          <p class="text-white/80 mb-4">We do not tolerate:</p>
          <ul class="space-y-2 text-white/80">
            <li>• Harassment or bullying</li>
            <li>• Hate speech or discrimination</li>
            <li>• Fake profiles or catfishing</li>
            <li>• Solicitation or scams</li>
            <li>• Sharing explicit content without consent</li>
          </ul>
          <p class="text-white/60 text-sm mt-4">Violations may result in account suspension or permanent ban.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
// Safety Center page
</script>
