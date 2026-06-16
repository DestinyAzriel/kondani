<template>
  <div class="profile k-page pb-28 relative">
    <div class="k-stars"></div>
    <div class="absolute top-[-12%] right-[-8%] w-[45%] h-[38%] rounded-full blur-[130px] pointer-events-none"
         style="background:radial-gradient(circle,rgba(244,183,64,.1),transparent 70%)"></div>

    <div class="max-w-5xl mx-auto px-5 pt-6 relative z-10">
      <!-- top bar -->
      <div class="flex items-center justify-between mb-7">
        <h1 class="k-title" style="font-size:1.9rem">Profile</h1>
        <button class="k-iconbtn" @click="router.push('/settings')"><Settings :size="19" /></button>
      </div>

      <div class="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">

        <!-- LEFT: identity + promos -->
        <div class="lg:w-[330px] lg:flex-shrink-0 lg:sticky lg:top-6">
          <div class="flex items-center gap-5 lg:flex-col lg:items-start">
            <!-- avatar w/ completeness ring -->
            <div class="av-ring" :style="{ '--pct': completeness }">
              <img v-if="photoCount" :src="mainPhoto" class="av-img" alt="" />
              <div v-else class="av-img av-empty"><ImageIcon :size="30" :stroke-width="1.5" /></div>
              <span class="av-pct">{{ completeness }}%</span>
            </div>

            <div class="lg:mt-5">
              <div class="flex items-center gap-2.5">
                <h2 class="k-serif" style="font-size:1.6rem;line-height:1.1">{{ profile.name || 'Your name' }}<span v-if="profile.age" class="text-white/55 font-normal">, {{ profile.age }}</span></h2>
                <span v-if="profile.isVerified" class="vseal"><Check :size="13" /></span>
                <button v-else class="vseal vseal-todo" title="Get verified" @click="router.push('/verify-photo')"><BadgeCheck :size="15" /></button>
              </div>
              <button v-if="!isEditing" class="edit-pill mt-3" @click="toggleEdit"><Pencil :size="14" /> Edit profile</button>
              <button v-else class="edit-pill edit-pill-on mt-3" :disabled="isSaving" @click="saveChanges">{{ isSaving ? 'Saving…' : 'Done editing' }}</button>
            </div>
          </div>

          <!-- promos (Tinder-style horizontal cards) -->
          <div class="mt-6 space-y-3">
            <button v-if="!profile.isVerified" class="promo" @click="router.push('/verify-photo')">
              <span class="promo-ic"><ShieldCheck :size="19" /></span>
              <span class="promo-txt"><b>Get verified</b><i>A quick selfie — earn the gold badge &amp; 4× more matches.</i></span>
              <ChevronRight :size="20" class="text-white/35" />
            </button>
            <button v-if="!profile.isPremium" class="promo promo-gold" @click="router.push('/premium')">
              <span class="promo-ic"><Crown :size="19" /></span>
              <span class="promo-txt"><b style="color:var(--k-gold-l)">Try Kondani Gold</b><i>See who likes you and match faster — MWK 600/mo.</i></span>
              <ChevronRight :size="20" class="text-white/35" />
            </button>
          </div>

          <div class="flex items-center gap-2 mt-4">
            <button class="k-btn k-btn-ghost flex-1" style="padding:11px;font-size:13px" @click="router.push('/settings')"><Settings :size="15" /> Settings</button>
            <button class="k-btn k-btn-ghost" style="padding:11px 14px;font-size:13px;color:var(--k-coral)" @click="handleLogout"><LogOut :size="15" /></button>
          </div>
        </div>

        <!-- RIGHT: content -->
        <div class="flex-1 min-w-0 mt-2 lg:mt-0 space-y-5">
          <!-- photos -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <p class="k-label">Photos</p>
              <span class="text-xs text-white/45">{{ photoCount }}/6</span>
            </div>
            <PhotoUpload v-if="isEditing" v-model="editForm.photos" :max-photos="6" />
            <div v-else class="pgrid">
              <div v-for="(p, i) in photoList" :key="i" class="g"><img :src="mediaSrc(p)" alt="" /><span v-if="i===0" class="main">Main</span></div>
              <button v-for="n in emptySlots" :key="'e'+n" class="add" @click="toggleEdit"><span class="add-plus"><Plus :size="18" /></span></button>
            </div>
          </div>

          <!-- about -->
          <div class="k-card" style="padding:20px">
            <p class="k-label mb-3">About me</p>
            <textarea v-if="isEditing" v-model="editForm.bio" rows="4" maxlength="500" class="ta" placeholder="Tell people a bit about you…"></textarea>
            <p v-else class="text-[15px] leading-relaxed" :class="profile.bio ? 'text-white/85' : 'text-white/45'">{{ profile.bio || 'Add a bio to show your personality.' }}</p>
          </div>

          <!-- interests -->
          <div class="k-card" style="padding:20px">
            <p class="k-label mb-3.5">Interests</p>
            <div v-if="isEditing">
              <div class="flex gap-2 mb-3">
                <input v-model="newInterest" @keyup.enter="addInterest" class="inp flex-1" placeholder="Add an interest…" />
                <button class="k-btn k-btn-gold" style="padding:0 16px" @click="addInterest">Add</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="(it,i) in editForm.interests" :key="i" class="k-chip">{{ it }} <X :size="13" class="cursor-pointer" style="color:var(--k-coral)" @click="editForm.interests.splice(i,1)" /></span>
              </div>
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <span v-for="(it,i) in profile.interests" :key="i" class="k-chip">{{ it }}</span>
              <span v-if="!profile.interests?.length" class="text-white/45 text-sm">No interests yet.</span>
            </div>
          </div>

          <!-- prompts -->
          <div v-if="profile.prompts?.length" class="space-y-3">
            <p class="k-label">Prompts</p>
            <div v-for="(pr,i) in profile.prompts" :key="i" class="k-card" style="padding:18px">
              <div class="text-xs text-gold-300 font-medium mb-1.5">{{ pr.question }}</div>
              <div class="k-serif" style="font-size:17px">"{{ pr.answer }}"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import PhotoUpload from '@/components/feature/PhotoUpload.vue'
