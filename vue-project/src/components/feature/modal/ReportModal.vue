<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="close" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-deep-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
              <!-- Mode Selection (if not specified) -->
              <div v-if="!mode">
                <DialogTitle as="h3" class="text-xl font-bold leading-6 text-white mb-2">
                  Safety Options
                </DialogTitle>
                <div class="mt-4 space-y-3">
                  <button @click="mode = 'report'" class="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center gap-3 transition-colors text-left group">
                    <FlagIcon class="text-yellow-500 group-hover:text-yellow-400" />
                    <div>
                      <h4 class="font-bold text-white">Report {{ userName }}</h4>
                      <p class="text-xs text-white/50">Notify us about inappropriate behavior</p>
                    </div>
                  </button>
                  <button @click="mode = 'block'" class="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center gap-3 transition-colors text-left group">
                    <BanIcon class="text-red-500 group-hover:text-red-400" />
                    <div>
                      <h4 class="font-bold text-white">Block {{ userName }}</h4>
                      <p class="text-xs text-white/50">They won't be able to see or contact you</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Report Flow -->
              <div v-else-if="mode === 'report'">
                <div class="flex items-center gap-2 mb-4">
                  <button @click="mode = null" class="text-white/50 hover:text-white">
                    <ArrowLeftIcon size="20" />
                  </button>
                  <DialogTitle as="h3" class="text-lg font-bold text-white">
                    Report {{ userName }}
                  </DialogTitle>
                </div>

                <div class="space-y-4">
                  <p class="text-sm text-white/70">Why are you reporting this user?</p>
                  
                  <div class="space-y-2">
                    <label v-for="reason in reportReasons" :key="reason.id" class="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition-colors" :class="selectedReason === reason.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5'">
                      <input type="radio" :value="reason.id" v-model="selectedReason" class="text-emerald-500 focus:ring-emerald-500 bg-transparent border-white/30" />
                      <span class="text-white text-sm font-medium">{{ reason.label }}</span>
                    </label>
                  </div>

                  <div v-if="selectedReason === 'other'">
                    <textarea 
                      v-model="description" 
                      placeholder="Please provide more details..." 
                      class="w-full bg-deep-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      rows="3"
                    ></textarea>
                  </div>

                  <div class="flex gap-3 mt-6">
                    <button @click="close" class="flex-1 py-3 text-white/70 hover:text-white font-medium text-sm">Cancel</button>
                    <button 
                      @click="submitReport" 
                      :disabled="!selectedReason || isSubmitting"
                      class="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all"
                    >
                      {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Block Flow -->
              <div v-else-if="mode === 'block'">
                <div class="flex items-center gap-2 mb-4">
                  <button @click="mode = null" class="text-white/50 hover:text-white">
                    <ArrowLeftIcon size="20" />
                  </button>
                  <DialogTitle as="h3" class="text-lg font-bold text-white">
                    Block {{ userName }}?
                  </DialogTitle>
                </div>

                <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                  <p class="text-white text-sm leading-relaxed">
                    Blocking this user will remove them from your matches and they won't be able to message you properly. This action cannot be easily undone.
                  </p>
                </div>

                <div class="flex gap-3">
                  <button @click="close" class="flex-1 py-3 text-white/70 hover:text-white font-medium text-sm">Cancel</button>
                  <button 
                    @click="submitBlock" 
                    :disabled="isSubmitting"
                    class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all"
                  >
                    {{ isSubmitting ? 'Blocking...' : 'Confirm Block' }}
                  </button>
                </div>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { Flag as FlagIcon, Ban as BanIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-vue-next'
import { moderationService } from '@/services/moderationService'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  show: Boolean,
  userId: String,
  userName: String,
  initialMode: {
    type: String,
    default: null // null | 'report' | 'block'
  }
})

const emit = defineEmits(['close', 'report-submitted', 'user-blocked'])
const { success, error } = useToast()

const mode = ref(null)
const selectedReason = ref('')
const description = ref('')
const isSubmitting = ref(false)

const reportReasons = [
  { id: 'fake_profile', label: 'Fake Profile / Catfish' },
  { id: 'harassment', label: 'Harassment or Bullying' },
  { id: 'inappropriate_content', label: 'Inappropriate Content' },
  { id: 'underage', label: 'Underage User' },
  { id: 'scam', label: 'Scam or Solicitation' },
  { id: 'other', label: 'Other' }
]

watch(() => props.show, (val) => {
  if (val) {
    mode.value = props.initialMode
    selectedReason.value = ''
    description.value = ''
  }
})

const close = () => {
  emit('close')
  setTimeout(() => {
    mode.value = null
  }, 300)
}

const submitReport = async () => {
  if (!props.userId || !selectedReason.value) return
  
  isSubmitting.value = true
  try {
    await moderationService.reportUser(props.userId, selectedReason.value, description.value)
    success('Report submitted. Thank you for keeping Kondani safe.')
    emit('report-submitted')
    close()
  } catch (err) {
    console.error(err)
    error('Failed to submit report. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const submitBlock = async () => {
  if (!props.userId) return

  isSubmitting.value = true
  try {
    await moderationService.blockUser(props.userId, 'Blocked by user')
    success(`${props.userName} has been blocked.`)
    emit('user-blocked')
    close()
  } catch (err) {
    console.error(err)
    error('Failed to block user. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
