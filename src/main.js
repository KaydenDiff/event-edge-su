import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from './plugins/axios'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.globalProperties.$axios = axios

app.mount('#app')
