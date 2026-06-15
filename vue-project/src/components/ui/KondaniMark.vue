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
    <!-- exact Malawi silhouette from the SimpleMaps SVG, recoloured + merged -->
    <svg x="20" y="11" width="60" height="78" viewBox="300 55 405 915"
         preserveAspectRatio="xMidYMid meet" :fill="ink" stroke="none" v-html="mapInner"></svg>
    <!-- heart -->
    <path
      d="M50 52 c-5 -7 -15 -2 -15 5 c0 8 15 16 15 16 c0 0 15 -8 15 -16 c0 -7 -10 -12 -15 -5 Z"
      :fill="`url(#${gid})`"
    />
  </svg>
</template>

<script setup>
import rawSvg from '@/assets/Malawi map.svg?raw'

defineProps({
  size: { type: Number, default: 40 },
  rounded: { type: Number, default: 26 },
  ink: { type: String, default: '#08111a' }
})

const gid = 'kg-' + Math.random().toString(36).slice(2, 8)

// Pull the district paths out of the file, drop the XML/comment/outer <svg>,
// and remove the small Likoma island so the mark is one clean landmass.
const mapInner = rawSvg
  .replace(/<\?xml[\s\S]*?\?>/, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/<path[^>]*id="MWLK"[\s\S]*?<\/path>/, '')
  .replace(/\sid="[^"]*"/g, '')
  .replace(/\sname="[^"]*"/g, '')
</script>
