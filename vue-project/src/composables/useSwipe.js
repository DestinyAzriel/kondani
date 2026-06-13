// src/composables/useSwipe.js
import { ref, computed } from 'vue'

export function useSwipe(intents) {
  const currentIndex = ref(0)
  const isDragging = ref(false)
  const dragStart = ref({ x: 0, y: 0 })
  const dragCurrent = ref({ x: 0, y: 0 })
  const direction = ref(null) // 'left' or 'right'
  const isAnimating = ref(false)

  const currentIntent = computed(() => {
    return intents.value[currentIndex.value] || null
  })

  const visibleIntents = computed(() => {
    return intents.value.slice(currentIndex.value, currentIndex.value + 3)
  })

  const resetState = () => {
    isDragging.value = false
    dragStart.value = { x: 0, y: 0 }
    dragCurrent.value = { x: 0, y: 0 }
    direction.value = null
  }

  const startDrag = (clientX, clientY) => {
    if (isAnimating.value || !currentIntent.value) return
    isDragging.value = true
    dragStart.value = { x: clientX, y: clientY }
    dragCurrent.value = { x: clientX, y: clientY }
  }

  const onDrag = (clientX, clientY) => {
    if (!isDragging.value) return
    dragCurrent.value = { x: clientX, y: clientY }
    
    const deltaX = dragCurrent.value.x - dragStart.value.x
    if (Math.abs(deltaX) > 10) {
      direction.value = deltaX > 0 ? 'right' : 'left'
    }
  }

  const endDrag = () => {
    if (!isDragging.value) return
    
    const deltaX = dragCurrent.value.x - dragStart.value.x
    const distance = Math.abs(deltaX)
    
    if (distance > 100 && currentIntent.value) {
      // Trigger action
      isAnimating.value = true
      const action = direction.value === 'right' ? 'join' : 'pass'
      resetState()
      return action
    }
    
    resetState()
    return null
  }

  const nextCard = () => {
    if (currentIndex.value < intents.value.length - 1) {
      currentIndex.value++
    }
    isAnimating.value = false
  }

  const getCardStyle = (index) => {
    if (index === 0 && isDragging.value) {
      const deltaX = dragCurrent.value.x - dragStart.value.x
      const deltaY = dragCurrent.value.y - dragStart.value.y
      const rotate = deltaX * 0.1
      const opacity = 1 - Math.abs(deltaX) / 300
      
      return {
        transform: `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`,
        opacity: Math.max(0.5, opacity)
      }
    } else if (index === 0 && isAnimating.value) {
      const dir = direction.value === 'right' ? 1 : -1
      return {
        transform: `translate(${dir * 500}px, 0) rotate(${dir * 30}deg)`,
        opacity: 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }
    } else {
      // Stacked cards
      const offset = index * 10
      return {
        transform: `translate(0, ${offset}px) scale(${1 - index * 0.05})`,
        zIndex: 10 - index
      }
    }
  }

  return {
    currentIndex,
    isDragging,
    direction,
    isAnimating,
    currentIntent,
    visibleIntents,
    startDrag,
    onDrag,
    endDrag,
    nextCard,
    getCardStyle
  }
}