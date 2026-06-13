<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Test Page</h1>
    <p class="mb-4">If you can see this page, Vue Router is working correctly.</p>
    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
      <p>Current Route: {{ $route.path }}</p>
      <p>Route Name: {{ $route.name }}</p>
    </div>
    <router-link to="/" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
      Go to Home
    </router-link>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const $route = useRoute()
</script>