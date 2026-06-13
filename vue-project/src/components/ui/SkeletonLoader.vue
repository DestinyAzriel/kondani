<template>
  <div class="skeleton-loader" :class="typeClass">
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text short"></div>
      </div>
    </div>

    <div v-else-if="type === 'profile'" class="skeleton-profile">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-info">
        <div class="skeleton-line skeleton-name"></div>
        <div class="skeleton-line skeleton-location"></div>
      </div>
    </div>

    <div v-else-if="type === 'chat'" class="skeleton-chat">
      <div class="skeleton-avatar-small"></div>
      <div class="skeleton-message">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>

    <div v-else-if="type === 'swipe-card'" class="skeleton-swipe-card">
      <div class="skeleton-swipe-image"></div>
      <div class="skeleton-swipe-overlay">
        <div class="skeleton-line skeleton-name-large"></div>
        <div class="skeleton-line skeleton-location"></div>
      </div>
    </div>

    <div v-else class="skeleton-default">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['card', 'profile', 'chat', 'swipe-card', 'default'].includes(value)
  },
  count: {
    type: Number,
    default: 1
  }
})

const typeClass = computed(() => `skeleton-${props.type}`)
</script>

<style scoped>
.skeleton-loader {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-line,
.skeleton-image,
.skeleton-avatar,
.skeleton-avatar-small,
.skeleton-swipe-image {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  border-radius: 8px;
}

/* Card Skeleton */
.skeleton-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  border-radius: 0;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-line {
  height: 12px;
  margin-bottom: 12px;
  border-radius: 6px;
}

.skeleton-title {
  height: 20px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-text {
  width: 100%;
}

.skeleton-text.short {
  width: 70%;
}

/* Profile Skeleton */
.skeleton-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.skeleton-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-info {
  flex: 1;
}

.skeleton-name {
  height: 16px;
  width: 120px;
  margin-bottom: 8px;
}

.skeleton-location {
  height: 12px;
  width: 90px;
}

/* Chat Skeleton */
.skeleton-chat {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
}

.skeleton-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-message {
  flex: 1;
}

/* Swipe Card Skeleton */
.skeleton-swipe-card {
  position: relative;
  width: 100%;
  height: 70vh;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.skeleton-swipe-image {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.skeleton-swipe-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
}

.skeleton-name-large {
  height: 32px;
  width: 200px;
  margin-bottom: 12px;
}

/* Default Skeleton */
.skeleton-default {
  padding: 16px;
}
</style>
