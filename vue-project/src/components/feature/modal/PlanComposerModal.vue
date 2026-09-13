<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4"
      @click.self="$emit('close')"
    >
      <div
        class="w-full md:max-w-lg md:rounded-3xl rounded-t-3xl border-t md:border border-white/10 shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
        style="background: var(--k-card, #0f1622)"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 class="k-serif text-xl text-white">Share a Plan</h2>
            <p class="text-xs text-gold-300/80 mt-0.5 flex items-center gap-1">
              <Sparkles :size="12" /> Active for 48 hours · Connect with people nearby
            </p>
          </div>
          <button @click="$emit('close')" class="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <X :size="20" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          
          <!-- Category Selector -->
          <div>
            <label class="text-xs font-bold text-white/70 uppercase tracking-wider block mb-2.5">
              Choose an Activity
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                @click="selectCategory(cat)"
                class="flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-1.5"
                :class="selectedCategory === cat.id
                  ? 'border-gold-400 bg-gold-400/15 text-gold-300 shadow-md scale-[1.02]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'"
              >
                <span class="text-2xl">{{ cat.emoji }}</span>
                <span class="text-xs font-semibold">{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- Quick Inspiration Chips -->
          <div>
            <label class="text-xs font-bold text-white/60 block mb-2">
              Popular Ideas (tap to use)
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="(idea, i) in currentIdeas"
                :key="i"
                type="button"
                @click="form.activity = idea"
                class="text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:border-gold-400/50 hover:text-gold-300 text-white/80 transition-colors"
              >
                {{ idea }}
              </button>
            </div>
          </div>

          <!-- Activity Title Input -->
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="text-xs font-bold text-white/70 uppercase tracking-wider">
                What are you up to? <span class="text-gold-400">*</span>
              </label>
              <span class="text-[11px] text-white/40">{{ form.activity.length }}/120</span>
            </div>
            <input
              v-model="form.activity"
              type="text"
              maxlength="120"
              placeholder="e.g. Coffee at Mamma Mia this afternoon"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 text-sm transition-all"
              required
            />
          </div>

          <!-- Timeframe & Venue in 2 Columns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <!-- When -->
            <div>
              <label class="text-xs font-bold text-white/70 uppercase tracking-wider block mb-1.5">
                When? <span class="text-gold-400">*</span>
              </label>
              <input
                v-model="form.when"
                type="text"
                placeholder="e.g. Tonight ~ 6 PM, This Saturday"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none text-sm"
                required
              />
              <div class="flex gap-1.5 mt-1.5 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  v-for="opt in ['Today', 'Tonight', 'Tomorrow', 'This Weekend']"
                  :key="opt"
                  type="button"
                  @click="form.when = opt"
                  class="text-[10px] px-2 py-1 rounded-md bg-white/5 text-white/60 hover:text-white border border-white/10 shrink-0"
                >
                  {{ opt }}
                </button>
              </div>
            </div>

            <!-- Where -->
            <div>
              <label class="text-xs font-bold text-white/70 uppercase tracking-wider block mb-1.5">
                Where / Venue <span class="text-gold-400">*</span>
              </label>
              <input
                v-model="form.location"
                type="text"
                placeholder="e.g. City Centre, Lilongwe"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none text-sm"
                required
              />
            </div>
          </div>

          <!-- Optional Details / Note -->
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="text-xs font-bold text-white/70 uppercase tracking-wider">
                Extra details <span class="text-white/40 text-[10px] normal-case">(optional)</span>
              </label>
              <span class="text-[11px] text-white/40">{{ (form.description || '').length }}/300</span>
            </div>
            <textarea
              v-model="form.description"
              rows="2"
              maxlength="300"
              placeholder="e.g. First round on me! Let's chat about music and life."
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-gold-400 focus:outline-none text-sm transition-all resize-none"
            ></textarea>
          </div>

          <!-- Error Alert -->
          <p v-if="error" class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            {{ error }}
          </p>

          <!-- Safe Meetup Reminder -->
          <div class="flex items-center gap-2 text-white/40 text-[11px] bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
            <ShieldCheck :size="16" class="shrink-0 text-emerald-400" />
            <span>Always meet in public places and let a friend know your plans.</span>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="submitting || !form.activity.trim() || !form.location.trim() || !form.when.trim()"
              class="w-full py-3.5 rounded-xl font-bold text-night-950 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, var(--k-gold, #f4b740), var(--k-gold-l, #fcd34d))"
            >
              <span v-if="submitting" class="w-4 h-4 border-2 border-night-950 border-t-transparent rounded-full animate-spin"></span>
              <Send v-else :size="17" />
              <span>{{ submitting ? 'Publishing plan…' : 'Publish Plan to Nearby' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { X, Sparkles, ShieldCheck, Send } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()

const categories = [
  { id: 'coffee', emoji: '☕', label: 'Coffee & Chat', ideas: ['Coffee at Mamma Mia', 'Espresso date in Old Town', 'Afternoon cafe work & talk'] },
  { id: 'drinks', emoji: '🍸', label: 'Drinks & Cocktails', ideas: ['Sunset cocktails overlooking the lake', 'Craft beer & good laughs', 'Evening wine tasting'] },
  { id: 'food', emoji: '🍽️', label: 'Food & Dining', ideas: ['Chambo & chips lunch in Senga Bay', 'Dinner date in City Centre', 'Street food stroll this evening'] },
  { id: 'music', emoji: '🎵', label: 'Live Music & Night', ideas: ['Afrobeats & dance tonight', 'Acoustic jazz night at Woodlands', 'Live band & vibes this Friday'] },
  { id: 'outdoors', emoji: '🥾', label: 'Hike & Adventure', ideas: ['Hiking Mulanje trails this weekend', 'Morning run along capital park', 'Cycling trip on Saturday morning'] },
  { id: 'active', emoji: '⚽', label: 'Sports & Fun', ideas: ['Tennis match friendly', 'Gym & workout partner', 'Watching the football game together'] }
]

const selectedCategory = ref('coffee')
const submitting = ref(false)
const error = ref('')

const defaultLocation = computed(() => {
  const user = authStore.user
  if (user?.district) return `${user.district}`
  if (user?.location?.city) return `${user.location.city}`
  return 'Lilongwe'
})

const form = reactive({
  activity: '',
  category: 'coffee',
  when: 'Tonight',
  location: '',
  description: ''
})

const currentIdeas = computed(() => {
  const cat = categories.find(c => c.id === selectedCategory.value)
  return cat ? cat.ideas : []
})

const selectCategory = (cat) => {
  selectedCategory.value = cat.id
  form.category = cat.id
}

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    form.location = defaultLocation.value
    error.value = ''
  }
})

const handleSubmit = async () => {
  if (!form.activity.trim() || !form.location.trim() || !form.when.trim()) {
    error.value = 'Please fill out all required fields.'
    return
  }

  submitting.value = true
  error.value = ''
  try {
    emit('created', { ...form })
  } catch (e) {
    error.value = e.message || 'Failed to publish plan.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
