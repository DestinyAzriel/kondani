<template>
  <div class="profile k-page pb-28 relative">
    <!-- cover -->
    <div class="cover">
      <div class="cover-grad"></div>
      <div class="k-stars"></div>
    </div>

    <div class="max-w-2xl mx-auto px-5 relative" style="margin-top:-66px">
      <!-- header row -->
      <div class="flex items-end justify-between gap-3">
        <div class="avwrap">
          <img :src="mainPhoto" class="av" alt="" />
          <div v-if="profile.isVerified" class="seal"><Check :size="15" /></div>
        </div>
        <div class="flex gap-2 pb-1">
          <button v-if="!isEditing" class="k-btn k-btn-ghost" style="padding:9px 16px;font-size:13px" @click="toggleEdit"><Pencil :size="15" /> Edit</button>
          <button v-else class="k-btn k-btn-gold" style="padding:9px 18px;font-size:13px" :disabled="isSaving" @click="saveChanges">{{ isSaving ? 'Saving…' : 'Done' }}</button>
        </div>
      </div>

      <div class="mt-3">
        <div class="flex items-center gap-3">
          <h1 class="k-title" style="font-size:2rem">{{ profile.name || 'Your name' }}</h1>
          <span v-if="profile.age" class="text-xl text-white/60">{{ profile.age }}</span>
          <span v-if="profile.isVerified" class="k-ver"><BadgeCheck :size="12" /> Verified</span>
        </div>
        <div class="flex items-center gap-1.5 text-lagoon-300 text-sm mt-1.5"><MapPin :size="15" /> {{ profile.district || 'Set your location' }}</div>
      </div>

      <!-- stats -->
      <div class="grid grid-cols-3 gap-3 mt-6">
        <div class="k-card text-center" style="padding:15px"><div class="k-serif text-gold-300" style="font-size:1.5rem">{{ completeness }}%</div><div class="text-xs text-white/55 mt-1">Complete</div></div>
        <div class="k-card text-center" style="padding:15px"><div class="k-serif text-lagoon-300" style="font-size:1.5rem">{{ matchCount }}</div><div class="text-xs text-white/55 mt-1">Matches</div></div>
        <div class="k-card text-center" style="padding:15px"><div class="k-serif" style="font-size:1.5rem">{{ photoCount }}</div><div class="text-xs text-white/55 mt-1">Photos</div></div>
      </div>

      <!-- completeness checklist (only if <100) -->
      <div v-if="completeness < 100" class="k-card mt-5" style="padding:18px">
        <p class="k-label mb-3">Finish your profile</p>
        <div class="space-y-2.5">
          <div v-for="c in checklist" :key="c.t" class="flex items-center gap-3 text-sm" :class="c.done ? 'text-white/45' : 'text-white'">
            <span class="cdot" :class="c.done ? 'd' : 't'"><component :is="c.done ? Check : c.icon" :size="11" /></span>
            {{ c.t }}
            <span v-if="!c.done && c.cta" class="ml-auto text-gold-300 text-xs font-medium cursor-pointer flex items-center gap-1" @click="c.action"> {{ c.cta }} <ArrowRight :size="13" /></span>
          </div>
        </div>
      </div>

      <!-- photos -->
      <div class="k-card mt-5" style="padding:18px">
        <p class="k-label mb-3">Photos</p>
        <PhotoUpload v-if="isEditing" v-model="editForm.photos" :max-photos="6" />
        <div v-else class="gallery">
          <div v-for="(p, i) in photoList" :key="i" class="g"><img :src="mediaSrc(p)" alt="" /><span v-if="i===0" class="main">Main</span></div>
          <div v-for="n in emptySlots" :key="'e'+n" class="add"><Plus :size="20" /></div>
        </div>
      </div>

      <!-- about -->
      <div class="k-card mt-5" style="padding:18px">
        <p class="k-label mb-2.5">About me</p>
        <textarea v-if="isEditing" v-model="editForm.bio" rows="4" maxlength="500" class="ta" placeholder="Tell people a bit about you…"></textarea>
        <p v-else class="text-[15px] leading-relaxed text-white/85">{{ profile.bio || 'Add a bio to show your personality.' }}</p>
      </div>

      <!-- interests -->
      <div class="k-card mt-5" style="padding:18px">
        <p class="k-label mb-3">Interests</p>
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
      <div v-if="profile.prompts?.length" class="mt-5">
        <p class="k-label mb-3">Prompts</p>
        <div v-for="(pr,i) in profile.prompts" :key="i" class="k-card mb-3" style="padding:16px">
          <div class="text-xs text-gold-300 font-medium mb-1.5">{{ pr.question }}</div>
          <div class="k-serif" style="font-size:17px">"{{ pr.answer }}"</div>
        </div>
      </div>

      <!-- verify -->
      <div v-if="!profile.isVerified" class="k-card mt-5 flex items-center gap-4" style="padding:18px;border-color:rgba(244,183,64,.25)">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.12);color:var(--k-gold)"><ShieldCheck :size="20" /></div>
        <div class="flex-1"><div class="font-semibold text-sm">Get the gold badge</div><div class="text-xs text-white/55 mt-0.5">A quick selfie — 4× more matches.</div></div>
        <button class="k-btn k-btn-gold" style="padding:9px 16px;font-size:12.5px" @click="router.push('/verify-photo')">Verify</button>
      </div>

      <!-- gold -->
      <div v-if="!profile.isPremium" class="k-card mt-5 flex items-center gap-4" style="padding:18px;border-color:rgba(244,183,64,.3)">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(244,183,64,.14);color:var(--k-gold)"><Crown :size="20" /></div>
        <div class="flex-1"><div class="font-semibold text-gold-300 text-sm">Kondani Gold</div><div class="text-xs text-white/55 mt-0.5">See who likes you — MWK 600/mo.</div></div>
        <button class="k-btn k-btn-gold" style="padding:9px 16px;font-size:12.5px" @click="router.push('/premium')">Upgrade</button>
      </div>

      <!-- actions -->
      <div class="mt-6 space-y-3">
        <button class="k-btn k-btn-ghost w-full" style="padding:13px" @click="router.push('/settings')"><Settings :size="16" /> Account settings</button>
        <button class="w-full font-medium text-sm py-2" style="color:var(--k-coral)" @click="handleLogout">Sign out</button>
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
import { Check, BadgeCheck, MapPin, Pencil, Plus, X, ShieldCheck, Crown, Settings, ArrowRight, Camera } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const { profile, saveProfile } = useProfile()

