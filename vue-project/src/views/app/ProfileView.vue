<template>
  <div class="profile k-page pb-16 relative">
    <div class="k-stars"></div>
    <div class="absolute top-[-12%] right-[-8%] w-[45%] h-[38%] rounded-full blur-[130px] pointer-events-none"
         style="background:radial-gradient(circle,rgba(244,183,64,.1),transparent 70%)"></div>

    <div class="max-w-4xl mx-auto px-3 sm:px-5 pt-3 pb-12 relative z-10 w-full">
      <!-- top bar -->
      <div class="flex items-center justify-between mb-3.5">
        <h1 class="k-title text-2xl">Profile</h1>
        <button class="k-iconbtn" title="Settings" @click="router.push('/settings')"><Settings :size="18" /></button>
      </div>

      <div class="lg:grid lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)] gap-4 xl:gap-5 items-start">

        <!-- LEFT column -->
        <div class="lg:sticky lg:top-4">

          <!-- MOBILE identity (avatar ring) -->
          <div class="lg:hidden flex items-center gap-4">
            <div class="av-ring" :style="{ '--pct': completeness }">
              <img v-if="photoCount" :src="mainPhoto" class="av-img" alt="" />
              <div v-else class="av-img av-empty"><ImageIcon :size="24" :stroke-width="1.5" /></div>
              <span class="av-pct">{{ completeness }}%</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="k-serif text-xl leading-tight">{{ profile.name || 'Your name' }}<span v-if="profile.age" class="text-white/55 font-normal">, {{ profile.age }}</span></h2>
                <span v-if="isUserVerified" class="vseal"><Check :size="12" /></span>
              </div>
              <div v-if="profile.district" class="flex items-center gap-1.5 text-xs text-white/75 mt-1"><MapPin :size="12" /> {{ profile.district }}</div>
              <button v-if="!isEditing" class="edit-pill mt-2.5" @click="toggleEdit"><Pencil :size="13" /> Edit profile</button>
              <button v-else class="edit-pill edit-pill-on mt-2.5" :disabled="isSaving" @click="saveChanges">{{ isSaving ? 'Saving…' : 'Done' }}</button>
            </div>
          </div>

          <!-- DESKTOP hero (big photo) -->
          <div class="hidden lg:block">
            <div class="hero">
              <img v-if="photoCount" :src="mainPhoto" alt="" />
              <div v-else class="hero-empty"><ImageIcon :size="40" :stroke-width="1.5" /><span>Add your first photo</span></div>
              <div class="hero-grad"></div>
              <div class="hero-info">
                <div class="flex items-center gap-2">
                  <h2 class="k-serif text-xl leading-tight text-white">{{ profile.name || 'Your name' }}<span v-if="profile.age" class="text-white/70 font-normal">, {{ profile.age }}</span></h2>
                  <span v-if="isUserVerified" class="vseal"><Check :size="13" /></span>
                </div>
                <div v-if="profile.district" class="flex items-center gap-1.5 text-xs text-white/80 mt-1"><MapPin :size="13" /> {{ profile.district }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between mt-2.5 mb-1.5">
              <span class="k-label text-xs">Profile strength</span>
              <span class="k-serif text-gold-300 text-sm">{{ completeness }}%</span>
            </div>
            <div class="pbar"><i :style="{ width: completeness + '%' }"></i></div>

            <button v-if="!isEditing" class="edit-pill edit-pill-wide mt-2.5" @click="toggleEdit"><Pencil :size="14" /> Edit profile</button>
            <button v-else class="edit-pill edit-pill-on edit-pill-wide mt-2.5" :disabled="isSaving" @click="saveChanges">{{ isSaving ? 'Saving…' : 'Done editing' }}</button>
          </div>

          <!-- promos & Tinder-style monetization card -->
          <div class="mt-3 space-y-2.5">
            <!-- TINDER-STYLE PROMO / OUT OF LIKES BANNER -->
            <div @click="router.push('/premium')"
                 class="relative overflow-hidden rounded-2xl p-4 text-white shadow-xl cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all group"
                 :class="isOutOfLikes
                   ? 'bg-gradient-to-r from-[#8b1515] via-[#a81c1c] to-[#6b1010] border border-red-500/50 shadow-red-950/40'
                   : (profile.isPremium
                     ? 'bg-gradient-to-r from-amber-900/60 via-yellow-900/50 to-amber-900/60 border border-gold-400/50 shadow-gold-500/20'
                     : 'bg-gradient-to-r from-amber-900/70 via-yellow-800/50 to-amber-900/70 border border-amber-500/50 shadow-amber-950/30')">

              <!-- Glowing background accent -->
              <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl pointer-events-none"
                   :class="isOutOfLikes ? 'bg-red-400/30' : (profile.isPremium ? 'bg-gold-400/20' : 'bg-amber-400/20')"></div>

              <div class="flex items-center justify-between gap-3 relative z-10">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-black tracking-wider text-[10.5px] px-2.5 py-0.5 rounded-full uppercase shadow-sm"
                          :class="isOutOfLikes
                            ? 'bg-white text-[#991b1b]'
                            : 'bg-gradient-to-r from-amber-300 to-yellow-400 text-night-950'">
                      {{ profile.isPremium
                          ? (profile.subscriptionTier ? 'KONDANI ' + profile.subscriptionTier.toUpperCase() : 'KONDANI VIP')
                          : (isOutOfLikes ? 'KONDANI PLUS' : 'KONDANI PLUS') }}
                    </span>
                    <span class="font-bold text-xs tracking-tight"
                          :class="isOutOfLikes ? 'text-white/95' : 'text-amber-200'">
                      {{ isOutOfLikes ? 'Unlimited Likes' : (profile.isPremium ? 'VIP Benefits Active' : 'Unlimited Likes') }}
                    </span>
                  </div>
                  <p class="text-[11.5px] font-medium leading-snug"
                     :class="isOutOfLikes ? 'text-white/90' : 'text-amber-100/90'">
                    {{ isOutOfLikes
                         ? 'You are out of Likes. Unlock more now.'
                         : (profile.isPremium
                             ? 'Unlimited likes, priority matching & boosts active.'
                             : likesRemaining + ' free likes left today. Unlock unlimited now.') }}
                  </p>
                </div>
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-all shadow-sm"
                     :class="isOutOfLikes ? 'bg-white/20 group-hover:bg-white/30' : 'bg-amber-400/30 group-hover:bg-amber-400/50'">
                  <ArrowRight :size="15" :class="isOutOfLikes ? 'text-white' : 'text-amber-200'" />
                </div>
              </div>
            </div>

            <!-- Tinder-style Quick Action Shortcuts (Super Likes, Boosts, Subscriptions) -->
            <div class="grid grid-cols-3 gap-1.5 pt-0.5">
              <button @click="router.push('/premium')" class="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] active:scale-95 transition-all group" title="Get Super Likes">
                <div class="flex items-center gap-1 text-[11.5px] font-bold text-sky-400 mb-0.5">
                  <Star :size="13" class="fill-sky-400 text-sky-400" />
                  <span>{{ superLikesCount }}</span>
                </div>
                <span class="text-[10px] text-white/45 group-hover:text-white/70 transition-colors">Super Likes</span>
              </button>

              <button @click="router.push('/premium')" class="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] active:scale-95 transition-all group" title="Get Boosts">
                <div class="flex items-center gap-1 text-[11.5px] font-bold text-purple-400 mb-0.5">
                  <Zap :size="13" class="fill-purple-400 text-purple-400" />
                  <span>{{ boostsCount }}</span>
                </div>
                <span class="text-[10px] text-white/45 group-hover:text-white/70 transition-colors">Boosts</span>
              </button>

              <button @click="router.push('/premium')" class="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] active:scale-95 transition-all group" title="Manage Subscription">
                <div class="flex items-center gap-1 text-[11.5px] font-bold text-amber-400 mb-0.5">
                  <Crown :size="13" class="fill-amber-400 text-amber-400" />
                  <span class="truncate max-w-[55px] uppercase">{{ profile.subscriptionTier || (profile.isPremium ? 'GOLD' : 'FREE') }}</span>
                </div>
                <span class="text-[10px] text-white/45 group-hover:text-white/70 transition-colors">Subscriptions</span>
              </button>
            </div>

            <!-- Verification Promo -->
            <button v-if="!isUserVerified" class="promo mt-1" @click="router.push('/verify-photo')">
              <span class="promo-ic"><ShieldCheck :size="16" /></span>
              <span class="promo-txt"><b>Get verified</b><i>Quick selfie for the gold badge.</i></span>
              <ChevronRight :size="16" class="text-white/35" />
            </button>
          </div>
        </div>

        <!-- RIGHT content -->
        <div class="mt-5 lg:mt-0 min-w-0 space-y-3.5">
          <!-- Mobile Out of Likes Banner -->
          <div v-if="isOutOfLikes"
               @click="router.push('/premium')"
               class="lg:hidden relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#7f1d1d] p-3.5 text-white shadow-xl border border-red-500/40 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="bg-white text-[#991b1b] font-black text-[10px] px-2 py-0.5 rounded-full uppercase">KONDANI PLUS</span>
                <span class="font-bold text-xs text-white/95">Unlimited Likes</span>
              </div>
              <p class="text-[11px] text-white/90">You are out of Likes. Unlock more now.</p>
            </div>
            <div class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ArrowRight :size="14" class="text-white" />
            </div>
          </div>

          <!-- Free Daily Likes Remaining Bar (when likes still remaining) -->
          <div v-else-if="!profile.isPremium"
               @click="router.push('/premium')"
               class="rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-white/[0.06] transition-all">
            <div class="flex items-center gap-2 text-xs">
              <Flame :size="14" class="text-amber-400" />
              <span class="text-white/80"><strong class="text-amber-300">{{ likesRemaining }}</strong> free likes left today</span>
            </div>
            <span class="text-[11px] text-amber-400/90 font-medium hover:underline flex items-center gap-0.5">
              Get Unlimited <ChevronRight :size="12" />
            </span>
          </div>
          <!-- photos -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="k-label text-xs">Photos</p>
              <span class="text-[11px] text-white/45">{{ photoCount }}/6</span>
            </div>
            <PhotoUpload v-if="isEditing" v-model="editForm.photos" :max-photos="6" />
            <div v-else class="pgrid">
              <div v-for="(p, i) in photoList" :key="i" class="g"><img :src="mediaSrc(p)" alt="" /><span v-if="i===0" class="main">Main</span></div>
              <button v-for="n in emptySlots" :key="'e'+n" class="add" @click="toggleEdit"><span class="add-plus"><Plus :size="15" /></span></button>
            </div>
          </div>

          <!-- about -->
          <div class="k-card p-3.5 sm:p-4">
            <p class="k-label text-xs mb-2">About me</p>
            <textarea v-if="isEditing" v-model="editForm.bio" rows="3" maxlength="500" class="ta text-sm" placeholder="Tell people a bit about you…"></textarea>
            <p v-else class="text-sm leading-relaxed" :class="profile.bio ? 'text-white/85' : 'text-white/45'">{{ profile.bio || 'Add a bio to show your personality.' }}</p>
          </div>

          <!-- interests -->
          <div class="k-card p-3.5 sm:p-4">
            <p class="k-label text-xs mb-2.5">Interests</p>
            <div v-if="isEditing">
              <div class="flex gap-2 mb-2.5">
                <input v-model="newInterest" @keyup.enter="addInterest" class="inp flex-1 text-sm py-1.5 px-3" placeholder="Add an interest…" />
                <button class="k-btn k-btn-gold text-xs" style="padding:0 14px" @click="addInterest">Add</button>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(it,i) in editForm.interests" :key="i" class="k-chip text-xs py-1 px-2.5">{{ it }} <X :size="12" class="cursor-pointer" style="color:var(--k-coral)" @click="editForm.interests.splice(i,1)" /></span>
              </div>
            </div>
            <div v-else class="flex flex-wrap gap-1.5">
              <span v-for="(it,i) in profile.interests" :key="i" class="k-chip text-xs py-1 px-2.5">{{ it }}</span>
              <span v-if="!profile.interests?.length" class="text-white/45 text-xs">No interests yet.</span>
            </div>
          </div>

          <!-- prompts -->
          <div v-if="profile.prompts?.length" class="space-y-2.5">
            <p class="k-label text-xs">Prompts</p>
            <div v-for="(pr,i) in profile.prompts" :key="i" class="k-card p-3">
              <div class="text-[11px] text-gold-300 font-medium mb-1">{{ pr.question }}</div>
              <div class="k-serif text-sm">"{{ pr.answer }}"</div>
            </div>
          </div>

          <!-- Relationship Intent (Utilizing space) -->
          <div class="k-card p-3.5 sm:p-4">
            <p class="k-label text-xs mb-2">Looking for</p>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gold-400/10 text-gold-300 border border-gold-400/25">
                <Heart :size="13" class="fill-current text-gold-400" /> Long-term relationship & connection
              </span>
            </div>
          </div>

          <!-- Quick Shortcuts & Actions -->
          <div class="k-card p-3.5 sm:p-4 space-y-2">
            <p class="k-label text-xs mb-1.5">Quick Shortcuts</p>
            <div class="grid grid-cols-2 gap-2">
              <button @click="router.push('/settings')" class="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 text-xs text-white/80 transition-all text-left cursor-pointer">
                <Settings :size="15" class="text-gold-400 shrink-0" />
                <span>Discovery & Settings</span>
              </button>
              <button @click="router.push('/safety-center')" class="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 text-xs text-white/80 transition-all text-left cursor-pointer">
                <ShieldCheck :size="15" class="text-teal-400 shrink-0" />
                <span>Safety Center</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import PhotoUpload from '@/components/feature/PhotoUpload.vue'
import { Check, MapPin, Pencil, Plus, X, ShieldCheck, Crown, Settings, ChevronRight, ArrowRight, Star, Zap, Flame, LogOut, Image as ImageIcon, Heart } from 'lucide-vue-next'
import { mediaUrl } from '@/utils/media'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const { profile, saveProfile, loadProfile } = useProfile()

onMounted(() => {
  loadProfile().catch(() => {})
})

const isOutOfLikes = computed(() => {
  if (profile.value.isPremium) return false
  if (profile.value.isOutOfLikes !== undefined) return Boolean(profile.value.isOutOfLikes)
  const today = new Date().toISOString().slice(0, 10)
  const count = profile.value.likesTodayDate === today ? (profile.value.likesToday || 0) : 0
  return count >= (profile.value.freeLikesDaily || 20)
})

const likesRemaining = computed(() => {
  if (profile.value.isPremium) return 'Unlimited'
  if (profile.value.likesRemaining !== undefined && profile.value.likesRemaining !== null) {
    return profile.value.likesRemaining
  }
  const today = new Date().toISOString().slice(0, 10)
  const count = profile.value.likesTodayDate === today ? (profile.value.likesToday || 0) : 0
  return Math.max(0, (profile.value.freeLikesDaily || 20) - count)
})

const superLikesCount = computed(() => {
  const tier = profile.value.subscriptionTier || (profile.value.isPremium ? 'gold' : 'free')
  const caps = { free: 1, plus: 2, gold: 5, platinum: 10 }
  return caps[tier] || 1
})

const boostsCount = computed(() => {
  const tier = profile.value.subscriptionTier || (profile.value.isPremium ? 'gold' : 'free')
  const caps = { free: 0, plus: 0, gold: 1, platinum: 3 }
  return caps[tier] || 0
})

const mediaSrc = (u) => mediaUrl(u)
const photoList = computed(() => profile.value.photos || [])
const mainPhoto = computed(() => (photoList.value[0] ? mediaSrc(photoList.value[0]) : ''))
const photoCount = computed(() => photoList.value.length)
const emptySlots = computed(() => Math.max(0, Math.min(6, 6 - photoCount.value)))

const isEditing = ref(false)
const isSaving = ref(false)
const newInterest = ref('')
const editForm = reactive({ bio: '', interests: [], photos: [] })

const isUserVerified = computed(() => {
  return Boolean(profile.value.isVerified && profile.value.verification?.id?.status === 'approved')
})

const checklist = computed(() => [
  photoCount.value >= 1,
  !!profile.value.bio,
  (profile.value.interests?.length || 0) >= 3,
  isUserVerified.value
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
.av-ring { position: relative; width: 84px; height: 84px; border-radius: 50%; padding: 3.5px; flex-shrink: 0;
  background: conic-gradient(var(--k-gold) calc(var(--pct) * 1%), rgba(255,255,255,.12) 0); }
.av-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid var(--k-night); display: block; }
.av-empty { display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.3); background: #0e1f29; }
.av-pct { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); background: var(--k-gold); color: var(--k-night);
  font-size: 10.5px; font-weight: 800; padding: 1.5px 8px; border-radius: 99px; border: 2px solid var(--k-night); }

/* desktop hero photo - compact for 100% zoom screens */
.hero { position: relative; width: 100%; max-width: 290px; aspect-ratio: 4/4.6; max-height: 320px; border-radius: 20px; overflow: hidden; border: 1px solid var(--k-line);
  box-shadow: 0 16px 40px rgba(0,0,0,.55); background: linear-gradient(160deg,#0e1f29,#081016); }
.hero img { width: 100%; height: 100%; object-fit: cover; }
.hero-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: rgba(255,255,255,.3); font-size: 13px; }
.hero-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,13,18,.92), transparent 50%); pointer-events: none; }
.hero-info { position: absolute; left: 0; right: 0; bottom: 0; padding: 14px 16px; }

