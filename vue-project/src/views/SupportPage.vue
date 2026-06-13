<template>
  <div class="min-h-screen bg-deep-950 text-white relative overflow-hidden">
    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
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
        <div class="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          💬
        </div>
        <h1 class="text-4xl md:text-5xl font-bold font-display mb-4">Support Center</h1>
        <p class="text-white/60">We're here to help! Get answers to common questions or contact us directly.</p>
      </div>

      <div class="space-y-8">
        <!-- FAQ Section -->
        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div class="space-y-4">
            <details class="group">
              <summary class="cursor-pointer font-bold text-white hover:text-emerald-400 transition-colors list-none flex items-center justify-between">
                <span>How do I verify my profile?</span>
                <span class="text-emerald-500">+</span>
              </summary>
              <p class="text-white/70 mt-3 pl-4">Go to Settings → Verification and upload a photo of your government ID or complete phone verification via SMS.</p>
            </details>

            <details class="group">
              <summary class="cursor-pointer font-bold text-white hover:text-emerald-400 transition-colors list-none flex items-center justify-between">
                <span>How do I subscribe to Premium?</span>
                <span class="text-emerald-500">+</span>
              </summary>
              <p class="text-white/70 mt-3 pl-4">Tap the Premium banner on your profile or Likes page. Choose a plan and pay via Airtel Money or TNM Mpamba.</p>
            </details>

            <details class="group">
              <summary class="cursor-pointer font-bold text-white hover:text-emerald-400 transition-colors list-none flex items-center justify-between">
                <span>How do I delete my account?</span>
                <span class="text-emerald-500">+</span>
              </summary>
              <p class="text-white/70 mt-3 pl-4">Go to Settings → Account → Delete Account. This action is permanent and cannot be undone.</p>
            </details>

            <details class="group">
              <summary class="cursor-pointer font-bold text-white hover:text-emerald-400 transition-colors list-none flex items-center justify-between">
                <span>What payment methods do you accept?</span>
                <span class="text-emerald-500">+</span>
              </summary>
              <p class="text-white/70 mt-3 pl-4">We accept Airtel Money and TNM Mpamba for all subscriptions and in-app purchases.</p>
            </details>

            <details class="group">
              <summary class="cursor-pointer font-bold text-white hover:text-emerald-400 transition-colors list-none flex items-center justify-between">
                <span>How do I report a user?</span>
                <span class="text-emerald-500">+</span>
              </summary>
              <p class="text-white/70 mt-3 pl-4">Tap the three dots on their profile and select "Report User". Our team reviews all reports within 24 hours.</p>
            </details>
          </div>
        </section>

        <!-- Contact Section -->
        <section class="glass-card p-8">
          <h2 class="text-2xl font-bold text-white mb-6">Contact Us</h2>
          <div class="space-y-6">
            <div>
              <h3 class="font-bold text-white mb-2">Email Support</h3>
              <a href="mailto:support@kondani.mw" class="text-emerald-400 hover:text-emerald-300 transition-colors">
                support@kondani.mw
              </a>
              <p class="text-white/60 text-sm mt-1">We respond within 24 hours</p>
            </div>

            <div>
              <h3 class="font-bold text-white mb-2">WhatsApp Support</h3>
              <a 
                href="https://wa.me/265991234567" 
                target="_blank"
                class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-500 transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Chat on WhatsApp
              </a>
              <p class="text-white/60 text-sm mt-2">Available Monday-Friday, 8AM-5PM CAT</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
// Support page
</script>
