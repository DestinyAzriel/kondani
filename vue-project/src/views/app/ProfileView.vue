<template>
  <div class="profile k-page pb-28 relative">
    <div class="k-stars"></div>
    <div class="absolute top-[-12%] right-[-8%] w-[45%] h-[40%] rounded-full blur-[130px] pointer-events-none"
         style="background:radial-gradient(circle,rgba(244,183,64,.12),transparent 70%)"></div>

    <div class="max-w-5xl mx-auto px-5 pt-8 relative z-10">
      <div class="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-8 items-start">

        <!-- LEFT: live preview card + actions (sticky) -->
        <div class="lg:sticky lg:top-8 space-y-4">
          <!-- Preview card — how you appear to others -->
          <div class="pcard">
            <img v-if="photoCount" :src="mainPhoto" alt="" />
            <div v-else class="pcard-empty"><ImageIcon :size="40" :stroke-width="1.5" /><span>Add a photo</span></div>
            <div class="pcard-grad"></div>
            <div v-if="profile.isVerified" class="pcard-seal"><BadgeCheck :size="16" /></div>
            <div class="pcard-info">
              <div class="flex items-end gap-2">
                <h1 class="k-serif" style="font-size:1.9rem;line-height:1">{{ profile.name || 'Your name' }}</h1>
                <span v-if="profile.age" class="text-xl text-white/85 leading-none mb-0.5">{{ profile.age }}</span>
              </div>
              <div v-if="profile.district" class="flex items-center gap-1.5 text-sm text-white/80 mt-2"><MapPin :size="14" /> {{ profile.district }}</div>
            </div>
          </div>

          <!-- Profile strength -->
          <div class="k-card" style="padding:16px">
            <div class="flex items-center justify-between mb-2.5">
              <span class="k-label">Profile strength</span>
              <span class="k-serif text-gold-300" style="font-size:1.05rem">{{ completeness }}%</span>
            </div>
            <div class="pbar"><i :style="{ width: completeness + '%' }"></i></div>
            <div v-if="incomplete.length" class="mt-3 space-y-1.5">
              <button v-for="c in incomplete" :key="c.t" class="finish-row" @click="c.action">
                <span class="flex items-center gap-2"><component :is="c.icon" :size="14" /> {{ c.t }}</span>
                <ArrowRight :size="14" class="text-gold-300" />
              </button>
            </div>
          </div>

          <button v-if="!isEditing" class="k-btn k-btn-ghost w-full" style="padding:12px" @click="toggleEdit"><Pencil :size="15" /> Edit profile</button>
          <button v-else class="k-btn k-btn-gold w-full" style="padding:12px" :disabled="isSaving" @click="saveChanges">{{ isSaving ? 'Saving…' : 'Done editing' }}</button>

          <!-- compact verify / gold -->
          <div v-if="!profile.isVerified" class="k-card flex items-center gap-3" style="padding:14px;border-color:rgba(244,183,64,.25)">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.12);color:var(--k-gold)"><ShieldCheck :size="17" /></div>
            <div class="flex-1 min-w-0"><div class="font-semibold text-[13px]">Get verified</div><div class="text-xs text-white/55">A quick selfie · 4× matches</div></div>
            <button class="k-btn k-btn-gold" style="padding:7px 13px;font-size:12px" @click="router.push('/verify-photo')">Verify</button>
          </div>
          <div v-if="!profile.isPremium" class="k-card flex items-center gap-3" style="padding:14px;border-color:rgba(244,183,64,.3)">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.14);color:var(--k-gold)"><Crown :size="17" /></div>
            <div class="flex-1 min-w-0"><div class="font-semibold text-gold-300 text-[13px]">Kondani Gold</div><div class="text-xs text-white/55">See who likes you · 600/mo</div></div>
            <button class="k-btn k-btn-gold" style="padding:7px 13px;font-size:12px" @click="router.push('/premium')">Get</button>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button class="k-btn k-btn-ghost flex-1" style="padding:11px;font-size:13px" @click="router.push('/settings')"><Settings :size="15" /> Settings</button>
            <button class="k-btn k-btn-ghost" style="padding:11px 14px;font-size:13px;color:var(--k-coral)" @click="handleLogout"><LogOut :size="15" /></button>
          </div>
        </div>

        <!-- RIGHT: editorial content -->
        <div class="space-y-5">
          <!-- photos -->
          <div class="k-card" style="padding:20px">
            <div class="flex items-center justify-between mb-4">
              <p class="k-label">Photos</p>
              <span class="text-xs text-white/45">{{ photoCount }}/6</span>
            </div>
            <PhotoUpload v-if="isEditing" v-model="editForm.photos" :max-photos="6" />
            <div v-else class="gallery">
              <div v-for="(p, i) in photoList" :key="i" class="g"><img :src="mediaSrc(p)" alt="" /><span v-if="i===0" class="main">Main</span></div>
              <div v-for="n in emptySlots" :key="'e'+n" class="add" @click="toggleEdit"><Plus :size="20" /></div>
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

          <!-- prompts (read-only) -->
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
import { BadgeCheck, MapPin, Pencil, Plus, X, ShieldCheck, Crown, Settings, ArrowRight, Camera, LogOut, Image as ImageIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const { profile, saveProfile } = useProfile()

import { mediaUrl } from '@/utils/media'
const mediaSrc = (u) => mediaUrl(u)
const photoList = computed(() => profile.value.photos || [])
const mainPhoto = computed(() => (photoList.value[0] ? mediaSrc(photoList.value[0]) : ''))
const photoCount = computed(() => photoList.value.length)
const emptySlots = computed(() => Math.max(0, Math.min(6, 6 - photoCount.value)))
const matchCount = computed(() => profile.value.matches?.length || 0)

const isEditing = ref(false)
const isSaving = ref(false)
const newInterest = ref('')
const editForm = reactive({ bio: '', interests: [], photos: [] })

const checklist = computed(() => [
  { t: 'Add photos', done: photoCount.value >= 1, icon: Camera, action: toggleEdit },
  { t: 'Write a bio', done: !!profile.value.bio, icon: Pencil, action: toggleEdit },
  { t: 'Pick 3+ interests', done: (profile.value.interests?.length || 0) >= 3, icon: Plus, action: toggleEdit },
  { t: 'Verify with a selfie', done: !!profile.value.isVerified, icon: ShieldCheck, action: () => router.push('/verify-photo') }
])
const completeness = computed(() => checklist.value.filter(c => c.done).length * 25)
const incomplete = computed(() => checklist.value.filter(c => !c.done))

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

/* preview card */
.pcard { position: relative; width: 100%; aspect-ratio: 3/4; border-radius: 24px; overflow: hidden; border: 1px solid var(--k-line); box-shadow: 0 24px 60px rgba(0,0,0,.55); background: linear-gradient(160deg,#0e1f29,#081016); }
.pcard img { width: 100%; height: 100%; object-fit: cover; }
.pcard-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: rgba(255,255,255,.3); font-size: 13px; }
.pcard-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,13,18,.92), transparent 55%); pointer-events: none; }
.pcard-seal { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; background: var(--k-gold); color: var(--k-night); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(244,183,64,.5); }
.pcard-info { position: absolute; left: 0; right: 0; bottom: 0; padding: 20px; }

