import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { setupVueErrorHandler } from './utils/errorMonitor'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const themeStore = useThemeStore()
themeStore.loadTheme()

setupVueErrorHandler(app)

app.use(router)
app.use(naive)
app.mount('#app')