import { BadgeCheck, Check, Pencil, Plus, X, ShieldCheck, Crown, Settings, ChevronRight, Camera, LogOut, Image as ImageIcon } from 'lucide-vue-next'
import { mediaUrl } from '@/utils/media'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const { profile, saveProfile } = useProfile()

const mediaSrc = (u) => mediaUrl(u)
const photoList = computed(() => profile.value.photos || [])
const mainPhoto = computed(() => (photoList.value[0] ? mediaSrc(photoList.value[0]) : ''))
const photoCount = computed(() => photoList.value.length)
const emptySlots = computed(() => Math.max(0, Math.min(6, 6 - photoCount.value)))

const isEditing = ref(false)
const isSaving = ref(false)
const newInterest = ref('')
const editForm = reactive({ bio: '', interests: [], photos: [] })

const checklist = computed(() => [
  photoCount.value >= 1,
  !!profile.value.bio,
  (profile.value.interests?.length || 0) >= 3,
  !!profile.value.isVerified
])
const completeness = computed(() => checklist.value.filter(Boolean).length * 25)

function toggleEdit() {
  if (!isEditing.value) {
    editForm.bio = profile.value.bio || ''
    editForm.interests = [...(profile.value.interests || [])]
    editForm.photos = [...(profile.value.photos || [])]
  }
  isEditing.value = !isEditing.value
}
const addInterest = () => {
  const v = newInterest.value?.trim()
  if (v && !editForm.interests.includes(v)) { editForm.interests.push(v); newInterest.value = '' }
}
const saveChanges = async () => {
  if (isSaving.value) return
  isSaving.value = true
  try {
    await saveProfile({ bio: editForm.bio, interests: editForm.interests, photos: editForm.photos })
    isEditing.value = false
    success('Profile updated')
  } catch (e) { toastError('Could not save changes') }
  finally { isSaving.value = false }
}
const handleLogout = async () => {
  if (confirm('Sign out of Kondani?')) { await authStore.logout(); router.push('/login') }
}
</script>

