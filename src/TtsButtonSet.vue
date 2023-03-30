<template>
  <div>
    <button :class="enWomenClass" @click="changeVoice($event, voiceConfig.enWomen)">
      {{ voiceConfig.enWomen.name }}
    </button>
    <button :class="enManClass" @click="changeVoice($event, voiceConfig.enMan)">
      {{ voiceConfig.enMan.name }}
    </button>
    <button :class="jpWomenClass" @click="changeVoice($event, voiceConfig.jpWomen)">
      {{ voiceConfig.jpWomen.name }}
    </button>
    <button :class="jpManClass" @click="changeVoice($event, voiceConfig.jpMan)">
      {{ voiceConfig.jpMan.name }}
    </button>
    <button :class="zhWomenClass" @click="changeVoice($event, voiceConfig.zhWomen)">
      {{ voiceConfig.zhWomen.name }}
    </button>
    <button :class="zhManClass" @click="changeVoice($event, voiceConfig.zhMan)">
      {{ voiceConfig.zhMan.name }}
    </button>
  </div>
  <div>
    <button :class="buttonPlay.class" :disabled="buttonPlay.disabled" @click="play">{{ buttonPlay.text }}</button>
    <button :class="buttonPause.class" :disabled="buttonPause.disabled" @click="pause">{{ buttonPause.text }}</button>
    <button :class="buttonResume.class" :disabled="buttonResume.disabled" @click="resume">
      {{ buttonResume.text }}
    </button>
    <button :class="buttonDownload.class" :disabled="buttonDownload.disabled" @click="download">
      {{ buttonDownload.text }}
    </button>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const speechKey = ''
const speechRegion = 'eastus'
type MsVoice = {
  id: number
  name: string
  cloudFullName: string
  class: string
}

