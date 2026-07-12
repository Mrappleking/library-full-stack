import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GlobalThemeOverrides } from 'naive-ui'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  const lightTheme: GlobalThemeOverrides = {
    common: {
      primaryColor: '#5e6ad2',
      primaryColorHover: '#7170ff',
      primaryColorPressed: '#4f5bc4',
      primaryColorSuppl: '#7170ff',
      borderRadius: '8px',
      fontSize: '14px',
      textColor: '#333',
      textColorSecondary: '#666',
      textColorTertiary: '#999',
      placeholderColor: '#bbb',
      borderColor: '#e0e0e0',
      splitColor: '#f0f0f0',
      backgroundColor: '#ffffff',
      backgroundColorOverlay: '#ffffff',
    },
    Card: { borderRadius: '10px', paddingMedium: '20px 24px', color: '#ffffff' },
    DataTable: {
      borderRadius: '10px', thColor: '#f0f1f5', thFontWeight: '600',
      tdColorHover: 'rgba(94,106,210,0.04)',
    },
    Menu: { itemHeight: '44px', borderRadius: '8px' },
    Button: { borderRadius: '8px' },
    Input: { borderRadius: '8px' },
  }

  const darkTheme: GlobalThemeOverrides = {
    common: {
      primaryColor: '#7170ff',
      primaryColorHover: '#8584ff',
      primaryColorPressed: '#5e6ad2',
      primaryColorSuppl: '#8584ff',
      borderRadius: '8px',
      fontSize: '14px',
      textColor: '#e8e8e8',
      textColorSecondary: '#a0a0a0',
      textColorTertiary: '#666',
      placeholderColor: '#555',
      borderColor: '#333',
      splitColor: '#2a2a2a',
      backgroundColor: '#1a1a1a',
      backgroundColorOverlay: '#222',
    },
    Card: { borderRadius: '10px', paddingMedium: '20px 24px', color: '#222' },
    DataTable: {
      borderRadius: '10px', thColor: '#2a2a2a', thFontWeight: '600',
      tdColorHover: 'rgba(113,112,255,0.1)',
    },
    Menu: { itemHeight: '44px', borderRadius: '8px' },
    Button: { borderRadius: '8px' },
    Input: { borderRadius: '8px' },
  }

  const themeOverrides = computed(() => isDark.value ? darkTheme : lightTheme)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('library-theme', isDark.value ? 'dark' : 'light')
    updateHtmlClass()
  }

  const loadTheme = () => {
    const saved = localStorage.getItem('library-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = saved === 'dark' || (!saved && prefersDark)
    updateHtmlClass()
  }

  const updateHtmlClass = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    isDark,
    themeOverrides,
    toggleTheme,
    loadTheme,
  }
})