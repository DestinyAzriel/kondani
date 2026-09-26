<template>
  <div class="min-h-screen k-page text-white relative overflow-hidden">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[130px]" style="background:radial-gradient(circle,rgba(244,183,64,.1),transparent 70%)"></div>
      <div class="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[130px]" style="background:radial-gradient(circle,rgba(45,212,191,.08),transparent 70%)"></div>
    </div>

    <!-- Header -->
    <nav class="relative z-10 bg-night-950/80 backdrop-blur-xl border-b border-white/5 p-4">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit select-none" title="Kondani Home">
          <KondaniMark :size="38" />
          <span class="k-serif text-2xl">Kondani</span>
        </router-link>
      </div>
    </nav>

    <div class="relative z-10 max-w-5xl mx-auto px-4 py-14 lg:py-20">
      <!-- Hero -->
      <div class="text-center max-w-2xl mx-auto mb-14">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:rgba(244,183,64,.12);color:var(--k-gold)">
          <FileText :size="30" />
        </div>
        <h1 class="k-serif" style="font-size:clamp(2rem,4vw,3rem);line-height:1.1">Terms of Service</h1>
        <p class="text-white/55 mt-4">The rules governing your use of Kondani. Last updated September 2026.</p>
      </div>

      <div class="terms-cols">
        <!-- 1. Agreement -->
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">1. Acceptance of Terms</h2>
          <p class="text-white/70 text-sm leading-relaxed mb-3">
            By accessing or using Kondani via our web or mobile application, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must not use the platform.
          </p>
          <ul class="tlist">
            <li>You must be at least 18 years old to create an account or use Kondani.</li>
            <li>You must be legally permitted to use dating services under the laws of the Republic of Malawi.</li>
          </ul>
        </section>

        <!-- 2. Community & Conduct -->
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">2. Community Standards &amp; Conduct</h2>
          <p class="text-white/70 text-sm leading-relaxed mb-3">
            Kondani means love. We maintain a respectful, dignified, and safe community for all Malawians:
          </p>
          <ul class="tlist">
            <li><strong>Authentic profiles only:</strong> No impersonation, fake pictures, or misleading personal information.</li>
            <li><strong>Zero tolerance for harassment:</strong> Hate speech, threats, harassment, bullying, or defamation are strictly prohibited.</li>
            <li><strong>No commercial solicitation:</strong> Advertising, selling services, prostitution, financial scams, or requesting money is banned.</li>
            <li><strong>No non-consensual content:</strong> Sharing sexually explicit content, unsolicited nudity, or intimate imagery without consent results in immediate termination.</li>
          </ul>
        </section>

        <!-- 3. Photo & Profile Verification -->
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">3. Identity &amp; Verification</h2>
          <p class="text-white/70 text-sm leading-relaxed mb-3">
            To keep our members safe from bots and catfishing, Kondani employs photo selfie verification:
          </p>
          <ul class="tlist">
            <li>Verification poses are checked against your public photos.</li>
            <li>Verified badges are granted to genuine individuals and can be revoked if photos are altered.</li>
            <li>One account per person is enforced to maintain trust across our districts.</li>
          </ul>
        </section>

        <!-- 4. Subscriptions & Payments -->
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">4. Subscriptions &amp; Payments</h2>
          <p class="text-white/70 text-sm leading-relaxed mb-3">
            Kondani is free to join. Optional premium enhancements (such as Kondani Gold, Unlimited Likes, Who Likes You, and Boosts) are available:
          </p>
          <ul class="tlist">
            <li>Payments are processed securely in Malawian Kwacha (MWK) via local payment gateways including Airtel Money, TNM Mpamba, and PayChangu.</li>
            <li>Pricing and access periods (daily, weekly, monthly, lifetime) are clearly displayed prior to confirmation.</li>
            <li>All purchases are non-refundable once the service or digital benefit has been provisioned, except where required by applicable Malawian consumer law.</li>
          </ul>
        </section>

        <!-- 5. User Content & Safety -->
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">5. Your Content &amp; Privacy</h2>
          <p class="text-white/70 text-sm leading-relaxed mb-3">
            You retain ownership of the photos, bio descriptions, and messages you submit. You grant Kondani a worldwide license to host, display, and format your profile solely for providing our service.
          </p>
          <ul class="tlist">
            <li>You may edit or permanently delete your photos and profile at any time.</li>
            <li>Kondani does not publish your private chats or contact information publicly.</li>
          </ul>
        </section>

        <!-- 6. Offline Meetups & Liability -->
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">6. Safety &amp; In-Person Encounters</h2>
          <p class="text-white/70 text-sm leading-relaxed mb-3">
            While Kondani takes extensive measures to verify users, you are solely responsible for your interactions with other members:
          </p>
          <ul class="tlist">
            <li>Always meet for the first time in populated public places during daylight or busy hours.</li>
            <li>Never send money, airtime, or financial support to anyone you have met online.</li>
            <li>Inform a trusted friend or family member of your whereabouts when meeting in person.</li>
          </ul>
        </section>

        <!-- 7. Account Termination -->
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">7. Suspension &amp; Account Deletion</h2>
          <p class="text-white/70 text-sm leading-relaxed mb-3">
            You can close your account at any time via Settings &gt; Delete Account. Kondani reserves the right to immediately suspend or ban any account that violates these terms or engages in fraudulent activity.
          </p>
        </section>

        <!-- 8. Governing Law & Contact -->
        <section class="k-card" style="padding:24px">
          <h2 class="k-serif text-xl mb-3">8. Governing Law &amp; Contact</h2>
          <p class="text-white/70 text-sm leading-relaxed mb-2">
            These terms are governed by and construed in accordance with the laws of the Republic of Malawi.
          </p>
          <p class="text-white/70 text-sm mb-1">For legal inquiries or terms clarification:</p>
          <p class="text-gold-300 text-sm font-semibold">legal@kondani.mw</p>
          <p class="text-white/50 text-xs mt-2">Support: <router-link to="/support" class="text-gold-400 hover:underline">kondani.mw/support</router-link></p>
        </section>
      </div>

      <!-- Footer navigation links -->
      <div class="mt-14 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
        <p>&copy; {{ new Date().getFullYear() }} Kondani. All rights reserved.</p>
        <div class="flex items-center gap-5">
          <router-link to="/terms" class="text-gold-300 font-semibold">Terms of Service</router-link>
          <router-link to="/privacy" class="hover:text-white transition-colors">Privacy Policy</router-link>
          <router-link to="/safety-center" class="hover:text-white transition-colors">Safety Center</router-link>
          <router-link to="/support" class="hover:text-white transition-colors">Support</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import KondaniMark from '@/components/ui/KondaniMark.vue'
import { FileText } from 'lucide-vue-next'
</script>

<style scoped>
.terms-cols > * { margin-bottom: 1.25rem; }
.tlist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.tlist li { position: relative; padding-left: 18px; font-size: 14px; color: rgba(241,248,246,.7); line-height: 1.5; }
.tlist li::before { content: ""; position: absolute; left: 0; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: var(--k-gold); }
@media (min-width: 1024px) {
  .terms-cols { column-count: 2; column-gap: 1.25rem; }
  .terms-cols > * { break-inside: avoid; }
}
</style>
