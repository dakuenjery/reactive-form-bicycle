import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import App from './App.vue'
import store from './store'

import 'element-plus/lib/theme-chalk/index.css'
import './styles.scss'

import 'virtual:windi.css'
import 'virtual:windi-devtools'

const app = createApp(App)

app.use(store)
app.use(ElementPlus, { size: 'mini' })

app.mount('#app')

export default app
