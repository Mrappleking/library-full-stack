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
    Button: { 
      borderRadiusMedium: '10px', borderRadiusSmall: '8px', borderRadiusLarge: '12px',
      color: '#374151', colorHover: '#4b5563', colorPressed: '#4b5563',
      textColor: '#e5e7eb', textColorHover: '#f9fafb', textColorPressed: '#d1d5db',
      border: '1px solid #4b5563', borderHover: '1px solid #6b7280', borderPressed: '1px solid #4b5563',
      colorPrimary: '#4f46e5', colorPrimaryHover: '#6366f1', colorPrimaryPressed: '#4338ca',
      textColorPrimary: '#ffffff', textColorPrimaryHover: '#ffffff', textColorPrimaryPressed: '#e5e7eb',
      borderPrimary: 'none',
      colorSuccess: '#166534', colorSuccessHover: '#15803d', colorSuccessPressed: '#14532d',
      textColorSuccess: '#34d399', textColorSuccessHover: '#6ee7b7', textColorSuccessPressed: '#2dd4bf',
      borderSuccess: '1px solid #166534', borderSuccessHover: '1px solid #15803d',
      colorError: '#7f1d1d', colorErrorHover: '#991b1b', colorErrorPressed: '#6b1717',
      textColorError: '#f87171', textColorErrorHover: '#fca5a5', textColorErrorPressed: '#f87171',
      borderError: '1px solid #7f1d1d', borderErrorHover: '1px solid #991b1b',
      colorWarning: '#78350f', colorWarningHover: '#92400e', colorWarningPressed: '#652b0e',
      textColorWarning: '#fbbf24', textColorWarningHover: '#fcd34d', textColorWarningPressed: '#fbbf24',
      borderWarning: '1px solid #78350f', borderWarningHover: '1px solid #92400e',
      colorInfo: '#1e40af', colorInfoHover: '#1d4ed8', colorInfoPressed: '#1e3a8a',
      textColorInfo: '#60a5fa', textColorInfoHover: '#93c5fd', textColorInfoPressed: '#60a5fa',
      borderInfo: '1px solid #1e40af', borderInfoHover: '1px solid #1d4ed8',
      colorGhost: 'transparent', colorGhostHover: 'rgba(255,255,255,0.08)', colorGhostPressed: 'rgba(255,255,255,0.12)',
      textColorGhost: '#e5e7eb', textColorGhostHover: '#f9fafb', textColorGhostPressed: '#d1d5db',
      borderGhost: 'none',
      colorText: 'transparent', colorTextHover: 'rgba(255,255,255,0.08)', colorTextPressed: 'rgba(255,255,255,0.12)',
      textColorText: '#e5e7eb', textColorTextHover: '#f9fafb', textColorTextPressed: '#d1d5db',
      borderText: 'none',
      colorSecondary: '#374151', colorSecondaryHover: '#4b5563', colorSecondaryPressed: '#4b5563',
      textColorSecondary: '#e5e7eb', textColorSecondaryHover: '#f9fafb', textColorSecondaryPressed: '#d1d5db',
      borderSecondary: '1px solid #4b5563', borderSecondaryHover: '1px solid #6b7280',
    },
    Input: { borderRadiusMedium: '10px', color: '#374151', placeholderTextColor: '#6b7280', borderColor: '#4b5563', borderColorHover: '#6b7280' },
    Select: { 
      peers: { 
        InternalSelection: { borderRadius: '10px' }
      }
    },
    Modal: { borderRadius: '16px', color: '#1f2937' },
    Drawer: { borderRadius: '16px 0 0 16px', color: '#1f2937' },
    Tabs: { tabGapSmall: '8px', tabColor: '#1f2937', tabColorActive: '#374151' },
    Switch: { railColor: '#4b5563', railColorActive: '#4338ca', boxColor: '#6b7280', boxColorActive: '#818cf8' },
    Badge: { color: '#374151', textColor: '#f9fafb' },
    Popconfirm: {
      iconColor: '#fbbf24',
      peers: {
        Popover: {
          borderRadius: '12px',
          color: '#374151',
          textColor: '#e5e7eb'
        }
      }
    },
    Tag: {
      borderRadius: '8px',
      color: '#374151',
      textColor: '#e5e7eb',
      colorInfo: '#374151',
      colorSuccess: '#166534',
      colorWarning: '#92400e',
      colorError: '#991b1b',
      textColorInfo: '#60a5fa',
      textColorSuccess: '#34d399',
      textColorWarning: '#fbbf24',
      textColorError: '#f87171',
    },
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