<template>
  <div class="admin-portal min-h-screen bg-night-950 text-white font-sans antialiased">
    <!-- Top Navigation Bar -->
    <header class="sticky top-0 z-50 bg-night-900/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5 sm:py-3.5">
      <div class="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <KondaniMark :size="28" class="shrink-0" />
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h1 class="text-sm sm:text-base font-bold tracking-wide text-white whitespace-nowrap">Kondani Admin</h1>
              <span class="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">Staff</span>
            </div>
            <p class="text-[10px] text-white/50 hidden md:block">Platform control, user verification &amp; safety</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <router-link
            to="/encounters"
            class="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all whitespace-nowrap"
          >
            <ArrowLeft :size="13" />
            <span>App</span>
          </router-link>

          <button
            @click="refreshCurrentTab"
            class="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Refresh data"
            :disabled="isLoading"
          >
            <RefreshCw :size="14" :class="{ 'animate-spin': isLoading }" />
          </button>

          <button
            @click="handleLogout"
            class="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 hover:text-rose-200 transition-all cursor-pointer whitespace-nowrap"
            title="Sign out of Admin Portal"
          >
            <LogOut :size="13" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Sub Navigation Tabs -->
    <div class="bg-night-900/40 border-b border-white/5 px-3 sm:px-6 py-2">
      <div class="max-w-[1440px] mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer"
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
    <main class="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
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

        <!-- Tier Breakdown + Gender Ratio + Engagement Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Subscription Tiers -->
          <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 class="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Subscription Tiers</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-white/60">Free</span>
                <span class="text-xs font-bold text-white">{{ stats.users?.tiers?.free || 0 }}</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-1.5"><div class="bg-white/30 h-1.5 rounded-full" :style="{ width: tierPercent('free') }"></div></div>

              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-cyan-300">Plus</span>
                <span class="text-xs font-bold text-cyan-300">{{ stats.users?.tiers?.plus || 0 }}</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-1.5"><div class="bg-cyan-400 h-1.5 rounded-full" :style="{ width: tierPercent('plus') }"></div></div>

              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-amber-300">Gold</span>
                <span class="text-xs font-bold text-amber-300">{{ stats.users?.tiers?.gold || 0 }}</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-1.5"><div class="bg-amber-400 h-1.5 rounded-full" :style="{ width: tierPercent('gold') }"></div></div>

              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-purple-300">VIP</span>
                <span class="text-xs font-bold text-purple-300">{{ stats.users?.tiers?.platinum || 0 }}</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-1.5"><div class="bg-purple-400 h-1.5 rounded-full" :style="{ width: tierPercent('platinum') }"></div></div>
            </div>
          </div>

          <!-- Gender Ratio -->
          <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 class="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Gender Ratio</h3>
            <div class="flex items-end gap-4 h-24">
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="text-lg font-bold text-blue-400">{{ stats.users?.genders?.men || 0 }}</div>
                <div class="w-full bg-blue-500/30 rounded-t-lg" :style="{ height: genderBarHeight('men') }"></div>
                <span class="text-[10px] text-white/50">Men</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="text-lg font-bold text-pink-400">{{ stats.users?.genders?.women || 0 }}</div>
                <div class="w-full bg-pink-500/30 rounded-t-lg" :style="{ height: genderBarHeight('women') }"></div>
                <span class="text-[10px] text-white/50">Women</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="text-lg font-bold text-white/60">{{ stats.users?.genders?.other || 0 }}</div>
                <div class="w-full bg-white/10 rounded-t-lg" :style="{ height: genderBarHeight('other') }"></div>
                <span class="text-[10px] text-white/50">Other</span>
              </div>
            </div>
          </div>

          <!-- Engagement Metrics -->
          <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 class="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Platform Engagement</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span class="text-xs text-white/60">Total Matches</span>
                <span class="text-sm font-bold text-rose-400">{{ stats.engagement?.totalMatches || 0 }}</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span class="text-xs text-white/60">Messages Sent</span>
                <span class="text-sm font-bold text-blue-400">{{ stats.engagement?.totalMessages || 0 }}</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span class="text-xs text-white/60">Weekend Plans</span>
                <span class="text-sm font-bold text-emerald-400">{{ stats.engagement?.totalPlans || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Authentication Info Card (replaces WhatsApp Gateway) -->
        <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-white text-sm">Google Sign-In Authentication</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>
              </div>
              <p class="text-xs text-white/50 mt-0.5">
                Secure 1-Tap Google OAuth 2.0 · Zero friction instant authentication
              </p>
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
                  <div class="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-night-800 flex items-center justify-center">
                    <img
                      v-if="v.userId?.photos && v.userId.photos.length && v.userId.photos[0]"
                      :src="mediaUrl(v.userId.photos[0])"
                      class="w-full h-full object-cover"
                      alt=""
                      @error="$event.target.style.display='none'"
                    />
                    <span v-else class="text-xs font-bold text-amber-300">
                      {{ getInitials(v.userId?.name) }}
                    </span>
                  </div>
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

        <!-- ═══════════════════════════════════════════════════════════════
             MATCHING FUNNEL — Read-only aggregate panel
        ══════════════════════════════════════════════════════════════════ -->
        <div class="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-white/[0.02] to-transparent overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div class="flex items-center gap-2.5">
              <span class="p-2 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400">
                <Heart :size="16" />
              </span>
              <div>
                <h3 class="text-sm font-bold text-white">Matching Funnel</h3>
                <p class="text-[10px] text-white/40 mt-0.5">Counts only · No names</p>
              </div>
            </div>
            <div v-if="funnelLoading" class="w-4 h-4 rounded-full border-2 border-rose-400/30 border-t-rose-400 animate-spin"></div>
            <span v-else class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 font-mono">read-only</span>
          </div>

          <!-- Loading skeleton -->
          <div v-if="funnelLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/5">
            <div v-for="i in 5" :key="i" class="bg-night-950 p-5 animate-pulse">
              <div class="h-3 bg-white/10 rounded w-3/4 mb-3"></div>
              <div class="h-7 bg-white/10 rounded w-1/2 mb-1"></div>
              <div class="h-2.5 bg-white/5 rounded w-full"></div>
            </div>
          </div>

          <!-- Data grid -->
          <div v-else-if="funnelData" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/5">

            <!-- 1. Likes Sent Breakdown (spans 2 cols on large screens) -->
            <div class="bg-night-950 p-5 lg:col-span-2">
              <div class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">Likes Sent</div>
              <div class="space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-blue-300 flex items-center gap-1.5">
                    <span class="inline-block w-2 h-2 rounded-full bg-blue-400/80"></span>
                    Men → Women
                  </span>
                  <span class="text-sm font-bold text-white">{{ (funnelData.likesSentMenToWomen || 0).toLocaleString() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-pink-300 flex items-center gap-1.5">
                    <span class="inline-block w-2 h-2 rounded-full bg-pink-400/80"></span>
                    Women → Men
                  </span>
                  <span class="text-sm font-bold text-white">{{ (funnelData.likesSentWomenToMen || 0).toLocaleString() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-white/50 flex items-center gap-1.5">
                    <span class="inline-block w-2 h-2 rounded-full bg-white/20"></span>
                    Other combinations
                  </span>
                  <span class="text-sm font-bold text-white/70">{{ (funnelData.likesSentOther || 0).toLocaleString() }}</span>
                </div>
                <div class="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span class="text-[10px] text-white/30">Total sent</span>
                  <span class="text-base font-black text-rose-400">{{ (funnelData.likesSentTotal || 0).toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- 2. Women Engagement -->
            <div class="bg-night-950 p-5">
              <div class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">Women Engagement</div>
              <div class="space-y-3">
                <div>
                  <div class="text-[10px] text-white/40 mb-0.5">Received ≥ 1 like</div>
                  <div class="text-xl font-black text-pink-400">{{ (funnelData.womenReceivedAtLeast1 || 0).toLocaleString() }}</div>
                  <div class="text-[10px] text-white/30 mt-0.5">
                    of {{ (funnelData.totalWomen || 0).toLocaleString() }} women
                    <span v-if="funnelData.totalWomen > 0" class="text-pink-400/70 ml-1">
                      ({{ Math.round((funnelData.womenReceivedAtLeast1 / funnelData.totalWomen) * 100) }}%)
                    </span>
                  </div>
                </div>
                <div class="pt-2 border-t border-white/5">
                  <div class="text-[10px] text-white/40 mb-0.5">Sent ≥ 1 like</div>
                  <div class="text-xl font-black text-amber-400">{{ (funnelData.womenSentAtLeast1 || 0).toLocaleString() }}</div>
                  <div class="text-[10px] text-white/30 mt-0.5">women who liked someone</div>
                </div>
              </div>
            </div>

            <!-- 3. Avg likes per woman + zero-senders -->
            <div class="bg-night-950 p-5 space-y-4">
              <div>
                <div class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Avg Likes / Woman</div>
                <div class="text-3xl font-black text-emerald-400">{{ funnelData.avgLikesPerWoman ?? '—' }}</div>
                <div class="text-[10px] text-white/30 mt-1">mean received per female member</div>
              </div>
              <div class="pt-3 border-t border-white/5">
                <div class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Sent 0 Likes</div>
                <div class="text-2xl font-black text-amber-300">{{ (funnelData.usersWithZeroLikes || 0).toLocaleString() }}</div>
                <div class="text-[10px] text-white/30 mt-1">users who never swiped right</div>
              </div>
            </div>

            <!-- 4. Mutual Matches -->
            <div class="bg-night-950 p-5 flex flex-col justify-center">
              <div class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">Mutual Matches</div>
              <div class="text-4xl font-black text-rose-400 mb-1">{{ (funnelData.mutualMatches || 0).toLocaleString() }}</div>
              <div class="text-[10px] text-white/30">pairs who liked each other</div>
              <div class="mt-3 pt-3 border-t border-white/5 text-[10px] text-white/25">
                Match rate:
                <span class="text-white/50 font-semibold">
                  {{ funnelData.likesSentTotal > 0
                    ? ((funnelData.mutualMatches / funnelData.likesSentTotal) * 100).toFixed(1)
                    : '0.0' }}%
                </span>
                of total likes
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="py-12 text-center text-white/30 text-xs">
            No likes data found yet — funnel will populate as users engage.
          </div>
        </div>

      </section>

      <!-- 2. FINANCIALS & EXCEL LEDGER TAB -->
      <section v-else-if="activeTab === 'financials'" class="space-y-6">
        <!-- Investor Executive Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-white/[0.02] to-transparent border border-amber-400/20 shadow-xl">
          <div>
            <div class="flex items-center gap-2">
              <span class="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <TrendingUp :size="20" />
              </span>
              <div>
                <h2 class="text-base sm:text-lg font-bold text-white">Investor Financials &amp; Revenue Ledger</h2>
                <p class="text-xs text-white/50">Real-time GMV, unit economics &amp; one-click Excel export for investor meetings</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              @click="exportToExcel"
              class="flex-1 sm:flex-none k-btn k-btn-gold py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <FileSpreadsheet :size="16" />
              <span>Export to Excel (.csv)</span>
              <Download :size="14" />
            </button>
            <button
              @click="fetchFinancials"
              class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Refresh financial data"
            >
              <RefreshCw :size="16" />
            </button>
          </div>
        </div>

        <!-- 5 Key Investor Metrics -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-[11px] mb-1.5">
              <span>Gross Revenue (GMV)</span>
              <Coins :size="15" class="text-emerald-400" />
            </div>
            <div class="text-xl sm:text-2xl font-bold text-emerald-400">
              MWK {{ (financialData.summary?.totalGrossRevenue || 0).toLocaleString() }}
            </div>
            <div class="text-[10px] text-white/40 mt-1">PayChangu total</div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-[11px] mb-1.5">
              <span>Month-to-Date (MTD)</span>
              <Coins :size="15" class="text-amber-400" />
            </div>
            <div class="text-xl sm:text-2xl font-bold text-white">
              MWK {{ (financialData.summary?.mtdRevenue || 0).toLocaleString() }}
            </div>
            <div class="text-[10px] text-emerald-400 mt-1">
              MoM: {{ financialData.summary?.momGrowthPercent || '0%' }}
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-[11px] mb-1.5">
              <span>Paying Customers</span>
              <Crown :size="15" class="text-gold-300" />
            </div>
            <div class="text-xl sm:text-2xl font-bold text-white">
              {{ financialData.summary?.payingCustomersCount || 0 }}
            </div>
            <div class="text-[10px] text-white/40 mt-1">Paid subscribers</div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div class="flex items-center justify-between text-white/50 text-[11px] mb-1.5">
              <span>Conversion Rate</span>
              <TrendingUp :size="15" class="text-cyan-400" />
            </div>
            <div class="text-xl sm:text-2xl font-bold text-cyan-300">
              {{ financialData.summary?.conversionRate || '0.00%' }}
            </div>
            <div class="text-[10px] text-white/40 mt-1">Free-to-Paid ratio</div>
          </div>

          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 col-span-2 sm:col-span-1">
            <div class="flex items-center justify-between text-white/50 text-[11px] mb-1.5">
              <span>ARPU (Avg Rev / User)</span>
              <Zap :size="15" class="text-purple-400" />
            </div>
            <div class="text-xl sm:text-2xl font-bold text-purple-300">
              MWK {{ (financialData.summary?.arpu || 0).toLocaleString() }}
            </div>
            <div class="text-[10px] text-white/40 mt-1">ARPPU: MWK {{ (financialData.summary?.arppu || 0).toLocaleString() }}</div>
          </div>
        </div>

        <!-- Tier & Channel Breakdown Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tier Breakdown -->
          <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Revenue by Subscription Tier</span>
              <Crown :size="14" class="text-amber-400" />
            </h3>
            <div class="space-y-3">
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-white/80">Kondani Free</span>
                  <span class="font-semibold text-white/50">{{ financialData.summary?.tierBreakdown?.free || 0 }} users</span>
                </div>
                <div class="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div class="h-full bg-white/20 rounded-full" :style="{ width: tierPercent('free') }"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-cyan-300 font-semibold">Kondani Plus (MWK 600/wk)</span>
                  <span class="font-semibold text-cyan-300">{{ financialData.summary?.tierBreakdown?.plus || 0 }} subs</span>
                </div>
                <div class="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div class="h-full bg-cyan-400 rounded-full" :style="{ width: tierPercent('plus') }"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-amber-300 font-semibold">Kondani Gold (MWK 2,400/mo)</span>
                  <span class="font-semibold text-amber-300">{{ financialData.summary?.tierBreakdown?.gold || 0 }} subs</span>
                </div>
                <div class="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div class="h-full bg-amber-400 rounded-full" :style="{ width: tierPercent('gold') }"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-purple-300 font-semibold">VIP Platinum (MWK 6,000/yr)</span>
                  <span class="font-semibold text-purple-300">{{ financialData.summary?.tierBreakdown?.platinum || 0 }} subs</span>
                </div>
                <div class="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div class="h-full bg-purple-400 rounded-full" :style="{ width: tierPercent('platinum') }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Channels -->
          <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div>
              <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Payment Gateways &amp; Channels</span>
                <CreditCard :size="14" class="text-emerald-400" />
              </h3>
              <div class="space-y-3">
                <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-black text-xs">AM</div>
                    <div>
                      <div class="text-xs font-bold text-white">Airtel Money (Malawi)</div>
                      <div class="text-[10px] text-white/40">Processed via PayChangu Mobile</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span v-if="financialData.summary?.channelStats?.airtel?.volume" class="text-xs font-bold text-emerald-400 block">
                      MWK {{ financialData.summary.channelStats.airtel.volume.toLocaleString() }}
                    </span>
                    <span class="text-[10px] text-white/50">
                      {{ financialData.summary?.channelStats?.airtel?.count ? `${financialData.summary.channelStats.airtel.count} txns` : 'Active' }}
                    </span>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs">TM</div>
                    <div>
                      <div class="text-xs font-bold text-white">TNM Mpamba (Malawi)</div>
                      <div class="text-[10px] text-white/40">Processed via PayChangu Mobile</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span v-if="financialData.summary?.channelStats?.tnm?.volume" class="text-xs font-bold text-emerald-400 block">
                      MWK {{ financialData.summary.channelStats.tnm.volume.toLocaleString() }}
                    </span>
                    <span class="text-[10px] text-white/50">
                      {{ financialData.summary?.channelStats?.tnm?.count ? `${financialData.summary.channelStats.tnm.count} txns` : 'Active' }}
                    </span>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-black text-xs">CC</div>
                    <div>
                      <div class="text-xs font-bold text-white">Visa / Mastercard &amp; International</div>
                      <div class="text-[10px] text-white/40">Processed via PayChangu Gateway</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span v-if="financialData.summary?.channelStats?.card?.volume" class="text-xs font-bold text-emerald-400 block">
                      MWK {{ financialData.summary.channelStats.card.volume.toLocaleString() }}
                    </span>
                    <span class="text-[10px] text-white/50">
                      {{ financialData.summary?.channelStats?.card?.count ? `${financialData.summary.channelStats.card.count} txns` : 'Active' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Ledger & Transaction Table -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/10">
            <div class="relative w-full sm:w-80">
              <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                v-model="financialSearch"
                type="text"
                placeholder="Search transactions by name, email, ref..."
                class="w-full bg-night-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-amber-400/50"
              />
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                v-model="financialStatusFilter"
                class="bg-night-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed Only</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <button
                @click="exportToExcel"
                class="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <FileSpreadsheet :size="14" /> Download .csv
              </button>
            </div>
          </div>

          <!-- Transaction Table (Clean, Scrollable) -->
          <div class="rounded-2xl border border-white/10 bg-white/[0.01] overflow-hidden">
            <div class="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-[11px] text-white/40 md:hidden">
              <span>← Swipe ledger horizontally →</span>
              <span class="text-white/60 font-semibold">{{ filteredTransactions.length }} records</span>
            </div>
            <div class="overflow-x-auto scrollbar-thin">
              <table class="w-full min-w-[850px] text-left text-xs">
                <thead class="bg-white/[0.03] border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th class="px-4 py-3 min-w-[140px]">Date &amp; Time</th>
                    <th class="px-4 py-3 min-w-[180px]">Customer</th>
                    <th class="px-4 py-3 min-w-[150px]">Reference</th>
                    <th class="px-4 py-3 min-w-[120px]">Plan / Tier</th>
                    <th class="px-4 py-3 min-w-[110px]">Amount</th>
                    <th class="px-4 py-3 min-w-[120px]">Channel</th>
                    <th class="px-4 py-3 min-w-[90px] text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-if="filteredTransactions.length === 0">
                    <td colspan="7" class="py-12 text-center text-white/40">
                      No payment records found. As members subscribe to Plus, Gold, or VIP, transactions appear live here.
                    </td>
                  </tr>
                  <tr v-for="t in filteredTransactions" :key="t.id" class="hover:bg-white/[0.02] transition-colors">
                    <td class="px-4 py-3 text-white/50 whitespace-nowrap">{{ formatDate(t.date) }}</td>
                    <td class="px-4 py-3">
                      <div class="font-bold text-white">{{ t.customerName }}</div>
                      <div class="text-[11px] text-white/40 font-mono">{{ t.customerEmail || t.customerPhone }}</div>
                    </td>
                    <td class="px-4 py-3 font-mono text-[11px] text-white/60">{{ t.reference }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {{ t.tier }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-bold text-emerald-400">
                      MWK {{ Number(t.amount || 0).toLocaleString() }}
                    </td>
                    <td class="px-4 py-3 text-white/70">{{ t.paymentMethod }}</td>
                    <td class="px-4 py-3 text-right">
                      <span
                        class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        :class="t.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : (t.status === 'pending' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')"
                      >
                        {{ t.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. USER MANAGEMENT TAB -->
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
          <div class="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-[11px] text-white/40 md:hidden">
            <span>← Swipe table horizontally →</span>
            <span class="text-white/60 font-semibold">{{ userList.length }} users</span>
          </div>
          <div class="overflow-x-auto scrollbar-thin">
            <table class="w-full min-w-[800px] text-left text-xs">
              <thead class="bg-white/[0.03] border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                <tr>
                  <th class="px-4 py-3 min-w-[180px]">Member</th>
                  <th class="px-4 py-3 min-w-[200px]">Email / Phone</th>
                  <th class="px-4 py-3 min-w-[110px]">District</th>
                  <th class="px-4 py-3 min-w-[90px]">Tier</th>
                  <th class="px-4 py-3 min-w-[80px]">Role</th>
                  <th class="px-4 py-3 min-w-[90px]">Status</th>
                  <th class="px-4 py-3 min-w-[220px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="user in userList" :key="user._id" class="hover:bg-white/[0.02] transition-colors">
                  <td class="px-4 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 bg-night-800 flex items-center justify-center">
                        <img
                          v-if="user.photos && user.photos.length && user.photos[0]"
                          :src="mediaUrl(user.photos[0])"
                          class="w-full h-full object-cover"
                          alt=""
                          @error="$event.target.style.display='none'"
                        />
                        <span v-else class="text-xs font-bold text-amber-300">
                          {{ getInitials(user.name) }}
                        </span>
                      </div>
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
                    <div class="flex items-center justify-end gap-2">
                      <!-- 3-Tier Selector Dropdown -->
                      <select
                        :value="user.subscriptionTier || (user.isPremium ? 'gold' : 'free')"
                        @change="handleUpdateTier(user, $event.target.value)"
                        class="px-2 py-1 text-[11px] font-semibold rounded-lg border border-white/10 bg-night-900 text-white cursor-pointer focus:outline-none focus:border-amber-400"
                        title="Change Membership Tier"
                      >
                        <option value="free">Free</option>
                        <option value="plus">✦ Plus</option>
                        <option value="gold">★ Gold</option>
                        <option value="platinum">💎 VIP</option>
                      </select>

                      <!-- Toggle Verification (Gold Tick) -->
                      <button
                        @click="handleToggleVerify(user)"
                        class="px-2.5 py-1 text-[11px] rounded-lg border transition-colors cursor-pointer"
                        :class="user.isVerified
                          ? 'border-amber-400/40 text-amber-300 hover:bg-amber-400/20'
                          : 'border-white/10 text-white/60 hover:bg-white/10'"
                        :title="user.isVerified ? 'Revoke Gold Tick' : 'Grant Gold Tick'"
                      >
                        {{ user.isVerified ? 'Unverify' : 'Verify' }}
                      </button>

                      <!-- Toggle Ban -->
                      <button
                        @click="handleToggleBan(user)"
                        class="px-2.5 py-1 text-[11px] rounded-lg border transition-colors cursor-pointer"
                        :class="user.isBanned
                          ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          : 'border-rose-500/30 text-rose-300 hover:bg-rose-500/20'"
                      >
                        {{ user.isBanned ? 'Unban' : 'Ban' }}
                      </button>

                      <!-- Inspect User Details -->
                      <button
                        @click="inspectUser(user)"
                        class="px-2.5 py-1 text-[11px] rounded-lg border border-white/10 hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                        title="View Full Profile Dossier"
                      >
                        Inspect
                      </button>

                      <!-- Delete User Permanently (Admin Action) -->
                      <button
                        v-if="user.role !== 'admin'"
                        @click="handleDeleteUser(user)"
                        class="px-2 py-1 text-[11px] rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-1"
                        title="Permanently Delete User"
                      >
                        <Trash2 :size="12" /> Delete
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
                  <div class="h-56 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                    <img
                      v-if="item.userId?.photos && item.userId.photos.length && item.userId.photos[0]"
                      :src="mediaUrl(item.userId.photos[0])"
                      class="w-full h-full object-cover"
                      alt="Profile"
                      @error="$event.target.style.display='none'"
                    />
                    <div v-else class="text-center p-4 text-white/40">
                      <div class="text-2xl font-bold text-amber-300/70 mb-1">{{ getInitials(item.userId?.name) }}</div>
                      <span class="text-xs">No profile photo</span>
                    </div>
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

    <!-- 5. USER DOSSIER MODAL (Tinder/Bumble-Grade Inspector) -->
    <div
      v-if="selectedUser"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      @click.self="selectedUser = null"
    >
      <div class="w-full max-w-2xl bg-night-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div class="flex items-center gap-2">
            <div class="font-bold text-white text-base flex items-center gap-1.5">
              <span>{{ selectedUser.name || 'Unnamed Member' }}</span>
              <BadgeCheck v-if="selectedUser.isVerified" :size="16" class="text-cyan-400" />
            </div>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="{
                'bg-amber-400/20 text-amber-300 border border-amber-400/30': selectedUser.isPremium || selectedUser.subscriptionTier === 'gold',
                'bg-purple-400/20 text-purple-300 border border-purple-400/30': selectedUser.subscriptionTier === 'platinum',
                'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30': selectedUser.subscriptionTier === 'plus',
                'bg-white/10 text-white/60 border border-white/10': !selectedUser.isPremium && selectedUser.subscriptionTier === 'free'
              }"
            >
              {{ selectedUser.subscriptionTier || (selectedUser.isPremium ? 'Gold' : 'Free') }}
            </span>
          </div>
          <button @click="selectedUser = null" class="p-1 rounded-lg text-white/60 hover:text-white bg-white/5 cursor-pointer">
            <X :size="18" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <!-- Photos Gallery -->
          <div>
            <div class="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">Profile Photos</div>
            <div v-if="selectedUser.photos && selectedUser.photos.length" class="grid grid-cols-3 sm:grid-cols-4 gap-2">
              <img
                v-for="(photo, idx) in selectedUser.photos"
                :key="idx"
                :src="mediaUrl(photo)"
                class="w-full h-28 object-cover rounded-xl border border-white/10 bg-black/40"
                alt=""
              />
            </div>
            <div v-else class="text-white/40 italic p-3 bg-white/[0.02] rounded-xl border border-white/5">
              No photos uploaded yet.
            </div>
          </div>

          <!-- Basic Info Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-white/40 block">Email / Phone</span>
              <span class="text-white font-mono mt-0.5 block truncate">{{ selectedUser.email || selectedUser.phoneNumber || '—' }}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-white/40 block">District & Age</span>
              <span class="text-white font-medium mt-0.5 block">{{ selectedUser.district || 'Unspecified' }} · {{ selectedUser.age || '—' }} yrs</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-white/40 block">Gender & Role</span>
              <span class="text-white font-medium mt-0.5 block">{{ selectedUser.gender || '—' }} ({{ selectedUser.role || 'user' }})</span>
            </div>
          </div>

          <!-- Bio & Interests -->
          <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div>
              <span class="text-white/40 block text-[10px] uppercase font-bold tracking-wider mb-1">Bio</span>
              <p class="text-white/80 leading-relaxed">{{ selectedUser.bio || 'No bio written yet.' }}</p>
            </div>
            <div v-if="selectedUser.interests && selectedUser.interests.length">
              <span class="text-white/40 block text-[10px] uppercase font-bold tracking-wider mb-1.5">Interests</span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="interest in selectedUser.interests"
                  :key="interest"
                  class="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[11px]"
                >
                  {{ interest }}
                </span>
              </div>
            </div>
          </div>

          <!-- Account Meta -->
          <div class="grid grid-cols-2 gap-3 text-white/50">
            <div>Joined: <strong class="text-white/80">{{ formatDate(selectedUser.createdAt) }}</strong></div>
            <div>Last Active: <strong class="text-white/80">{{ formatDate(selectedUser.lastActive || selectedUser.updatedAt) }}</strong></div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-white/50 text-xs">Set Tier:</span>
            <select
              :value="selectedUser.subscriptionTier || (selectedUser.isPremium ? 'gold' : 'free')"
              @change="handleUpdateTier(selectedUser, $event.target.value)"
              class="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-white/10 bg-night-950 text-white cursor-pointer"
            >
              <option value="free">Free</option>
              <option value="plus">✦ Plus</option>
              <option value="gold">★ Gold</option>
              <option value="platinum">💎 VIP Platinum</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="handleToggleVerify(selectedUser)"
              class="px-3 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer"
              :class="selectedUser.isVerified
                ? 'border-amber-400/40 text-amber-300 hover:bg-amber-400/20'
                : 'border-white/10 text-white/70 hover:bg-white/10'"
            >
              {{ selectedUser.isVerified ? 'Revoke Gold Tick' : 'Grant Gold Tick' }}
            </button>
            <button
              @click="handleToggleBan(selectedUser)"
              class="px-3 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer"
              :class="selectedUser.isBanned
                ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-rose-500/30 text-rose-300 hover:bg-rose-500/20'"
            >
              {{ selectedUser.isBanned ? 'Unban Account' : 'Ban Account' }}
            </button>
            <button
              v-if="selectedUser.role !== 'admin'"
              @click="handleDeleteUser(selectedUser)"
              class="px-3 py-1.5 text-xs rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 :size="13" /> Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { adminService } from '@/services/adminService'
import { mediaUrl } from '@/utils/media'
import KondaniMark from '@/components/ui/KondaniMark.vue'
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  ShieldAlert,
  ShieldCheck,
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
  Trash2,
  FileSpreadsheet,
  Download,
  TrendingUp,
  CreditCard,
  Calendar,
  Heart
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const activeTab = ref('overview')
const isLoading = ref(false)

const stats = ref({})
const userList = ref([])
const userSearchQuery = ref('')
const userTierFilter = ref('')
const userBanFilter = ref('')
const selectedUser = ref(null)

const verificationList = ref([])
const verificationFilter = ref('pending')
const reportList = ref([])

// Matching Funnel
const funnelData = ref(null)
const funnelLoading = ref(false)

const fetchMatchingFunnel = async () => {
  funnelLoading.value = true
  try {
    funnelData.value = await adminService.getMatchingFunnel()
  } catch (err) {
    console.error('Failed to load matching funnel:', err)
  } finally {
    funnelLoading.value = false
  }
}

// Financial State & Analytics for Investors
const financialData = ref({ summary: {}, transactions: [] })
const financialSearch = ref('')
const financialStatusFilter = ref('')

const fetchFinancials = async () => {
  try {
    const res = await adminService.getRevenueAnalytics()
    if (res) financialData.value = res
  } catch (err) {
    console.error('Failed to load revenue analytics:', err)
  }
}

const filteredTransactions = computed(() => {
  let list = financialData.value.transactions || []
  if (financialStatusFilter.value) {
    list = list.filter(t => t.status === financialStatusFilter.value)
  }
  if (financialSearch.value.trim()) {
    const q = financialSearch.value.toLowerCase().trim()
    list = list.filter(t =>
      (t.customerName || '').toLowerCase().includes(q) ||
      (t.customerEmail || '').toLowerCase().includes(q) ||
      (t.customerPhone || '').toLowerCase().includes(q) ||
      (t.reference || '').toLowerCase().includes(q) ||
      (t.tier || '').toLowerCase().includes(q)
    )
  }
  return list
})

const exportToExcel = () => {
  const transactions = financialData.value.transactions || []
  const summary = financialData.value.summary || {}
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const lines = []

  // 1. BRAND & REPORT HEADER
  lines.push(['KONDANI ENTERPRISES - INVESTOR FINANCIAL & OPERATIONAL AUDIT REPORT'])
  lines.push(['Platform:', 'Kondani Dating & Social Discovery Platform (Malawi)'])
  lines.push(['Generated On:', now.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' })])
  lines.push(['Currency:', 'Malawian Kwacha (MWK)'])
  lines.push(['Payment Infrastructure:', 'PayChangu Mobile Money & Card Gateway (Airtel Money & TNM Mpamba)'])
  lines.push(['Report Type:', 'Executive Investor Due Diligence, Unit Economics & Audit Ledger'])
  lines.push([''])

  // 2. EXECUTIVE SCORECARD & UNIT ECONOMICS
  lines.push(['--- 1. EXECUTIVE KPI SCORECARD & UNIT ECONOMICS ---'])
  lines.push(['Metric', 'Value', 'Unit / Benchmark', 'Category'])
  lines.push(['Gross Merchandise Value (GMV - All-time)', summary.totalGrossRevenue || 0, 'MWK', 'Revenue'])
  lines.push(['Month-to-Date (MTD) Revenue', summary.mtdRevenue || 0, 'MWK', 'Revenue'])
  lines.push(['Month-over-Month (MoM) Growth', summary.momGrowthPercent || '0%', 'Growth Rate', 'Growth'])
  lines.push(['Total Registered Members', summary.totalUsers || 0, 'Users', 'Traction'])
  lines.push(['New Members This Month', summary.newUsersThisMonth || 0, 'Users', 'Growth'])
  lines.push(['New Members Today', summary.newUsersToday || 0, 'Users', 'Growth'])
  lines.push(['Total Paying Customers', summary.payingCustomersCount || 0, 'Customers', 'Monetization'])
  lines.push(['Active Paid Subscriptions', summary.activeSubscriptions || 0, 'Subscriptions', 'Monetization'])
  lines.push(['Free-to-Paid Conversion Rate', summary.conversionRate || '0.00%', 'Ratio', 'Unit Economics'])
  lines.push(['Average Revenue Per User (ARPU)', summary.arpu || 0, 'MWK / Total User', 'Unit Economics'])
  lines.push(['Average Revenue Per Paying User (ARPPU)', summary.arppu || 0, 'MWK / Paying User', 'Unit Economics'])
  lines.push(['Completed Payment Transactions', summary.completedCount || 0, 'Transactions', 'Volume'])
  lines.push([''])

  // 3. SUBSCRIPTION TIER BREAKDOWN
  const totalU = summary.totalUsers || 1
  const freeCount = summary.tierBreakdown?.free || 0
  const plusCount = summary.tierBreakdown?.plus || 0
  const goldCount = summary.tierBreakdown?.gold || 0
  const platinumCount = summary.tierBreakdown?.platinum || 0

  lines.push(['--- 2. SUBSCRIPTION TIERS & PRICING BREAKDOWN ---'])
  lines.push(['Tier Name', 'Price Model', 'Members / Subscribers', '% of User Base', 'Estimated Run-Rate (MWK)'])
  lines.push(['Kondani Free', 'MWK 0 (Freemium)', freeCount, `${((freeCount / totalU) * 100).toFixed(1)}%`, 0])
  lines.push(['Kondani Plus', 'MWK 600 / week', plusCount, `${((plusCount / totalU) * 100).toFixed(1)}%`, plusCount * 600])
  lines.push(['Kondani Gold', 'MWK 2,400 / month', goldCount, `${((goldCount / totalU) * 100).toFixed(1)}%`, goldCount * 2400])
  lines.push(['VIP Platinum', 'MWK 6,000 / year', platinumCount, `${((platinumCount / totalU) * 100).toFixed(1)}%`, platinumCount * 6000])
  lines.push([''])

  // 4. PAYMENT GATEWAY & OPERATOR CHANNELS
  lines.push(['--- 3. PAYMENT CHANNELS & SETTLEMENT BREAKDOWN ---'])
  lines.push(['Channel / Operator', 'Gateway', 'Total Volume (MWK)', 'Completed Transactions', 'Status'])
  const ch = summary.channelStats || {}
  lines.push(['Airtel Money (Malawi)', 'PayChangu Mobile API', ch.airtel?.volume || 0, ch.airtel?.count || 0, 'Active & Operational'])
  lines.push(['TNM Mpamba (Malawi)', 'PayChangu Mobile API', ch.tnm?.volume || 0, ch.tnm?.count || 0, 'Active & Operational'])
  lines.push(['Card / International (Visa/Mastercard)', 'PayChangu Gateway', ch.card?.volume || 0, ch.card?.count || 0, 'Active & Operational'])
  lines.push([''])

  // 5. NETWORK EFFECTS & ENGAGEMENT HEALTH
  lines.push(['--- 4. PLATFORM ENGAGEMENT & TRUST METRICS ---'])
  lines.push(['Metric', 'Count', 'Unit', 'Strategic Value'])
  lines.push(['Total Mutual Matches Formed', summary.engagement?.totalMatches || 0, 'Matches', 'Network Effect Density'])
  lines.push(['Direct Messages Exchanged', summary.engagement?.totalMessages || 0, 'Messages', 'Core User Retention'])
  lines.push(['Date Plans Initiated', summary.engagement?.totalPlans || 0, 'Plans', 'Real-world Dating Intent'])
  lines.push(['Gold-Tick Verified Profiles', summary.verifiedUsers || 0, 'Profiles', 'Trust & Anti-Catfish Safety'])
  lines.push(['Male Members', summary.genderStats?.men || 0, 'Users', 'Demographics'])
  lines.push(['Female Members', summary.genderStats?.women || 0, 'Users', 'Demographics'])
  lines.push([''])

  // 6. GEOGRAPHIC MARKET PENETRATION
  lines.push(['--- 5. GEOGRAPHIC FOOTPRINT (TOP DISTRICTS) ---'])
  lines.push(['District / Location', 'Registered Members', '% Share of User Base'])
  if (summary.topDistricts && summary.topDistricts.length > 0) {
    summary.topDistricts.forEach(d => {
      lines.push([d.name || 'Unspecified', d.count || 0, `${(((d.count || 0) / totalU) * 100).toFixed(1)}%`])
    })
  } else {
    lines.push(['National (Malawi)', totalU, '100%'])
  }
  lines.push([''])

  // 7. ITEMIZED TRANSACTION REVENUE LEDGER
  lines.push(['--- 6. ITEMIZED AUDIT TRANSACTION LEDGER ---'])
  const ledgerHeaders = [
    'Transaction Reference',
    'Gateway Reference',
    'Date & Time (UTC/Local)',
    'Customer Full Name',
    'Phone Number',
    'Email Address',
    'District / City',
    'Gender',
    'Verified Status',
    'Subscription Tier',
    'Package / Plan',
    'Gross Amount (MWK)',
    'Currency',
    'Payment Channel',
    'Payment Gateway',
    'Status'
  ]
  lines.push(ledgerHeaders)

  transactions.forEach(t => {
    lines.push([
      t.reference || '—',
      t.transactionId || '—',
      t.date ? new Date(t.date).toLocaleString('en-US') : '—',
      t.customerName || 'Kondani Member',
      t.customerPhone || '—',
      t.customerEmail || '—',
      t.district || 'Unspecified',
      t.gender || '—',
      t.isVerified ? 'Gold Tick Verified' : 'Standard',
      t.tier || 'Kondani Gold',
      t.planTitle || 'Premium Subscription',
      t.amount || 0,
      t.currency || 'MWK',
      t.paymentMethod || 'Mobile Money',
      'PayChangu',
      t.status || 'completed'
    ])
  })

  // Format CSV with proper quoting and escaping
  const csvContent = lines.map(row =>
    row.map(cell => {
      if (typeof cell === 'number') return cell
      return escapeCsv(cell)
    }).join(',')
  ).join('\r\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `kondani_investor_financial_ledger_${dateStr}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  success('Investor-grade financial ledger exported successfully!')
}

const refreshCurrentTab = async () => {
  isLoading.value = true
  try {
    if (activeTab.value === 'overview') {
      await fetchDashboardStats()
      await fetchMatchingFunnel()
    }
    else if (activeTab.value === 'financials') await fetchFinancials()
    else if (activeTab.value === 'users') await fetchUsers()
    else if (activeTab.value === 'verifications') await fetchVerifications(verificationFilter.value)
    else if (activeTab.value === 'reports') await fetchReports()
    success('Dashboard refreshed')
  } catch (e) {
    console.error('Refresh error:', e)
  } finally {
    isLoading.value = false
  }
}

const pendingVerifications = computed(() =>
  verificationList.value.filter(v => v.status === 'pending')
)

const tabs = computed(() => [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'financials', label: 'Financials & Excel', icon: TrendingUp },
  { id: 'users', label: 'User Directory', icon: Users, badge: stats.value.users?.total },
  { id: 'verifications', label: 'Photo Verifications', icon: BadgeCheck, badge: pendingVerifications.value.length || null },
  { id: 'reports', label: 'Safety & Reports', icon: ShieldAlert, badge: stats.value.reports?.pending || null }
])

const tierPercent = (tierKey) => {
  const total = financialData.value.summary?.totalUsers || stats.value.users?.total || 1
  const count = financialData.value.summary?.tierBreakdown?.[tierKey] ?? stats.value.users?.tiers?.[tierKey] ?? 0
  return Math.min(100, Math.round((count / total) * 100)) + '%'
}

const genderBarHeight = (genderKey) => {
  const total = stats.value.users?.total || 1
  const count = stats.value.users?.genders?.[genderKey] || 0
  const pct = Math.max(12, Math.round((count / total) * 100))
  return pct + '%'
}

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
      subscriptionTier: userTierFilter.value || undefined,
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

const inspectUser = (user) => {
  selectedUser.value = user
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

const handleUpdateTier = async (user, newTier) => {
  try {
    await adminService.updateUser(user._id, {
      subscriptionTier: newTier,
      isPremium: newTier !== 'free'
    })
    user.subscriptionTier = newTier
    user.isPremium = newTier !== 'free'
    const tierLabels = { free: 'Free', plus: 'Plus', gold: 'Gold', platinum: 'VIP Platinum' }
    success(`Updated ${user.name || 'user'} tier to ${tierLabels[newTier] || newTier}`)
    await fetchDashboardStats()
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

const handleToggleVerify = async (user) => {
  const newVerified = !user.isVerified
  try {
    await adminService.updateUser(user._id, {
      isVerified: newVerified
    })
    user.isVerified = newVerified
    success(`User ${user.name || ''} verification ${newVerified ? 'granted' : 'revoked'}`)
  } catch (err) {
    error('Failed to update verification status')
  }
}

const handleDeleteUser = async (user) => {
  if (user.role === 'admin') {
    error('Cannot delete an administrator account.')
    return
  }
  const name = user.name || user.email || user.phoneNumber || 'this user'
  if (!confirm(`Are you sure you want to PERMANENTLY delete "${name}"?\n\nThis will permanently erase their profile, photos, matches, and chats from the database and Cloudinary. This cannot be undone.`)) {
    return
  }

  try {
    await adminService.deleteUser(user._id || user.id)
    success(`User "${name}" has been permanently deleted.`)
    if (selectedUser.value && (selectedUser.value._id === user._id || selectedUser.value.id === user.id)) {
      selectedUser.value = null
    }
    await fetchUsers()
    await fetchDashboardStats()
  } catch (err) {
    console.error('Delete user error:', err)
    error(err.response?.data?.error || err.message || 'Failed to delete user.')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  success('Signed out of admin')
  router.push('/login')
}

onMounted(async () => {
  isLoading.value = true
  await fetchDashboardStats()
  await fetchMatchingFunnel()
  await fetchFinancials()
  await fetchUsers()
  await fetchVerifications('all')
  await fetchReports()
  isLoading.value = false
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