/* verified seal */
.vseal { width: 20px; height: 20px; border-radius: 50%; background: var(--k-gold); color: var(--k-night); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* completeness bar */
.pbar { height: 5px; border-radius: 99px; background: rgba(255,255,255,.1); overflow: hidden; }
.pbar i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--k-gold), var(--k-gold-l)); transition: width .4s ease; }

/* edit pill */
.edit-pill { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 16px; border-radius: 99px; font-size: 12.5px; font-weight: 600;
  background: rgba(255,255,255,.07); border: 1px solid var(--k-line); color: #fff; cursor: pointer; transition: background .2s; }
.edit-pill:hover { background: rgba(255,255,255,.12); }
.edit-pill-wide { width: 100%; padding: 9px; }
.edit-pill-on { background: linear-gradient(95deg, var(--k-gold), var(--k-gold-l)); color: var(--k-night); border: none; }
.edit-pill:disabled { opacity: .6; }

/* promo cards */
.promo { width: 100%; display: flex; align-items: center; gap: 10px; text-align: left; padding: 10px 12px; border-radius: 14px;
  background: var(--k-card); border: 1px solid var(--k-line); cursor: pointer; transition: border-color .2s, transform .15s; }
.promo:hover { transform: translateY(-1px); border-color: rgba(255,255,255,.16); }
.promo-gold { border-color: rgba(244,183,64,.3); }
.promo-ic { width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(244,183,64,.13); color: var(--k-gold); }
.promo-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.promo-txt b { font-size: 12.5px; font-weight: 600; color: #fff; }
.promo-txt i { font-style: normal; font-size: 11px; color: var(--k-mut); line-height: 1.3; }

/* photo grid - crisp and compact on 100% desktop scale */
.pgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; width: 100%; }
.pgrid .g { aspect-ratio: 4/4.3; max-height: 110px; border-radius: 12px; overflow: hidden; position: relative; }
.pgrid .g img { width: 100%; height: 100%; object-fit: cover; }
.pgrid .g .main { position: absolute; top: 6px; left: 6px; font-size: 9px; font-weight: 700; background: var(--k-gold); color: var(--k-night); padding: 1.5px 7px; border-radius: 5px; }
.pgrid .add { aspect-ratio: 4/4.3; max-height: 110px; border-radius: 12px; border: 1.5px dashed var(--k-line); background: rgba(255,255,255,.02); position: relative; cursor: pointer; transition: border-color .2s; }
.pgrid .add:hover { border-color: var(--k-gold); }
.pgrid .add-plus { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,.1); color: #fff; display: flex; align-items: center; justify-content: center; }
.pgrid .add:hover .add-plus { background: var(--k-gold); color: var(--k-night); }

.ta { width: 100%; background: rgba(255,255,255,.05); border: 1px solid var(--k-line); border-radius: 12px; padding: 10px 12px; color: #fff; outline: none; resize: none; font-family: inherit; }
.ta:focus { border-color: var(--k-gold); }
.inp { background: rgba(255,255,255,.05); border: 1px solid var(--k-line); border-radius: 10px; padding: 8px 12px; color: #fff; outline: none; }
.inp:focus { border-color: var(--k-gold); }
</style>
