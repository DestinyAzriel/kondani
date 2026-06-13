<template>
  <div class="min-h-screen bg-deep-950 text-white selection:bg-emerald-500 selection:text-white overflow-x-hidden">
    <!-- Background Elements -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow" style="animation-delay: 2s"></div>
    </div>

    <!-- Navbar -->
    <nav class="fixed w-full z-50 bg-deep-950/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center gap-3 group cursor-pointer">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span class="text-xl">❤️</span>
            </div>
            <span class="text-2xl font-bold font-display tracking-tight">Kondani</span>
          </div>
          
          <div class="hidden md:flex items-center gap-8">
            <a @click.prevent="scrollToSection('features')" href="#features" class="text-sm font-medium text-white/70 hover:text-emerald-400 transition-colors cursor-pointer">Features</a>
            <a @click.prevent="scrollToSection('safety')" href="#safety" class="text-sm font-medium text-white/70 hover:text-emerald-400 transition-colors cursor-pointer">Safety</a>
            <div class="flex items-center gap-4">
              <router-link to="/login" class="text-sm font-semibold text-white hover:text-emerald-400 transition-colors">
                Sign in
              </router-link>
              <router-link to="/register" class="btn-primary">
                Get Started
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-sm font-medium text-emerald-300">#1 Trusted Dating App in Malawi</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl font-bold font-display tracking-tight mb-8 leading-tight animate-slide-up">
          Find Real Love in <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">The Warm Heart of Africa</span>
        </h1>
        
        <p class="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style="animation-delay: 0.1s">
          Connect with genuine Malawians who share your values. Verified profiles, local payments, and a community built on trust.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style="animation-delay: 0.2s">
          <router-link to="/register" class="btn-primary text-lg px-8 py-4 w-full sm:w-auto min-w-[200px]">
            Join Now - It's Free
          </router-link>
          <button class="px-8 py-4 rounded-full bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 transition-all w-full sm:w-auto min-w-[200px] backdrop-blur-md">
            Learn More
          </button>
        </div>
        
        <!-- "Secured By" section removed -->
      </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="py-24 relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold font-display mb-4">Why Choose Kondani?</h2>
          <p class="text-white/60 max-w-2xl mx-auto">We've built a platform specifically for Malawians, addressing local needs and safety concerns.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 group">
            <div class="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-emerald-500/20 transition-colors">
              🛡️
            </div>
            <h3 class="text-xl font-bold mb-3">Verified Profiles</h3>
            <p class="text-white/60 leading-relaxed">
              Every user is verified using government ID or phone number. Say goodbye to catfish and bots.
            </p>
          </div>
          
          <div class="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 group">
            <div class="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-emerald-500/20 transition-colors">
              🇲🇼
            </div>
            <h3 class="text-xl font-bold mb-3">Made for Malawi</h3>
            <p class="text-white/60 leading-relaxed">
              Local payment integration with Airtel Money and Mpamba. Interface available in Chichewa (coming soon).
            </p>
          </div>
          
          <div class="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 group">
            <div class="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-emerald-500/20 transition-colors">
              🔒
            </div>
            <h3 class="text-xl font-bold mb-3">Private & Secure</h3>
            <p class="text-white/60 leading-relaxed">
              Your data is encrypted. We have strict community guidelines to ensure a respectful environment.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="relative z-10 border-t border-white/10 py-12 bg-deep-950/50 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span class="text-xl">❤️</span>
            </div>
            <span class="text-2xl font-bold font-display tracking-tight">Kondani</span>
          </div>
          
          <div class="flex items-center gap-6">
            <router-link to="/privacy" class="text-white/60 hover:text-emerald-400 transition-colors text-sm">Privacy</router-link>
            <router-link to="/safety-center" class="text-white/60 hover:text-emerald-400 transition-colors text-sm">Safety</router-link>
            <router-link to="/support" class="text-white/60 hover:text-emerald-400 transition-colors text-sm">Support</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
/* Custom animations if needed, but using Tailwind utilities mostly */
</style>