/* profile strength */
.pbar { height: 6px; border-radius: 99px; background: rgba(255,255,255,.1); overflow: hidden; }
.pbar i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--k-gold), var(--k-gold-l)); transition: width .4s ease; }
.finish-row { width: 100%; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--k-txt); padding: 7px 0; cursor: pointer; background: none; border: none; }
.finish-row:hover { color: var(--k-gold-l); }

/* gallery */
.gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.gallery .g { aspect-ratio: 3/4; border-radius: 14px; overflow: hidden; position: relative; }
.gallery .g img { width: 100%; height: 100%; object-fit: cover; }
.gallery .g .main { position: absolute; top: 7px; left: 7px; font-size: 9.5px; font-weight: 700; background: var(--k-gold); color: var(--k-night); padding: 2px 8px; border-radius: 6px; }
.gallery .add { aspect-ratio: 3/4; border-radius: 14px; border: 1.5px dashed var(--k-line); display: flex; align-items: center; justify-content: center; color: var(--k-mut2); cursor: pointer; transition: border-color .2s, color .2s; }
.gallery .add:hover { border-color: var(--k-gold); color: var(--k-gold); }

.ta { width: 100%; background: rgba(255,255,255,.05); border: 1px solid var(--k-line); border-radius: 12px; padding: 12px; color: #fff; outline: none; resize: none; font-family: inherit; }
.ta:focus { border-color: var(--k-gold); }
.inp { background: rgba(255,255,255,.05); border: 1px solid var(--k-line); border-radius: 10px; padding: 10px 14px; color: #fff; outline: none; }
.inp:focus { border-color: var(--k-gold); }
</style>