<style scoped>
.profile { overflow-x: hidden; }

/* avatar + completeness ring */
.av-ring { position: relative; width: 104px; height: 104px; border-radius: 50%; padding: 4px; flex-shrink: 0;
  background: conic-gradient(var(--k-gold) calc(var(--pct) * 1%), rgba(255,255,255,.12) 0); }
.av-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid var(--k-night); display: block; }
.av-empty { display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.3); background: #0e1f29; }
.av-pct { position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); background: var(--k-gold); color: var(--k-night);
  font-size: 11px; font-weight: 800; padding: 2px 9px; border-radius: 99px; border: 2px solid var(--k-night); }

/* verified seal */
.vseal { width: 24px; height: 24px; border-radius: 50%; background: var(--k-gold); color: var(--k-night); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.vseal-todo { background: transparent; color: var(--k-gold); border: 1.5px dashed rgba(244,183,64,.6); cursor: pointer; width: 26px; height: 26px; }

/* edit pill */
.edit-pill { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 99px; font-size: 13px; font-weight: 600;
  background: rgba(255,255,255,.07); border: 1px solid var(--k-line); color: #fff; cursor: pointer; transition: background .2s; }
.edit-pill:hover { background: rgba(255,255,255,.12); }
.edit-pill-on { background: linear-gradient(95deg, var(--k-gold), var(--k-gold-l)); color: var(--k-night); border: none; }
.edit-pill:disabled { opacity: .6; }

/* promo cards */
.promo { width: 100%; display: flex; align-items: center; gap: 13px; text-align: left; padding: 14px; border-radius: 16px;
  background: var(--k-card); border: 1px solid var(--k-line); cursor: pointer; transition: border-color .2s, transform .15s; }
.promo:hover { transform: translateY(-1px); border-color: rgba(255,255,255,.16); }
.promo-gold { border-color: rgba(244,183,64,.3); }
.promo-ic { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(244,183,64,.13); color: var(--k-gold); }
.promo-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.promo-txt b { font-size: 14px; font-weight: 600; color: #fff; }
.promo-txt i { font-style: normal; font-size: 12px; color: var(--k-mut); line-height: 1.4; }

/* photo grid */
.pgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.pgrid .g { aspect-ratio: 3/4; border-radius: 16px; overflow: hidden; position: relative; }
.pgrid .g img { width: 100%; height: 100%; object-fit: cover; }
.pgrid .g .main { position: absolute; top: 7px; left: 7px; font-size: 9.5px; font-weight: 700; background: var(--k-gold); color: var(--k-night); padding: 2px 8px; border-radius: 6px; }
.pgrid .add { aspect-ratio: 3/4; border-radius: 16px; border: 1.5px dashed var(--k-line); background: rgba(255,255,255,.02); position: relative; cursor: pointer; transition: border-color .2s; }
.pgrid .add:hover { border-color: var(--k-gold); }
.pgrid .add-plus { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,.1); color: #fff; display: flex; align-items: center; justify-content: center; }
.pgrid .add:hover .add-plus { background: var(--k-gold); color: var(--k-night); }

.ta { width: 100%; background: rgba(255,255,255,.05); border: 1px solid var(--k-line); border-radius: 12px; padding: 12px; color: #fff; outline: none; resize: none; font-family: inherit; }
.ta:focus { border-color: var(--k-gold); }
.inp { background: rgba(255,255,255,.05); border: 1px solid var(--k-line); border-radius: 10px; padding: 10px 14px; color: #fff; outline: none; }
.inp:focus { border-color: var(--k-gold); }
</style>
