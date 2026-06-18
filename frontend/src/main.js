import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'
import { startSSE } from './utils/sse'

// start SSE connection (no-op in tests)
startSSE();

createApp(App).mount('#app')
