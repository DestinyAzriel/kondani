<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
    </label>
    <div class="relative">
      <input
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 placeholder:text-gray-400"
        :class="{ 'pl-10': icon, 'border-red-300 focus:border-red-500 focus:ring-red-200': error }"
      />
      <div v-if="icon" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <slot name="icon"></slot>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: [String, Number],
  error: String,
  hint: String,
  icon: Boolean
})

defineEmits(['update:modelValue'])
</script>
