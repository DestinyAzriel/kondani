<template>
  <div class="admin-portal min-h-screen bg-night-950 text-white font-sans antialiased">
    <!-- Top Navigation Bar -->
    <header class="sticky top-0 z-50 bg-night-900/90 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div class="max-w-[1440px] mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <KondaniMark :size="34" />
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-bold tracking-wide text-white">Kondani Admin</h1>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Staff
              </span>
            </div>
            <p class="text-xs text-white/50">Platform control, user verification & safety</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <router-link
            to="/encounters"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
          >
            <ArrowLeft :size="14" />
            <span>Open User App</span>
          </router-link>

          <button
            @click="refreshCurrentTab"
            class="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Refresh data"
            :disabled="isLoading"
          >
            <RefreshCw :size="16" :class="{ 'animate-spin': isLoading }" />
          </button>

          <button
            @click="handleLogout"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 hover:text-rose-200 transition-all cursor-pointer"
            title="Sign out of Admin Portal"
          >
            <LogOut :size="14" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Sub Navigation Tabs -->
    <div class="bg-night-900/40 border-b border-white/5 px-6 py-2.5">
      <div class="max-w-[1440px] mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="activeTab === tab.id
            ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm shadow-amber-400/10'
            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'"
        >
          <component :is="tab.icon" :size="15" />
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.badge"
            class="ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold"
            :class="activeTab === tab.id ? 'bg-amber-400 text-night-950' : 'bg-white/15 text-white/80'"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>
    </div>

    <!-- Main Content Body -->
    <main class="max-w-[1440px] mx-auto px-6 py-6">
      <!-- 1. OVERVIEW TAB -->
      <section v-if="activeTab === 'overview'" class="space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>Total Users</span>
              <Users :size="16" class="text-amber-400" />
            </div>
            <div class="text-2xl font-bold text-white">{{ stats.users?.total || 0 }}</div>
            <div class="text-[11px] text-emerald-400 mt-1">+{{ stats.users?.newToday || 0 }} new today</div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>Active (24h)</span>
              <Zap :size="16" class="text-emerald-400" />
            </div>
            <div class="text-2xl font-bold text-white">{{ stats.users?.active || 0 }}</div>
            <div class="text-[11px] text-white/40 mt-1">Daily engagement</div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>Premium Subs</span>
              <Crown :size="16" class="text-amber-400" />
            </div>
            <div class="text-2xl font-bold text-white">{{ stats.users?.premium || 0 }}</div>
            <div class="text-[11px] text-amber-300/80 mt-1">Paid subscribers</div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>Total Revenue</span>
              <Coins :size="16" class="text-emerald-400" />
            </div>
            <div class="text-2xl font-bold text-white">MWK {{ (stats.subscriptions?.revenue || 0).toLocaleString() }}</div>
            <div class="text-[11px] text-white/40 mt-1">PayChangu total</div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>Verified Profiles</span>
              <BadgeCheck :size="16" class="text-cyan-400" />
            </div>
            <div class="text-2xl font-bold text-white">{{ stats.users?.verified || 0 }}</div>
            <div class="text-[11px] text-white/40 mt-1">Blue checkmarks</div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>Pending Reviews</span>
              <ShieldAlert :size="16" class="text-rose-400" />
            </div>
            <div class="text-2xl font-bold text-rose-400">
              {{ (stats.verifications?.pending || 0) + (stats.reports?.pending || 0) }}
            </div>
            <div class="text-[11px] text-white/40 mt-1">
              {{ stats.verifications?.pending || 0 }} selfie · {{ stats.reports?.pending || 0 }} report
            </div>
          </div>
        </div>

        <!-- WhatsApp Inbound Gateway Status Card -->
        <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-white text-sm">WhatsApp Inbound Gateway</h3>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="waStatus.connected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'"
                >
                  {{ waStatus.connected ? 'Active & Ready' : 'Pairing Required' }}
                </span>
              </div>
              <p class="text-xs text-white/50 mt-0.5">
                Bot Number: +{{ waStatus.botNumber || '265989503152' }} · 1-Tap verification at zero SMS cost
              </p>
            </div>
          </div>

          <div v-if="!waStatus.connected && waStatus.qr" class="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <img :src="waStatus.qr" alt="Scan QR" class="w-24 h-24 rounded-lg bg-white p-1" />
            <div class="text-xs text-white/70 max-w-xs space-y-1">
              <div class="font-bold text-white">Link Device</div>
              <div>1. Open WhatsApp on +{{ waStatus.botNumber || '265989503152' }}</div>
              <div>2. Tap Linked Devices → Link a Device</div>
              <div>3. Scan this QR code</div>
            </div>
          </div>
        </div>

        <!-- Quick Action Panels -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Pending Verifications Teaser -->
          <div class="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <BadgeCheck :size="18" class="text-amber-400" />
                <h3 class="font-bold text-white text-sm">Selfie Verification Queue</h3>
              </div>
              <button @click="activeTab = 'verifications'" class="text-xs text-amber-400 hover:underline">
                View all →
              </button>
            </div>

            <div v-if="pendingVerifications.length === 0" class="text-center py-8 text-white/40 text-xs">
              No pending verification requests at this moment.
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="v in pendingVerifications.slice(0, 3)"
                :key="v._id"
                class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div class="flex items-center gap-3">
                  <img :src="mediaUrl(v.userId?.photos?.[0])" class="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                  <div>
                    <div class="text-xs font-bold text-white">{{ v.userId?.name || 'Member' }}</div>
                    <div class="text-[11px] text-white/40">{{ v.userId?.district || 'Nearby' }} · Score: {{ v.faceMatchScore || 0 }}%</div>
                  </div>
                </div>
                <div class="flex items-center gap-1.5">
                  <button @click="handleReviewVerification(v._id, 'approved')" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30">
                    Approve
                  </button>
                  <button @click="handleReviewVerification(v._id, 'rejected')" class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick System Overview -->
          <div class="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <Server :size="18" class="text-cyan-400" />
                <h3 class="font-bold text-white text-sm">System & Services Status</h3>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Operational
              </span>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span class="text-white/60">PayChangu Payments</span>
                <span class="text-emerald-400 font-semibold flex items-center gap-1">● Live (MWK 600 - 6,000)</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span class="text-white/60">Daily Picks Refresh Engine</span>
                <span class="text-emerald-400 font-semibold flex items-center gap-1">● 6:00 PM Cycle Active</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span class="text-white/60">WebRTC STUN / TURN Server</span>
                <span class="text-emerald-400 font-semibold flex items-center gap-1">● Coturn Active (VPS)</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span class="text-white/60">Active Admin Account</span>
                <span class="text-amber-300 font-semibold">{{ authStore.user?.email || authStore.user?.phoneNumber || 'destinymwafulirwa@gmail.com' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. USER MANAGEMENT TAB -->
      <section v-else-if="activeTab === 'users'" class="space-y-4">
        <!-- Search & Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/10">
          <div class="relative w-full sm:w-80">
            <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              v-model="userSearchQuery"
              @input="debouncedFetchUsers"
              type="text"
              placeholder="Search by name or phone..."
              class="w-full bg-night-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-amber-400/50"
            />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select
              v-model="userTierFilter"
              @change="fetchUsers"
              class="bg-night-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 outline-none"
            >
              <option value="">All Tiers</option>
              <option value="free">Free Members</option>
              <option value="plus">Kondani Plus</option>
              <option value="gold">Kondani Gold</option>
              <option value="platinum">VIP Platinum</option>
            </select>

            <select
              v-model="userBanFilter"
              @change="fetchUsers"
              class="bg-night-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="false">Active Only</option>
              <option value="true">Banned Only</option>
            </select>
          </div>
        </div>

        <!-- Users Table -->
        <div class="rounded-2xl border border-white/10 bg-white/[0.01] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-white/[0.03] border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                <tr>
                  <th class="px-4 py-3">Member</th>
                  <th class="px-4 py-3">Email / Phone</th>
                  <th class="px-4 py-3">District</th>
                  <th class="px-4 py-3">Tier</th>
                  <th class="px-4 py-3">Role</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="user in userList" :key="user._id" class="hover:bg-white/[0.02] transition-colors">
                  <td class="px-4 py-3.5">
                    <div class="flex items-center gap-3">
                      <img
                        :src="mediaUrl(user.photos?.[0])"
                        class="w-9 h-9 rounded-full object-cover border border-white/10"
                        alt=""
                      />
                      <div>
                        <div class="font-bold text-white flex items-center gap-1">
                          <span>{{ user.name || 'Unnamed' }}</span>
                          <BadgeCheck v-if="user.isVerified" :size="13" class="text-cyan-400" />
                        </div>
                        <div class="text-[11px] text-white/40">Age: {{ user.age || '—' }} · {{ user.gender || '—' }}</div>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 py-3.5 font-mono text-white/70">{{ user.email || user.phoneNumber || '—' }}</td>
                  <td class="px-4 py-3.5 text-white/60">{{ user.district || '—' }}</td>

                  <td class="px-4 py-3.5">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      :class="{
                        'bg-amber-400/20 text-amber-300 border border-amber-400/30': user.isPremium || user.subscriptionTier === 'gold',
                        'bg-purple-400/20 text-purple-300 border border-purple-400/30': user.subscriptionTier === 'platinum',
                        'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30': user.subscriptionTier === 'plus',
                        'bg-white/10 text-white/60 border border-white/10': !user.isPremium && user.subscriptionTier === 'free'
                      }"
                    >
                      {{ user.subscriptionTier || (user.isPremium ? 'Gold' : 'Free') }}
                    </span>
                  </td>

                  <td class="px-4 py-3.5">
                    <span
                      class="text-[11px] font-semibold"
                      :class="user.role === 'admin' ? 'text-amber-400 font-bold' : 'text-white/40'"
                    >
                      {{ user.role || 'user' }}
                    </span>
                  </td>

                  <td class="px-4 py-3.5">
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      :class="user.isBanned ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'"
                    >
                      {{ user.isBanned ? 'Banned' : 'Active' }}
                    </span>
                  </td>

                  <td class="px-4 py-3.5 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <!-- Toggle Premium -->
                      <button
                        @click="handleTogglePremium(user)"
                        class="px-2.5 py-1 text-[11px] rounded-lg border border-white/10 hover:bg-white/10 text-white/80 transition-colors"
                        :title="user.isPremium ? 'Revoke Premium' : 'Grant Gold'"
                      >
                        {{ user.isPremium ? 'Demote' : 'Make Gold' }}
                      </button>

                      <!-- Toggle Ban -->
                      <button
                        @click="handleToggleBan(user)"
                        class="px-2.5 py-1 text-[11px] rounded-lg border transition-colors"
                        :class="user.isBanned
                          ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          : 'border-rose-500/30 text-rose-300 hover:bg-rose-500/20'"
                      >
                        {{ user.isBanned ? 'Unban' : 'Ban' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 3. PHOTO VERIFICATION REVIEW TAB -->
      <section v-else-if="activeTab === 'verifications'" class="space-y-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h2 class="text-base font-bold text-white">Selfie Pose Verifications</h2>
            <p class="text-xs text-white/50">Compare profile photos with submitted selfie pose challenges</p>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <button
              @click="fetchVerifications('all')"
              class="px-3 py-1.5 rounded-lg border text-xs transition-all"
              :class="verificationFilter === 'all' ? 'bg-white/10 border-white/30 text-white' : 'border-transparent text-white/50'"
            >
              All
            </button>
            <button
              @click="fetchVerifications('pending')"
              class="px-3 py-1.5 rounded-lg border text-xs transition-all"
              :class="verificationFilter === 'pending' ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 font-bold' : 'border-transparent text-white/50'"
            >
              Pending ({{ pendingVerifications.length }})
            </button>
          </div>
        </div>

        <div v-if="verificationList.length === 0" class="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl text-white/40 text-sm">
          No verification requests matching your filter.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="item in verificationList"
            :key="item._id"
            class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-4"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="font-bold text-white text-base">{{ item.userId?.name || 'Unknown Member' }}</h3>
                  <p class="text-xs text-white/50">{{ item.userId?.phoneNumber }} · {{ item.userId?.district || 'Malawi' }}</p>
                </div>
                <span
                  class="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                  :class="{
                    'bg-amber-400/20 text-amber-300 border border-amber-400/30': item.status === 'pending',
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': item.status === 'approved',
                    'bg-rose-500/20 text-rose-300 border border-rose-500/30': item.status === 'rejected'
                  }"
                >
                  {{ item.status }}
                </span>
              </div>

              <!-- Side by Side Photos -->
              <div class="grid grid-cols-2 gap-3 mt-4">
                <div class="space-y-1">
                  <div class="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Main Profile Photo</div>
                  <div class="h-56 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img :src="mediaUrl(item.userId?.photos?.[0])" class="w-full h-full object-cover" alt="Profile" />
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Submitted Selfie</div>
                  <div class="h-56 rounded-xl overflow-hidden border border-white/10 bg-black/40 relative">
                    <img :src="mediaUrl(item.selfieUrl)" class="w-full h-full object-cover" alt="Selfie" />
                    <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-bold text-amber-300 border border-white/10">
                      Score: {{ item.faceMatchScore || 0 }}%
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-3 text-xs text-white/60 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                <span>Pose Challenge: <b>{{ item.poseChallenge || 'Standard face check' }}</b></span>
                <span>Submitted: <b>{{ formatDate(item.createdAt) }}</b></span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                @click="handleReviewVerification(item._id, 'approved')"
                class="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-night-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Check :size="15" /> Approve (Grant Checkmark)
              </button>
              <button
                @click="handleReviewVerification(item._id, 'rejected')"
                class="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <X :size="15" /> Reject
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. MODERATION & REPORTS TAB -->
      <section v-else-if="activeTab === 'reports'" class="space-y-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h2 class="text-base font-bold text-white">Member Safety & Reports</h2>
            <p class="text-xs text-white/50">Investigate reported accounts and take moderation action</p>
          </div>
        </div>

        <div v-if="reportList.length === 0" class="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl text-white/40 text-sm">
          No reports filed by members. All clean!
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="rep in reportList"
            :key="rep._id"
            class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div class="space-y-1 max-w-xl">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  {{ rep.reason }}
                </span>
                <span class="text-xs text-white/50">Status: {{ rep.status }}</span>
              </div>
              <div class="text-sm font-semibold text-white">
                Reported Member: <span class="text-amber-300">{{ rep.reportedUserId?.name || 'Unknown' }}</span> ({{ rep.reportedUserId?.email || rep.reportedUserId?.phoneNumber || '—' }})
              </div>
              <p class="text-xs text-white/70 italic">"{{ rep.description || 'No additional comment provided.' }}"</p>
              <div class="text-[11px] text-white/40">Reported by: {{ rep.reporterId?.name || 'Anonymous' }} · {{ formatDate(rep.createdAt) }}</div>
            </div>

            <div class="flex items-center gap-2 self-end md:self-center">
              <button
                @click="handleReviewReport(rep._id, 'dismissed', 'none')"
                class="px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
              >
                Dismiss
              </button>
              <button
                @click="handleReviewReport(rep._id, 'resolved', 'temporary_ban')"
                class="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
              >
                3-Day Ban
              </button>
              <button
                @click="handleReviewReport(rep._id, 'resolved', 'permanent_ban')"
                class="px-3 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-400 text-night-950 shadow-md shadow-rose-500/20"
              >
                Permanent Ban
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { adminService } from '@/services/adminService'
import { api } from '@/services/api'
import { mediaUrl } from '@/utils/media'
import KondaniMark from '@/components/ui/KondaniMark.vue'
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Zap,
  Crown,
  Coins,
  Search,
  Check,
  X,
  Server,
  LogOut,
  Smartphone
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

const activeTab = ref('overview')
const isLoading = ref(false)

const stats = ref({})
const waStatus = ref({})
const userList = ref([])
const userSearchQuery = ref('')
const userTierFilter = ref('')
const userBanFilter = ref('')

const verificationList = ref([])
const verificationFilter = ref('pending')
const reportList = ref([])

const pendingVerifications = computed(() =>
  verificationList.value.filter(v => v.status === 'pending')
)

const tabs = computed(() => [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'User Directory', icon: Users, badge: stats.value.users?.total },
  { id: 'verifications', label: 'Photo Verifications', icon: BadgeCheck, badge: pendingVerifications.value.length || null },
  { id: 'reports', label: 'Safety & Reports', icon: ShieldAlert, badge: stats.value.reports?.pending || null }
])

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const fetchDashboardStats = async () => {
  try {
    stats.value = await adminService.getDashboardStats()
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

const fetchUsers = async () => {
  try {
    const params = {
      search: userSearchQuery.value || undefined,
      isPremium: userTierFilter.value ? (userTierFilter.value !== 'free') : undefined,
      isBanned: userBanFilter.value || undefined
    }
    const res = await adminService.getUsers(params)
    userList.value = res.users || []
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

let debounceTimer = null
const debouncedFetchUsers = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchUsers, 300)
}

const fetchVerifications = async (status = 'all') => {
  verificationFilter.value = status
  try {
    const res = await adminService.getVerifications(status)
    verificationList.value = res.verifications || []
  } catch (err) {
    console.error('Failed to load verifications:', err)
  }
}

const fetchReports = async () => {
  try {
    const res = await adminService.getReports()
    reportList.value = res.reports || []
  } catch (err) {
    console.error('Failed to load reports:', err)
  }
}

const fetchWhatsAppStatus = async () => {
  try {
    const res = await api.get('/auth/whatsapp-status')
    waStatus.value = res.data || {}
  } catch (err) {
    console.error('Failed to load WhatsApp status:', err)
  }
}

const refreshCurrentTab = async () => {
  isLoading.value = true
  await fetchDashboardStats()
  await fetchWhatsAppStatus()
  if (activeTab.value === 'users') await fetchUsers()
  else if (activeTab.value === 'verifications') await fetchVerifications(verificationFilter.value)
  else if (activeTab.value === 'reports') await fetchReports()
  isLoading.value = false
}

const handleReviewVerification = async (verificationId, status) => {
  try {
    await adminService.reviewVerification(verificationId, { status })
    success(`Verification marked as ${status}!`)
    await fetchVerifications(verificationFilter.value)
    await fetchDashboardStats()
  } catch (err) {
    error('Failed to review verification')
  }
}

const handleReviewReport = async (reportId, status, action) => {
  try {
    await adminService.reviewReport(reportId, { status, action })
    success(`Report processed: ${action || status}`)
    await fetchReports()
    await fetchDashboardStats()
  } catch (err) {
    error('Failed to process report')
  }
}

const handleTogglePremium = async (user) => {
  const newPremium = !user.isPremium
  try {
    await adminService.updateUser(user._id, {
      isPremium: newPremium,
      subscriptionTier: newPremium ? 'gold' : 'free'
    })
    user.isPremium = newPremium
    user.subscriptionTier = newPremium ? 'gold' : 'free'
    success(`Updated ${user.name || 'user'} to ${newPremium ? 'Gold' : 'Free'}`)
  } catch (err) {
    error('Failed to update tier')
  }
}

const handleToggleBan = async (user) => {
  const newBanned = !user.isBanned
  try {
    await adminService.updateUser(user._id, {
      isBanned: newBanned,
      banReason: newBanned ? 'Admin manual action' : ''
    })
    user.isBanned = newBanned
    success(`User ${user.name || ''} has been ${newBanned ? 'banned' : 'unbanned'}`)
  } catch (err) {
    error('Failed to update ban status')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  success('Signed out of admin')
  router.push('/login')
}

let waStatusInterval = null

onMounted(async () => {
  isLoading.value = true
  await fetchDashboardStats()
  await fetchWhatsAppStatus()
  await fetchUsers()
  await fetchVerifications('all')
  await fetchReports()
  isLoading.value = false

  // Poll WhatsApp pairing status if not yet connected
  waStatusInterval = setInterval(() => {
    if (activeTab.value === 'overview') {
      fetchWhatsAppStatus()
    }
  }, 6000)
})

onUnmounted(() => {
  if (waStatusInterval) clearInterval(waStatusInterval)
})
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
