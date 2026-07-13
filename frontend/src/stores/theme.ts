import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GlobalThemeOverrides } from 'naive-ui'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  const lightTheme: GlobalThemeOverrides = {
    common: {
      primaryColor: '#4f46e5',
      primaryColorHover: '#6366f1',
      primaryColorPressed: '#4338ca',
      primaryColorSuppl: '#818cf8',
      infoColor: '#3b82f6',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
      borderRadius: '12px',
      borderRadiusSmall: '8px',
      fontSize: '14px',
      textColor1: '#111827',
      textColor2: '#374151',
      textColor3: '#6b7280',
      placeholderColor: '#9ca3af',
      borderColor: '#e5e7eb',
      dividerColor: '#f3f4f6',
      baseColor: '#ffffff',
      bodyColor: '#f3f4f6',
      inputColor: '#ffffff',
      cardColor: '#ffffff',
    },
    Card: { borderRadius: '16px', paddingMedium: '24px 28px', color: '#ffffff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
    DataTable: {
      borderRadius: '12px', thColor: '#f9fafb', thFontWeight: '600',
      thTextColor: '#111827', tdTextColor: '#374151',
      thIconColor: '#9ca3af', thIconColorActive: '#4f46e5',
      tdColorHover: 'rgba(79,70,229,0.08)', tdColorStriped: 'rgba(0,0,0,0.03)',
      thColorSorting: '#eef2ff', tdColorSorting: 'rgba(79,70,229,0.04)',
      thPaddingMedium: '14px 16px', tdPaddingMedium: '14px 16px'
    },
    Menu: { itemHeight: '48px', borderRadius: '10px', itemColor: '#ffffff', itemColorHover: '#f3f4f6', itemColorActive: '#eef2ff', itemTextColor: '#374151', itemTextColorHover: '#111827', itemTextColorActive: '#4f46e5' },
    Button: { borderRadiusMedium: '10px', borderRadiusSmall: '8px', borderRadiusLarge: '12px' },
    Input: { borderRadiusMedium: '10px', color: '#ffffff', placeholderTextColor: '#9ca3af' },
    Select: { peers: { InternalSelection: { borderRadius: '10px', color: '#ffffff' } } },
    Modal: { borderRadius: '16px', color: '#ffffff' },
    Drawer: { borderRadius: '16px 0 0 16px', color: '#ffffff' },
    Tabs: { tabGapSmall: '8px', tabColor: '#ffffff', tabColorActive: '#ffffff' },
    Switch: { railColor: '#e5e7eb', railColorActive: '#c7d2fe', boxColor: '#ffffff', boxColorActive: '#4f46e5' },
    Badge: { color: '#ffffff', textColor: '#111827' },
    Tag: { borderRadius: '8px', color: '#f3f4f6', textColor: '#374151' },
  }

  const darkTheme: GlobalThemeOverrides = {
    common: {
      primaryColor: '#818cf8',
      primaryColorHover: '#a5b4fc',
      primaryColorPressed: '#6366f1',
      primaryColorSuppl: '#c7d2fe',
      infoColor: '#60a5fa',
      successColor: '#34d399',
      warningColor: '#fbbf24',
      errorColor: '#f87171',
      borderRadius: '12px',
      borderRadiusSmall: '8px',
      fontSize: '14px',
      textColor1: '#f9fafb',
      textColor2: '#e5e7eb',
      textColor3: '#d1d5db',
      placeholderColor: '#6b7280',
      borderColor: '#374151',
      dividerColor: '#374151',
      baseColor: '#1f2937',
      bodyColor: '#111827',
      inputColor: '#374151',
      cardColor: '#1f2937',
    },
    Card: { borderRadius: '16px', paddingMedium: '24px 28px', color: '#1f2937', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)' },
    DataTable: {
      borderRadius: '12px', thColor: '#374151', thFontWeight: '600',
      thTextColor: '#f9fafb', tdTextColor: '#e5e7eb',
      thIconColor: '#6b7280', thIconColorActive: '#818cf8',
      tdColor: '#1f2937', tdColorHover: 'rgba(129,140,248,0.15)',
      tdColorStriped: 'rgba(255,255,255,0.03)',
      thColorSorting: '#4b5563', tdColorSorting: 'rgba(129,140,248,0.1)',
      thPaddingMedium: '14px 16px', tdPaddingMedium: '14px 16px'
    },
    Menu: { itemHeight: '48px', borderRadius: '10px', itemColor: '#1f2937', itemColorHover: '#374151', itemColorActive: '#4b5563', itemTextColor: '#e5e7eb', itemTextColorHover: '#f9fafb', itemTextColorActive: '#818cf8' },
    Button: { borderRadiusMedium: '10px', borderRadiusSmall: '8px', borderRadiusLarge: '12px' },
    Input: { borderRadiusMedium: '10px', color: '#374151', placeholderTextColor: '#6b7280', borderColor: '#4b5563', borderColorHover: '#6b7280' },
    Select: { peers: { InternalSelection: { borderRadius: '10px', color: '#374151' } } },
    Modal: { borderRadius: '16px', color: '#1f2937' },
    Drawer: { borderRadius: '16px 0 0 16px', color: '#1f2937' },
    Tabs: { tabGapSmall: '8px', tabColor: '#1f2937', tabColorActive: '#374151' },
    Switch: { railColor: '#4b5563', railColorActive: '#4338ca', boxColor: '#6b7280', boxColorActive: '#818cf8' },
    Badge: { color: '#374151', textColor: '#f9fafb' },
    Tag: { borderRadius: '8px', color: '#374151', textColor: '#e5e7eb' },
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