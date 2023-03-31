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
    <button :class="buttonPlay.active.class" :disabled="buttonPlay.active.disabled" @click="play">
      {{ buttonPlay.active.text }}
    </button>
    <button :class="buttonStop.active.class" :disabled="buttonStop.active.disabled" @click="stop">
      {{ buttonStop.active.text }}
    </button>
    <button :class="buttonDownload.class" :disabled="buttonDownload.disabled" @click="download">
      {{ buttonDownload.text }}
    </button>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const speechKey = 'ea964e382b384a95840ae2ba36ccc427'
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
        play: {
          text: '▶️ Play',
          class: 'success',
          disabled: false,
          status: 'play',
        },
        played: {
          text: '▶️ Play',
          class: 'success',
          disabled: true,
          status: 'played',
        },
        pause: {
          text: '⏸️ Pause',
          class: 'danger',
          disabled: false,
          status: 'pause',
        },
        resume: {
          text: '⏯️ Resume',
          class: 'success',
          disabled: false,
          status: 'resume',
        },
        active: {
          text: '▶️ Play',
          class: 'success',
          disabled: false,
          status: 'play',
        },
      },
      buttonStop: {
        enable: {
          text: '⏹️ Stop',
          class: 'danger',
          disabled: false,
        },
        disable: {
          text: '⏹️ Stop',
          class: 'disable',
          disabled: true,
        },
        active: {
          text: '⏹️ Stop',
          class: 'disable',
          disabled: true,
        },
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
          name: 'English: Aria',
          cloudFullName: 'Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)',
          class: 'disable',
        } as MsVoice,
        enMan: {
          id: 6,
          name: 'English: Guy',
          cloudFullName: 'Microsoft Server Speech Text to Speech Voice (en-US, GuyNeural)',
          class: 'disable',
        } as MsVoice,
      },
      token: undefined as undefined | string,
      synthesizer: {} as sdk.SpeechSynthesizer,
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
      if (type === 'play') {
        this.player = new sdk.SpeakerAudioDestination()
        const audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player)
        return new sdk.SpeechSynthesizer(speechConfig, audioConfig)
      }
      return new sdk.SpeechSynthesizer(speechConfig, null)
    },
    async play() {
      if (this.buttonPlay.active.status === 'play') {
        // window.console.log('start play')
        this.buttonPlay.active = this.buttonPlay.played
        this.buttonPlay.active.status = 'played'
        const synthesizer = await this.speechPrepare('play')
        this.synthesizer = synthesizer
        this.player.onAudioStart = () => {
          // window.console.log('Audio Start')
          this.buttonPlay.active = this.buttonPlay.pause
          this.buttonStop.active = this.buttonStop.enable
        }
        this.player.onAudioEnd = () => {
          // window.console.log('Audio End')
          this.buttonPlay.active = this.buttonPlay.play
          this.buttonStop.active = this.buttonStop.disable
        }
        synthesizer.speakTextAsync(
          kintone.app.record.get().record.myspeech.value,
          () => {
            // window.console.log('synthesize completed')
            synthesizer && synthesizer.close()
          },
          () => {
            synthesizer && synthesizer.close()
          },
        )
        // synthesizer.synthesisStarted = () => {}
        // synthesizer.SynthesisCanceled = () => {}
      } else if (this.buttonPlay.active.status === 'pause') {
        this.player.pause()
        this.buttonPlay.active = this.buttonPlay.resume
      } else {
        // status must be resume
        this.player.resume()
        this.buttonPlay.active = this.buttonPlay.pause
      }
    },
    stop() {
      // window.console.log('Audio Force Stop')
      this.buttonPlay.active = this.buttonPlay.play
      this.buttonStop.active = this.buttonStop.disable
      this.player.internalAudio.currentTime = this.player.internalAudio.duration
    },
    async download() {
      // window.console.log('start download')
      const synthesizer = await this.speechPrepare('download')
      synthesizer.speakTextAsync(kintone.app.record.get().record.myspeech.value)
      this.buttonDownload.disabled = true
      this.buttonDownload.class = 'disable'
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
      }
      // synthesizer.SynthesisCanceled = () => {}
    },
  },
}
</script>

<style></style>
