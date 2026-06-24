import { config } from '@vue/test-utils'
import { createApp } from 'vue'

// Mock Naive UI components globally
config.global.stubs = {
  'n-tag': { template: '<span><slot/></span>' },
  'n-button': { template: '<button><slot/></button>' },
  'n-data-table': { template: '<div><slot/></div>' },
  'n-card': { template: '<div><slot/></div>' },
  'n-statistic': { template: '<div/>' },
  'n-input': { template: '<input/>' },
  'n-empty': { template: '<div/>' },
  'n-config-provider': { template: '<div><slot/></div>' },
  'n-spin': { template: '<div><slot/></div>' },
  'n-alert': { template: '<div><slot/></div>' },
  'n-text': { template: '<span><slot/></span>' },
  'n-space': { template: '<div><slot/></div>' },
  'n-h1': { template: '<h1><slot/></h1>' },
  'n-descriptions': { template: '<div><slot/></div>' },
  'n-descriptions-item': { template: '<div><slot/></div>' },
  'n-modal': { template: '<div><slot/></div>' },
  'n-select': { template: '<select/>' },
}

// Suppress Vue warnings in tests
config.warnHandler = () => {}
