import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
    // State with default values
    const distance = ref(25)
    const ageRange = ref([18, 30])
    const selectedRegion = ref('Whole Malawi')
    const notifications = ref({
        matches: true,
        messages: true,
        promotions: false
    })

    // Load from localStorage on initialization
    const stored = localStorage.getItem('kondani_settings')
    if (stored) {
        try {
            const parsed = JSON.parse(stored)
            // Only overwrite if value exists in storage, carefully to avoid losing defaults on partial saves
            if (parsed.distance !== undefined) distance.value = parsed.distance
            if (parsed.ageRange !== undefined) ageRange.value = parsed.ageRange
            if (parsed.selectedRegion !== undefined) selectedRegion.value = parsed.selectedRegion
            if (parsed.notifications !== undefined) notifications.value = parsed.notifications
        } catch (e) {
            console.error('Failed to parse settings from localStorage', e)
        }
    }

    // Watch for changes and save to localStorage
    watch(
        [distance, ageRange, selectedRegion, notifications],
        () => {
            const settingsToSave = {
                distance: distance.value,
                ageRange: ageRange.value,
                selectedRegion: selectedRegion.value,
                notifications: notifications.value
            }
            localStorage.setItem('kondani_settings', JSON.stringify(settingsToSave))
        },
        { deep: true }
    )

    return {
        distance,
        ageRange,
        selectedRegion,
        notifications
    }
})
