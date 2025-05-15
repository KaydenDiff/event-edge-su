import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import notificationsPlugin from './plugins/notifications'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(notificationsPlugin)

app.mount('#app')
