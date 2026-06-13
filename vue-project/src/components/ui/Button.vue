<template>
  <button 
    :class="[
      'relative inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses,
      sizeClasses,
      { 'w-full': fullWidth }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="absolute left-4">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <span :class="{ 'opacity-0': loading }">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200 focus:ring-emerald-500 border border-transparent'
    case 'secondary':
      return 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 focus:ring-emerald-500 border border-transparent'
    case 'outline':
      return 'bg-transparent text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500'
    case 'ghost':
      return 'bg-transparent text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-500 border border-transparent'
    default:
      return ''
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm rounded-lg'
    case 'md':
      return 'px-6 py-3 text-base rounded-xl'
    case 'lg':
      return 'px-8 py-4 text-lg rounded-2xl'
    default:
      return ''
  }
})
</script>
