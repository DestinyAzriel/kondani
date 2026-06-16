<template>
  <div class="profile k-page pb-28 relative">
    <div class="k-stars"></div>
    <div class="absolute top-[-12%] right-[-8%] w-[45%] h-[38%] rounded-full blur-[130px] pointer-events-none"
         style="background:radial-gradient(circle,rgba(244,183,64,.1),transparent 70%)"></div>

    <div class="max-w-5xl mx-auto px-5 pt-6 relative z-10">
      <!-- top bar -->
      <div class="flex items-center justify-between mb-7">
        <h1 class="k-title" style="font-size:1.9rem">Profile</h1>
        <button class="k-iconbtn" title="Settings" @click="router.push('/settings')"><Settings :size="19" /></button>
      </div>

      <div class="lg:grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-10 lg:items-start">

        <!-- LEFT column -->
        <div class="lg:sticky lg:top-6">

          <!-- MOBILE identity (avatar ring) -->
          <div class="lg:hidden flex items-center gap-5">
            <div class="av-ring" :style="{ '--pct': completeness }">
              <img v-if="photoCount" :src="mainPhoto" class="av-img" alt="" />
              <div v-else class="av-img av-empty"><ImageIcon :size="28" :stroke-width="1.5" /></div>
              <span class="av-pct">{{ completeness }}%</span>
            </div>
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="k-serif" style="font-size:1.5rem;line-height:1.1">{{ profile.name || 'Your name' }}<span v-if="profile.age" class="text-white/55 font-normal">, {{ profile.age }}</span></h2>
                <span v-if="profile.isVerified" class="vseal"><Check :size="13" /></span>
              </div>
              <button v-if="!isEditing" class="edit-pill mt-3" @click="toggleEdit"><Pencil :size="14" /> Edit profile</button>
              <button v-else class="edit-pill edit-pill-on mt-3" :disabled="isSaving" @click="saveChanges">{{ isSaving ? 'Saving…' : 'Done' }}</button>
            </div>
          </div>

          <!-- DESKTOP hero (big photo) -->
          <div class="hidden lg:block">
            <div class="hero">
              <img v-if="photoCount" :src="mainPhoto" alt="" />
              <div v-else class="hero-empty"><ImageIcon :size="48" :stroke-width="1.5" /><span>Add your first photo</span></div>
              <div class="hero-grad"></div>
              <div class="hero-info">
                <div class="flex items-center gap-2.5">
                  <h2 class="k-serif" style="font-size:2.1rem;line-height:1">{{ profile.name || 'Your name' }}<span v-if="profile.age" class="text-white/70 font-normal">, {{ profile.age }}</span></h2>
                  <span v-if="profile.isVerified" class="vseal"><Check :size="14" /></span>
                </div>
                <div v-if="profile.district" class="flex items-center gap-1.5 text-sm text-white/80 mt-2"><MapPin :size="14" /> {{ profile.district }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between mt-4 mb-2">
              <span class="k-label">Profile strength</span>
              <span class="k-serif text-gold-300" style="font-size:1rem">{{ completeness }}%</span>
            </div>
            <div class="pbar"><i :style="{ width: completeness + '%' }"></i></div>

            <button v-if="!isEditing" class="edit-pill edit-pill-wide mt-4" @click="toggleEdit"><Pencil :size="15" /> Edit profile</button>
            <button v-else class="edit-pill edit-pill-on edit-pill-wide mt-4" :disabled="isSaving" @click="saveChanges">{{ isSaving ? 'Saving…' : 'Done editing' }}</button>
          </div>

          <!-- promos -->
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
        </div>

        <!-- RIGHT content -->
        <div class="mt-7 lg:mt-0 min-w-0 space-y-5">
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
import { Check, MapPin, Pencil, Plus, X, ShieldCheck, Crown, Settings, ChevronRight, LogOut, Image as ImageIcon } from 'lucide-vue-next'
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

/* mobile avatar ring */
.av-ring { position: relative; width: 100px; height: 100px; border-radius: 50%; padding: 4px; flex-shrink: 0;
  background: conic-gradient(var(--k-gold) calc(var(--pct) * 1%), rgba(255,255,255,.12) 0); }
.av-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid var(--k-night); display: block; }
.av-empty { display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.3); background: #0e1f29; }
.av-pct { position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); background: var(--k-gold); color: var(--k-night);
  font-size: 11px; font-weight: 800; padding: 2px 9px; border-radius: 99px; border: 2px solid var(--k-night); }

/* desktop hero photo */
.hero { position: relative; width: 100%; aspect-ratio: 4/5; border-radius: 24px; overflow: hidden; border: 1px solid var(--k-line);
  box-shadow: 0 24px 60px rgba(0,0,0,.55); background: linear-gradient(160deg,#0e1f29,#081016); }
.hero img { width: 100%; height: 100%; object-fit: cover; }
.hero-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: rgba(255,255,255,.3); font-size: 14px; }
.hero-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,13,18,.92), transparent 50%); pointer-events: none; }
.hero-info { position: absolute; left: 0; right: 0; bottom: 0; padding: 22px; }

/* verified seal */
.vseal { width: 24px; height: 24px; border-radius: 50%; background: var(--k-gold); color: var(--k-night); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* completeness bar */
.pbar { height: 6px; border-radius: 99px; background: rgba(255,255,255,.1); overflow: hidden; }
.pbar i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--k-gold), var(--k-gold-l)); transition: width .4s ease; }

/* edit pill */
.edit-pill { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 18px; border-radius: 99px; font-size: 13px; font-weight: 600;
  background: rgba(255,255,255,.07); border: 1px solid var(--k-line); color: #fff; cursor: pointer; transition: background .2s; }
.edit-pill:hover { background: rgba(255,255,255,.12); }
.edit-pill-wide { width: 100%; padding: 12px; }
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
