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
      textColor1: '#000000',
      textColor2: '#000000',
      textColor3: '#1f2937',
      placeholderColor: '#6b7280',
      borderColor: '#e5e7eb',
      dividerColor: '#f3f4f6',
      baseColor: '#ffffff',
      bodyColor: '#f9fafb',
    },
    Card: { borderRadius: '16px', paddingMedium: '24px 28px', color: '#ffffff', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
    DataTable: {
      borderRadius: '12px', thColor: '#f8fafc', thFontWeight: '600',
      thTextColor: '#000000', tdTextColor: '#000000',
      thIconColor: '#9ca3af', thIconColorActive: '#4f46e5',
      tdColorHover: 'rgba(79,70,229,0.08)', tdColorStriped: 'rgba(0,0,0,0.02)',
      thColorSorting: '#eef2ff', tdColorSorting: 'rgba(79,70,229,0.04)',
      thPaddingMedium: '14px 16px', tdPaddingMedium: '14px 16px'
    },
    Menu: { itemHeight: '48px', borderRadius: '10px' },
    Button: { borderRadiusMedium: '10px', borderRadiusSmall: '8px', borderRadiusLarge: '12px' },
    Input: { borderRadiusMedium: '10px' },
    Select: { peers: { InternalSelection: { borderRadius: '10px' } } },
    Modal: { borderRadius: '16px' },
    Drawer: { borderRadius: '16px 0 0 16px' },
    Tabs: { tabGapSmall: '8px' }
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
      textColor1: '#f3f4f6',
      textColor2: '#d1d5db',
      textColor3: '#9ca3af',
      placeholderColor: '#6b7280',
      borderColor: '#374151',
      dividerColor: '#1f2937',
      baseColor: '#111827',
      bodyColor: '#0f172a',
      inputColor: '#1f2937',
    },
    Card: { borderRadius: '16px', paddingMedium: '24px 28px', color: '#1f2937', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)' },
    DataTable: {
      borderRadius: '12px', thColor: '#1f2937', thFontWeight: '600',
      thTextColor: '#f3f4f6', tdTextColor: '#d1d5db',
      thIconColor: '#6b7280', thIconColorActive: '#818cf8',
      tdColor: '#1f2937', tdColorHover: 'rgba(129,140,248,0.15)',
      tdColorStriped: 'rgba(255,255,255,0.02)',
      thColorSorting: '#374151', tdColorSorting: 'rgba(129,140,248,0.08)',
      thPaddingMedium: '14px 16px', tdPaddingMedium: '14px 16px'
    },
    Menu: { itemHeight: '48px', borderRadius: '10px' },
    Button: { borderRadiusMedium: '10px', borderRadiusSmall: '8px', borderRadiusLarge: '12px' },
    Input: { borderRadiusMedium: '10px' },
    Select: { peers: { InternalSelection: { borderRadius: '10px' } } },
    Modal: { borderRadius: '16px' },
    Drawer: { borderRadius: '16px 0 0 16px' },
    Tabs: { tabGapSmall: '8px' }
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