import { createApp } from 'vue'
import App from './App.vue'

kintone.events.on('app.record.detail.show', async (event: KintoneEvent) => {
  const ttsAnchor = kintone.app.record.getSpaceElement('sp1') as HTMLElement
  const app = createApp(App)
  app.mount(ttsAnchor)
  return event
})
