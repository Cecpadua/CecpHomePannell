/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import store from './store';
import WebSocketPlugin from './plugins/websocket';



// Composables
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)

app.use(store)
app.use(WebSocketPlugin)

app.mount('#app')
