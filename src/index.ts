import { createApp } from 'vue'
import App from './TtsButtonSet.vue'

kintone.events.on('app.record.detail.show', async (event: KintoneEvent) => {
  const btnContainer = kintone.app.record.getSpaceElement('sp1') as HTMLElement
  const app = createApp(App)
  app.mount(btnContainer)
  return event
})