import { mediaUrl } from '@/utils/media'
const mediaSrc = (u) => mediaUrl(u)
const photoList = computed(() => profile.value.photos || [])
const mainPhoto = computed(() => (photoList.value[0] ? mediaSrc(photoList.value[0]) : 'https://via.placeholder.com/300'))
const photoCount = computed(() => photoList.value.length)
const emptySlots = computed(() => Math.max(0, Math.min(6, 6 - photoCount.value)))
const matchCount = computed(() => profile.value.matches?.length || 0)

const isEditing = ref(false)
const isSaving = ref(false)
const newInterest = ref('')
const editForm = reactive({ bio: '', interests: [], photos: [] })

const checklist = computed(() => [
  { t: 'Add photos', done: photoCount.value >= 1, icon: Camera, cta: 'Add', action: toggleEdit },
  { t: 'Write a bio', done: !!profile.value.bio, icon: Pencil, cta: 'Add', action: toggleEdit },
  { t: 'Pick 3+ interests', done: (profile.value.interests?.length || 0) >= 3, icon: Plus, cta: 'Add', action: toggleEdit },
  { t: 'Verify with a selfie', done: !!profile.value.isVerified, icon: Camera, cta: 'Verify', action: () => router.push('/verify-photo') }
])
const completeness = computed(() => checklist.value.filter(c => c.done).length * 25)

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
.cover { height: 180px; position: relative; overflow: hidden; }
.cover-grad { position: absolute; inset: 0; background: linear-gradient(120deg, rgba(45,212,191,.22), rgba(244,183,64,.16)); }
.cover::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, var(--k-night)); }
.avwrap { position: relative; }
.av { width: 122px; height: 122px; border-radius: 26px; object-fit: cover; border: 4px solid var(--k-night); box-shadow: 0 16px 40px rgba(0,0,0,.6); background: #0e1f29; }
.seal { position: absolute; bottom: -6px; right: -6px; width: 30px; height: 30px; border-radius: 50%; background: var(--k-gold); color: var(--k-night); display: flex; align-items: center; justify-content: center; border: 3px solid var(--k-night); }
.cdot { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cdot.d { background: var(--k-lagoon); color: var(--k-night); }
.cdot.t { border: 1.5px solid var(--k-gold); color: var(--k-gold); }
.gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.gallery .g { aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; position: relative; }
.gallery .g img { width: 100%; height: 100%; object-fit: cover; }
.gallery .g .main { position: absolute; top: 6px; left: 6px; font-size: 9.5px; font-weight: 600; background: var(--k-gold); color: var(--k-night); padding: 2px 8px; border-radius: 6px; }
.gallery .add { aspect-ratio: 3/4; border-radius: 12px; border: 1.5px dashed var(--k-line); display: flex; align-items: center; justify-content: center; color: var(--k-mut2); }
.ta { width: 100%; background: rgba(255,255,255,.05); border: 1px solid var(--k-line); border-radius: 12px; padding: 12px; color: #fff; outline: none; resize: none; font-family: inherit; }
.ta:focus { border-color: var(--k-lagoon); }
.inp { background: rgba(255,255,255,.05); border: 1px solid var(--k-line); border-radius: 10px; padding: 10px 14px; color: #fff; outline: none; }
.inp:focus { border-color: var(--k-lagoon); }
</style>
