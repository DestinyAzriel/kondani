<template>
  <div class="min-h-screen bg-night-950 text-white selection:bg-gold-500 selection:text-night-950 overflow-x-hidden relative">
    <!-- Lake of Stars ambiance -->
    <div class="stars fixed inset-0 pointer-events-none"></div>
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[55%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(45,212,191,.18), transparent 70%)"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[55%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(244,183,64,.14), transparent 70%)"></div>
    </div>

    <!-- Navbar -->
    <nav class="fixed w-full z-50 bg-night-950/80 backdrop-blur-xl border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center gap-3 cursor-pointer">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-gold-300 to-gold-500 shadow-lg shadow-gold-500/25">
              <span class="text-xl text-night-950">✦</span>
            </div>
            <span class="text-2xl font-bold font-display tracking-tight">Kondani</span>
          </div>

          <div class="hidden md:flex items-center gap-8">
            <a @click.prevent="scrollToSection('features')" href="#features" class="text-sm font-medium text-white/70 hover:text-gold-300 transition-colors cursor-pointer">Features</a>
            <a @click.prevent="scrollToSection('safety')" href="#safety" class="text-sm font-medium text-white/70 hover:text-gold-300 transition-colors cursor-pointer">Safety</a>
            <router-link to="/login" class="text-sm font-semibold text-white hover:text-gold-300 transition-colors">Sign in</router-link>
            <router-link to="/login" class="btn-gold">Get Started</router-link>
          </div>
          <router-link to="/login" class="btn-gold md:hidden text-sm">Get Started</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="relative pt-36 pb-20 lg:pt-48 lg:pb-32">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-400/30 mb-8 backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
          <span class="text-sm font-medium text-gold-300">🇲🇼 #1 Trusted Dating App in Malawi</span>
        </div>

        <h1 class="text-5xl md:text-7xl font-bold font-display tracking-tight mb-8 leading-[1.1]">
          Find your person<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">under the same stars</span>
        </h1>

        <p class="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          Verified Malawians, real plans, real meetups. The warm heart of Africa — one match at a time.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link to="/login" class="btn-gold text-lg px-8 py-4 w-full sm:w-auto min-w-[200px]">Join free</router-link>
          <a href="#features" @click.prevent="scrollToSection('features')" class="px-8 py-4 rounded-full bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 transition-all w-full sm:w-auto min-w-[200px] backdrop-blur-md text-center">How it works</a>
        </div>

        <div class="flex items-center justify-center gap-8 mt-16">
          <div class="text-center"><div class="text-gold-400 font-display font-extrabold text-2xl">12k+</div><div class="text-white/50 text-xs">Verified</div></div>
          <div class="w-px h-8 bg-white/10"></div>
          <div class="text-center"><div class="text-gold-400 font-display font-extrabold text-2xl">4 cities</div><div class="text-white/50 text-xs">Live now</div></div>
          <div class="w-px h-8 bg-white/10"></div>
          <div class="text-center"><div class="text-gold-400 font-display font-extrabold text-2xl">0</div><div class="text-white/50 text-xs">Bots</div></div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-24 relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold font-display mb-4">Why Kondani?</h2>
          <p class="text-white/60 max-w-2xl mx-auto">Built for Malawi — addressing local needs, safety, and trust.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div class="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 rounded-2xl border border-white/10 bg-white/5">
            <div class="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6">🛡️</div>
            <h3 class="text-xl font-bold mb-3">Verified profiles</h3>
            <p class="text-white/60 leading-relaxed">Every member verifies with a live selfie matched to their photos. No catfish, no bots.</p>
          </div>
          <div class="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 rounded-2xl border border-white/10 bg-white/5">
            <div class="w-14 h-14 bg-lagoon-400/10 rounded-2xl flex items-center justify-center text-3xl mb-6">🇲🇼</div>
            <h3 class="text-xl font-bold mb-3">Made for Malawi</h3>
            <p class="text-white/60 leading-relaxed">Local payments with Airtel Money and TNM Mpamba, and real distance from Lilongwe to Chitipa.</p>
          </div>
          <div class="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 rounded-2xl border border-white/10 bg-white/5">
            <div class="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6">✦</div>
            <h3 class="text-xl font-bold mb-3">Real plans</h3>
            <p class="text-white/60 leading-relaxed">Post what you're up to — coffee, a hike, a night out — and meet people for real, not just chat.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Safety strip -->
    <section id="safety" class="py-16 relative z-10">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <div class="glass-card rounded-2xl border border-lagoon-400/25 bg-lagoon-400/5 p-8">
          <div class="text-3xl mb-3">🔒</div>
          <h3 class="text-2xl font-bold font-display mb-2">Your safety comes first</h3>
          <p class="text-white/60">We never share your number or exact location. Report or block anyone, anytime.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-white/10 py-12 bg-night-950/50 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-gold-300 to-gold-500">
            <span class="text-xl text-night-950">✦</span>
          </div>
          <span class="text-2xl font-bold font-display tracking-tight">Kondani</span>
        </div>
        <div class="flex items-center gap-6">
          <router-link to="/privacy" class="text-white/60 hover:text-gold-300 transition-colors text-sm">Privacy</router-link>
          <router-link to="/safety-center" class="text-white/60 hover:text-gold-300 transition-colors text-sm">Safety</router-link>
          <router-link to="/support" class="text-white/60 hover:text-gold-300 transition-colors text-sm">Support</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const scrollToSection = (sectionId) => {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.btn-gold { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:.7rem 1.5rem;border-radius:9999px;font-weight:700;color:#08161d;border:none;cursor:pointer;background:linear-gradient(90deg,#f59e0b,#ffd27d);box-shadow:0 8px 20px rgba(244,183,64,.3);transition:transform .15s; }
.btn-gold:hover { transform: scale(1.03); }
.stars{background:
  radial-gradient(1.5px 1.5px at 18% 14%, rgba(255,215,130,.9), transparent),
  radial-gradient(1.5px 1.5px at 62% 9%, rgba(255,255,255,.7), transparent),
  radial-gradient(1px 1px at 82% 20%, rgba(255,215,130,.8), transparent),
  radial-gradient(1px 1px at 38% 6%, rgba(255,255,255,.55), transparent),
  radial-gradient(1.5px 1.5px at 90% 7%, rgba(255,255,255,.5), transparent),
  radial-gradient(1px 1px at 10% 26%, rgba(255,215,130,.6), transparent),
  radial-gradient(1px 1px at 50% 16%, rgba(255,255,255,.45), transparent);}
</style>
