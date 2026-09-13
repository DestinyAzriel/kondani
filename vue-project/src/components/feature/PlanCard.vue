<template>
  <div
    class="plan-card k-card overflow-hidden transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between border"
    :class="categoryStyle.border"
  >
    <!-- Top Category Ambient Glow -->
    <div
      class="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20"
      :style="{ background: categoryStyle.glow }"
    ></div>

    <div class="p-5 relative z-10 flex-1 flex flex-col">
      <!-- Author Header -->
      <div class="flex items-center justify-between gap-3 mb-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="relative shrink-0">
            <img
              :src="authorPhoto"
              :alt="plan.author?.name"
              class="w-12 h-12 rounded-full object-cover border-2"
              :class="categoryStyle.avatarBorder"
            />
            <span
              v-if="plan.author?.isVerified"
              class="absolute -bottom-1 -right-1 bg-gradient-to-r from-gold-400 to-gold-500 text-night-950 rounded-full p-0.5 border border-night-950 shadow"
              title="Verified Malawian Member"
            >
              <BadgeCheck :size="12" class="stroke-[3]" />
            </span>
          </div>
          <div class="min-w-0">
            <h4 class="font-bold text-base text-white truncate flex items-center gap-1.5">
              {{ plan.author?.name }}
              <span v-if="plan.author?.age" class="text-xs font-normal text-white/50">{{ plan.author.age }}</span>
            </h4>
            <div class="flex items-center gap-1.5 text-xs text-white/50 truncate mt-0.5">
              <MapPin :size="12" class="shrink-0 text-gold-400/80" />
              <span class="truncate">{{ plan.location }}</span>
            </div>
          </div>
        </div>

        <!-- Category Tag -->
        <span
          class="text-xs font-semibold px-3 py-1 rounded-full border shrink-0 flex items-center gap-1.5"
          :class="categoryStyle.badge"
        >
          <span>{{ categoryStyle.emoji }}</span>
          <span class="hidden xs:inline sm:inline">{{ categoryStyle.label }}</span>
        </span>
      </div>

      <!-- Activity Headline -->
      <h3 class="k-serif text-lg font-bold text-white mb-2 leading-snug">
        {{ plan.activity }}
      </h3>

      <!-- Extra Note / Description -->
      <p v-if="plan.description" class="text-sm text-white/70 leading-relaxed mb-4 line-clamp-2">
        "{{ plan.description }}"
      </p>

      <!-- Time & Info Pills -->
      <div class="flex flex-wrap gap-2 mt-auto pt-2">
        <div class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80">
          <Clock :size="13" class="text-gold-400" />
          <span>{{ plan.when }}</span>
        </div>

        <div v-if="plan.interestedCount > 0" class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-lagoon-300">
          <Users :size="13" />
          <span>{{ plan.interestedCount }} interested</span>
        </div>
      </div>

      <!-- Host View: Applicants List & Gold Teaser -->
      <div v-if="plan.isOwner && plan.applicants && plan.applicants.length > 0" class="mt-4 pt-3 border-t border-white/5">
        <p class="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2">
          Interested People ({{ plan.interestedCount }})
        </p>

        <!-- Avatar preview row -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div
            v-for="(applicant, i) in plan.applicants"
            :key="applicant.id"
            class="relative shrink-0 cursor-pointer group"
            @click="applicant.isLocked ? $emit('upgrade') : $emit('openChatWithApplicant', applicant)"
            :title="applicant.isLocked ? 'Upgrade to Gold to view' : applicant.name"
          >
            <div class="relative w-10 h-10 rounded-full overflow-hidden border-2" :class="applicant.isLocked ? 'border-gold-400/50' : 'border-white/20 group-hover:border-gold-400'">
              <img
                :src="applicant.photo ? mediaSrc(applicant.photo) : 'https://via.placeholder.com/150'"
                class="w-full h-full object-cover"
                :class="{ 'blur-md': applicant.isLocked }"
              />
              <div v-if="applicant.isLocked" class="absolute inset-0 bg-night-950/60 flex items-center justify-center">
                <Lock :size="13" class="text-gold-400" />
              </div>
            </div>
            <span v-if="!applicant.isLocked" class="text-[10px] text-white/80 truncate block text-center max-w-[44px] mt-0.5">{{ applicant.name.split(' ')[0] }}</span>
          </div>
        </div>

        <!-- Gold Unlock Banner for Free Hosts -->
        <div
          v-if="plan.lockedCount > 0"
          @click="$emit('upgrade')"
          class="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-gold-500/15 via-gold-400/10 to-transparent border border-gold-400/35 flex items-center justify-between cursor-pointer hover:border-gold-400 transition-all shadow"
        >
          <div class="flex items-center gap-2">
            <Crown :size="14" class="text-gold-400 shrink-0" />
            <span class="text-xs font-semibold text-gold-300">
              {{ plan.lockedCount }} more {{ plan.lockedCount === 1 ? 'person wants' : 'people want' }} to join!
            </span>
          </div>
          <span class="text-[10px] font-bold text-night-950 bg-gradient-to-r from-gold-400 to-gold-500 px-2.5 py-1 rounded-lg shrink-0">
            Unlock
          </span>
        </div>
      </div>
    </div>

    <!-- Card Action Footer -->
    <div class="px-5 py-3.5 border-t border-white/5 bg-white/[0.02] flex items-center justify-between gap-3 relative z-10">
      <div v-if="plan.isOwner" class="flex items-center justify-between w-full">
        <span class="text-xs font-semibold text-gold-300 flex items-center gap-1.5">
          <Sparkles :size="13" /> Your Active Plan
        </span>
        <button
          @click="$emit('delete', plan)"
          class="text-xs text-rose-400/70 hover:text-rose-300 hover:underline transition-colors"
        >
          Remove
        </button>
      </div>

      <div v-else-if="plan.hasJoined" class="flex items-center justify-between w-full">
        <span class="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <Check :size="14" class="stroke-[3]" /> You're In!
        </span>
        <button
          @click="$emit('openChat', plan)"
          class="text-xs font-bold text-gold-300 hover:text-gold-200 flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
        >
          <MessageCircle :size="13" /> Message Host
        </button>
      </div>

      <div v-else class="flex items-center gap-2 w-full">
        <button
          @click="$emit('join', plan)"
          :disabled="isJoining"
          class="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-night-950 transition-all flex items-center justify-center gap-1.5 shadow hover:brightness-105 active:scale-95 disabled:opacity-50"
          style="background: linear-gradient(135deg, var(--k-gold, #f4b740), var(--k-gold-l, #fcd34d))"
        >
          <span v-if="isJoining" class="w-3.5 h-3.5 border-2 border-night-950 border-t-transparent rounded-full animate-spin"></span>
          <Heart v-else :size="14" class="fill-current" />
          <span>{{ isJoining ? 'Joining…' : "I'm Down · Join Plan" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BadgeCheck, MapPin, Clock, Users, Sparkles, Check, MessageCircle, Heart, Lock, Crown } from 'lucide-vue-next'
import { mediaUrl } from '@/utils/media'

const props = defineProps({
  plan: { type: Object, required: true },
  isJoining: { type: Boolean, default: false }
})

defineEmits(['join', 'delete', 'openChat', 'openChatWithApplicant', 'upgrade'])

const mediaSrc = (u) => mediaUrl(u)

const authorPhoto = computed(() => {
  if (props.plan.author?.photo) return mediaUrl(props.plan.author.photo)
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
})

const CATEGORY_STYLES = {
  coffee: {
    emoji: '☕',
    label: 'Coffee',
    glow: 'rgba(244, 183, 64, 0.4)',
    border: 'hover:border-amber-400/40 border-white/10',
    avatarBorder: 'border-amber-400/40',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
  },
  drinks: {
    emoji: '🍸',
    label: 'Drinks',
    glow: 'rgba(236, 72, 153, 0.35)',
    border: 'hover:border-pink-500/40 border-white/10',
    avatarBorder: 'border-pink-500/40',
    badge: 'bg-pink-500/10 text-pink-300 border-pink-500/20'
  },
  food: {
    emoji: '🍽️',
    label: 'Dining',
    glow: 'rgba(249, 115, 22, 0.35)',
    border: 'hover:border-orange-500/40 border-white/10',
    avatarBorder: 'border-orange-500/40',
    badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20'
  },
  music: {
    emoji: '🎵',
    label: 'Music',
    glow: 'rgba(168, 85, 247, 0.35)',
    border: 'hover:border-purple-500/40 border-white/10',
    avatarBorder: 'border-purple-500/40',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
  },
  outdoors: {
    emoji: '🥾',
    label: 'Adventure',
    glow: 'rgba(34, 197, 94, 0.35)',
    border: 'hover:border-emerald-500/40 border-white/10',
    avatarBorder: 'border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  active: {
    emoji: '⚽',
    label: 'Sports',
    glow: 'rgba(56, 189, 248, 0.35)',
    border: 'hover:border-sky-500/40 border-white/10',
    avatarBorder: 'border-sky-500/40',
    badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20'
  },
  other: {
    emoji: '✨',
    label: 'Meetup',
    glow: 'rgba(244, 183, 64, 0.35)',
    border: 'hover:border-gold-400/40 border-white/10',
    avatarBorder: 'border-gold-400/40',
    badge: 'bg-gold-500/10 text-gold-300 border-gold-500/20'
  }
}

const categoryStyle = computed(() => {
  const cat = (props.plan.category || 'other').toLowerCase()
  return CATEGORY_STYLES[cat] || CATEGORY_STYLES.other
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
