<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" role="img" aria-label="Kondani">
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffd98a" />
        <stop offset="1" stop-color="#f4b740" />
      </linearGradient>
    </defs>
    <!-- gold app-icon tile -->
    <rect x="0" y="0" width="100" height="100" :rx="rounded" :fill="`url(#${gid})`" />
    <!-- Malawi silhouette (dark) + heart (gold) centred in the tile -->
    <g transform="translate(33,16) scale(0.47)">
      <path
        d="M30 6 C36 16 33 28 40 38 C48 50 43 60 50 72 C44 80 47 92 41 100 C47 112 55 120 50 134 C46 146 38 150 33 150 C28 142 26 130 24 118 C20 104 16 90 19 76 C16 62 21 48 22 34 C24 22 25 12 30 6 Z"
        :fill="ink"
      />
      <path
        d="M34 72 c-4 -5 -12 -2 -12 4 c0 6 12 12 12 12 c0 0 12 -6 12 -12 c0 -6 -8 -9 -12 -4 Z"
        :fill="`url(#${gid})`"
      />
    </g>
  </svg>
</template>

<script setup>
const props = defineProps({
  size: { type: Number, default: 40 },
  rounded: { type: Number, default: 26 },
  ink: { type: String, default: '#08111a' }
})
const gid = 'kg-' + Math.random().toString(36).slice(2, 8)
</script>
