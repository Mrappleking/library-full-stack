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
      textColor1: '#333',
      textColor2: '#666',
      textColor3: '#999',
      placeholderColor: '#bbb',
      borderColor: '#e0e0e0',
      dividerColor: '#f0f0f0',
      baseColor: '#ffffff',
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
      textColor1: '#e8e8e8',
      textColor2: '#a0a0a0',
      textColor3: '#666',
      placeholderColor: '#555',
      borderColor: '#333',
      dividerColor: '#2a2a2a',
      baseColor: '#1a1a1a',
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