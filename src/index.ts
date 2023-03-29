/* eslint no-console: ["error", { allow: ["log"] }] */
import { createApp } from 'vue'
// import axios from 'axios'
import App from './TtsButtonSet.vue'

kintone.events.on('app.record.detail.show', async (event: KintoneEvent) => {
  // const myContainer = kintone.app.getHeaderSpaceElement() as HTMLElement
  const btnContainer = kintone.app.record.getSpaceElement('sp1') as HTMLElement
  const app = createApp(App)
  app.mount(btnContainer)
  return event
})