async function getToken(): Promise<string> {
  const headers = {
    headers: {
      'Ocp-Apim-Subscription-Key': speechKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
  try {
    const tokenRes = await axios.post(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      headers,
    )
    return tokenRes.data as string
  } catch (err) {
    window.console.log('authorization failed')
    throw err
  }
}

export default {
  name: 'TtsButtonSet',
  data() {
    return {
      buttonPlay: {
        text: '▶️ Play',
        class: 'success',
        disabled: false,
      },
      buttonPause: {
        text: '⏸️ Pause',
        class: 'disable',
        disabled: true,
      },
      buttonResume: {
        text: '⏯️ Resume',
        class: 'disable',
        disabled: true,
      },
      buttonDownload: {
        text: '💾 Download',
        class: 'info',
        disabled: false,
      },
      voiceConfig: {
        zhMan: {
          id: 1,
          name: '普通话：云泽',
          cloudFullName: 'Microsoft Server Speech Text to Speech Voice (zh-CN, YunzeNeural)',
          class: 'disable',
        } as MsVoice,
        zhWomen: {
          id: 2,
          name: '普通话：晓晓',
          cloudFullName: 'Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)',
          class: 'disable',
        } as MsVoice,
        jpMan: {
          id: 3,
          name: '日本語：直樹',
          cloudFullName: 'Microsoft Server Speech Text to Speech Voice (ja-JP, NaokiNeural)',
          class: 'disable',
        } as MsVoice,
        jpWomen: {
          id: 4,
          name: '日本語：真弓',
          cloudFullName: 'Microsoft Server Speech Text to Speech Voice (ja-JP, MayuNeural)',
          class: 'disable',
        } as MsVoice,
        enWomen: {
          id: 5,
          name: 'english: Aria',
          cloudFullName: 'Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)',
          class: 'disable',
        } as MsVoice,
        enMan: {
          id: 6,
          name: 'english: Guy',
          cloudFullName: 'Microsoft Server Speech Text to Speech Voice (en-US, GuyNeural)',
          class: 'disable',
        } as MsVoice,
      },
      token: undefined as undefined | string,
      player: {} as sdk.SpeakerAudioDestination,
      activeVoice: {} as MsVoice,
    }
  },
  computed: {
    enManClass() {
      return this.voiceConfig.enMan.id === this.activeVoice.id ? 'vigilant' : 'disable'
    },
    enWomenClass() {
      return this.voiceConfig.enWomen.id === this.activeVoice.id ? 'vigilant' : 'disable'
    },
    zhManClass() {
      return this.voiceConfig.zhMan.id === this.activeVoice.id ? 'vigilant' : 'disable'
    },
    zhWomenClass() {
      return this.voiceConfig.zhWomen.id === this.activeVoice.id ? 'vigilant' : 'disable'
    },
    jpManClass() {
      return this.voiceConfig.jpMan.id === this.activeVoice.id ? 'vigilant' : 'disable'
    },
    jpWomenClass() {
      return this.voiceConfig.jpWomen.id === this.activeVoice.id ? 'vigilant' : 'disable'
    },
  },
  beforeMount() {
    this.activeVoice = this.voiceConfig.enWomen
  },
  methods: {
    changeVoice(_: MouseEvent, o: MsVoice) {
      this.activeVoice = o
    },
    async speechPrepare(type: 'play' | 'download'): Promise<sdk.SpeechSynthesizer> {
      if (!this.token) {
        this.token = await getToken()
      }
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.token, speechRegion)
      speechConfig.speechSynthesisVoiceName = this.activeVoice.cloudFullName
      speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3
      this.player = new sdk.SpeakerAudioDestination()
      const audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player)
      if (type === 'play') return new sdk.SpeechSynthesizer(speechConfig, audioConfig)
      if (type === 'download') return new sdk.SpeechSynthesizer(speechConfig, null)
      return new sdk.SpeechSynthesizer(speechConfig, audioConfig)
    },
    async play() {
      window.console.log('start play')
      const synthesizer = await this.speechPrepare('play')
      this.player.onAudioStart = () => {
        window.console.log('Audio Start')
      }
      this.player.onAudioEnd = () => {
        window.console.log('Audio End')
        this.buttonPlay.disabled = false
        this.buttonPlay.class = 'success'
        this.buttonPause.disabled = true
        this.buttonPause.class = 'disable'
        this.buttonResume.disabled = true
        this.buttonResume.class = 'disable'
        this.buttonDownload.disabled = false
        this.buttonDownload.class = 'info'
      }
      function completeCb() {
        synthesizer && synthesizer.close()
      }
      function errCb() {
        synthesizer && synthesizer.close()
      }
      synthesizer.speakTextAsync(kintone.app.record.get().record.myspeech.value, completeCb, errCb)
      synthesizer.synthesisStarted = () => {
        this.buttonPause.disabled = false
        this.buttonPause.class = 'danger'
      }
      synthesizer.SynthesisCanceled = () => {
        this.buttonPause.disabled = true
        this.buttonPause.class = 'disabe'
        this.buttonResume.disabled = true
        this.buttonResume.class = 'disable'
        this.buttonDownload.disabled = false
        this.buttonDownload.class = 'info'
      }
      this.buttonPlay.disabled = true
      this.buttonPlay.class = 'disable'
    },
    pause() {
      this.player.pause()
      this.buttonPause.disabled = true
      this.buttonPause.class = 'disable'
      this.buttonResume.disabled = false
      this.buttonResume.class = 'success'
    },
    resume() {
      this.player.resume()
      this.buttonPause.disabled = false
      this.buttonPause.class = 'danger'
      this.buttonResume.disabled = true
      this.buttonResume.class = 'disable'
    },
    async download() {
      window.console.log('start download')
      const synthesizer = await this.speechPrepare('download')
      synthesizer.speakTextAsync(kintone.app.record.get().record.myspeech.value)
      this.buttonDownload.disabled = true
      this.buttonDownload.class = 'disable'
      this.buttonPlay.disabled = true
      this.buttonPlay.class = 'disable'
      synthesizer.synthesisCompleted = (_, e) => {
        synthesizer && synthesizer.close()
        const a = document.createElement('a')
        const url = window.URL.createObjectURL(new Blob([e.result.audioData]))
        a.href = url
        a.download = 'kintone-voice.mp3'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }, 0)
        this.buttonDownload.disabled = false
        this.buttonDownload.class = 'info'
        this.buttonPlay.disabled = false
        this.buttonPlay.class = 'success'
      }

      synthesizer.SynthesisCanceled = () => {
        window.console.log('SynthesisCanceled')
        this.buttonDownload.disabled = false
        this.buttonDownload.class = 'info'
        this.buttonPause.disabled = true
        this.buttonPause.class = 'disable'
        this.buttonResume.disabled = true
        this.buttonResume.class = 'disable'
      }
    },
  },
}
</script>

<style>
@import 'app.css';
</style>
