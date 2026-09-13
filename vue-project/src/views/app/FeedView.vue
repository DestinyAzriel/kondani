<template>
  <div class="feed-container k-page relative overflow-hidden pb-32">
    <!-- Ambient Background Lighting -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(244,183,64,.13), transparent 70%)"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[45%] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(45,212,191,.10), transparent 70%)"></div>
    </div>

    <!-- Header -->
    <div class="sticky top-0 z-40 bg-night-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-4 relative">
      <div class="max-w-[1040px] mx-auto flex items-center justify-between gap-4">
        <div>
          <h1 class="k-title flex items-center gap-2">
            Plans Nearby
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold-400/10 text-gold-300 border border-gold-400/20">
              Live
            </span>
          </h1>
          <p class="text-white/50 text-xs sm:text-sm mt-0.5">
            Real dates, spontaneous meetups &amp; activities in Malawi
          </p>
        </div>

        <!-- Desktop + Mobile Header Post Button -->
        <button
          @click="openComposer"
          class="k-btn k-btn-gold shrink-0 py-2.5 px-4 text-xs sm:text-sm flex items-center gap-1.5 shadow-lg"
        >
          <Plus :size="16" />
          <span>Post a Plan</span>
        </button>
      </div>

      <!-- Category Filter Pills -->
      <div class="max-w-[1040px] mx-auto mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="cat in categoryFilters"
          :key="cat.id"
          @click="selectFilter(cat.id)"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 flex items-center gap-1.5"
          :class="activeCategory === cat.id
            ? 'bg-gold-500 text-night-950 border-gold-400 shadow-md font-bold'
            : 'bg-white/5 text-white/65 border-white/10 hover:bg-white/10 hover:text-white'"
        >
          <span>{{ cat.emoji }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="px-4 pt-6 relative z-10 max-w-[1040px] mx-auto">
      <!-- Loading Skeletons -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i" class="k-card p-5 animate-pulse space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-white/10"></div>
            <div class="space-y-2 flex-1">
              <div class="h-4 bg-white/10 rounded w-1/2"></div>
              <div class="h-3 bg-white/5 rounded w-1/3"></div>
            </div>
          </div>
          <div class="h-6 bg-white/10 rounded w-3/4"></div>
          <div class="h-4 bg-white/5 rounded w-full"></div>
          <div class="h-10 bg-white/10 rounded-xl"></div>
        </div>
      </div>

      <!-- Plans Grid -->
      <div
        v-else-if="plans.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <PlanCard
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          :isJoining="joiningId === plan.id"
          @join="handleJoinPlan"
          @delete="handleDeletePlan"
          @openChat="handleOpenChat"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        title="No active plans yet"
        :message="activeCategory !== 'all'
          ? `No one has posted in this category yet. Be the first to share what you'd love to do!`
          : `Spontaneous coffee, drinks or outdoor adventure? Post your plan and let people nearby join you.`"
        action-text="Share what you're up to"
        @action="openComposer"
      >
        <template #icon>
          <Sparkles :size="42" :stroke-width="1.5" style="color:var(--k-gold)" />
        </template>
      </EmptyState>
    </div>

    <!-- Floating Action Button for Mobile -->
    <button
      @click="openComposer"
      class="md:hidden fixed bottom-20 right-4 z-40 p-4 rounded-full font-bold text-night-950 shadow-2xl flex items-center justify-center gap-2 border-2 border-night-950 transition-transform active:scale-95"
      style="background: linear-gradient(135deg, var(--k-gold, #f4b740), var(--k-gold-l, #fcd34d))"
      aria-label="Post a plan"
    >
      <Plus :size="20" class="stroke-[3]" />
      <span class="text-xs font-bold pr-1">Post Plan</span>
    </button>

    <!-- Plan Composer Modal -->
    <PlanComposerModal
      :show="showComposer"
      @close="showComposer = false"
      @created="handlePlanCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Sparkles } from 'lucide-vue-next'
import { planService } from '@/services/planService'
import { useToast } from '@/composables/useToast'
import PlanCard from '@/components/feature/PlanCard.vue'
import PlanComposerModal from '@/components/feature/modal/PlanComposerModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const toast = useToast()

const plans = ref([])
const loading = ref(true)
const joiningId = ref(null)
const showComposer = ref(false)
const activeCategory = ref('all')

const categoryFilters = [
  { id: 'all', emoji: '✨', label: 'All Plans' },
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
  { id: 'drinks', emoji: '🍸', label: 'Drinks' },
  { id: 'food', emoji: '🍽️', label: 'Dining' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'outdoors', emoji: '🥾', label: 'Adventure' },
  { id: 'active', emoji: '⚽', label: 'Sports' }
]

const fetchPlans = async () => {
  loading.value = true
  try {
    const res = await planService.getPlans(activeCategory.value)
    plans.value = res?.plans || []
  } catch (err) {
    console.error('Failed to load plans:', err)
    toast.error('Could not load nearby plans. Please try again.')
    plans.value = []
  } finally {
    loading.value = false
  }
}

const selectFilter = (catId) => {
  if (activeCategory.value === catId) return
  activeCategory.value = catId
  fetchPlans()
}

const openComposer = () => {
  showComposer.value = true
}

const handlePlanCreated = async (formData) => {
  try {
    const res = await planService.createPlan(formData)
    if (res?.success && res?.plan) {
      plans.value.unshift(res.plan)
      showComposer.value = false
      toast.success('Your plan is live! Nearby members can now see it and join.')
    }
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Could not post plan.'
    toast.error(msg)
  }
}

const handleJoinPlan = async (plan) => {
  joiningId.value = plan.id
  try {
    const res = await planService.joinPlan(plan.id)
    if (res?.success) {
      plan.hasJoined = true
      plan.interestedCount = (plan.interestedCount || 0) + 1
      toast.success(`You joined ${plan.author?.name}'s plan! Chat conversation started.`)
      // If user wants to open the conversation directly:
      if (res.chatId) {
        setTimeout(() => {
          router.push(`/chats/${res.chatId}`)
        }, 800)
      }
    }
  } catch (err) {
    const msg = err.response?.data?.error || 'Failed to join plan.'
    toast.error(msg)
  } finally {
    joiningId.value = null
  }
}

const handleDeletePlan = async (plan) => {
  if (!confirm('Are you sure you want to remove this plan?')) return
  try {
    await planService.deletePlan(plan.id)
    plans.value = plans.value.filter(p => p.id !== plan.id)
    toast.info('Plan removed.')
  } catch (err) {
    toast.error('Could not remove plan.')
  }
}

const handleOpenChat = (plan) => {
  // If user already joined, navigate to chat
  const authorId = plan.author?.id
  if (authorId) {
    router.push(`/chats/${authorId}`)
  }
}

onMounted(() => {
  fetchPlans()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>