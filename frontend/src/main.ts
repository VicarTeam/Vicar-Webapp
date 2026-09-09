import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/styles/index.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './app/router.ts'
import {Backend} from "@/libs/backend.ts";
import EventBus from "@/libs/event-bus.ts";
import {installAgentBridge, isAgentMode, isLiveAgentMode, startLiveBridge} from "@/libs/agent/agent-bridge.ts";

const app = createApp(App)

app.use(createPinia())
app.use(router)

function initializeDocumentEvents() {
  window.onbeforeunload = function () {
    EventBus.$emit("closing");
  };
}

initializeDocumentEvents();

(async () => {
  await Backend.initAsync()

  app.mount('#app')

  if (isAgentMode()) {
    installAgentBridge(router)
    if (isLiveAgentMode()) {
      startLiveBridge()
    }
  }
})()

