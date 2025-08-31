import { createApp } from 'vue'
import App from './App.vue'

import { installToast } from "../src/util/useToast"

installToast()

createApp(App).mount('#app')
