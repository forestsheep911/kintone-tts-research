<template>
  <div>
    <button :class="zhManClass" @click="changeVoice($event, voiceConfig.zhMan.id)">
      {{ voiceConfig.zhMan.name }}
    </button>
    <button :class="zhWomenClass" @click="changeVoice($event, voiceConfig.zhWomen.id)">
      {{ voiceConfig.zhWomen.name }}
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

type prerequisite = {
  token: string
  region: string
}
export default {
  name: 'TtsButtonSet',
  data() {
    return {
      buttonPlay: {
        text: 'Play',
        class: 'success',
        disabled: false,
      },
      buttonPause: {
        text: 'Pause',
        class: 'disable',
        disabled: true,
      },
      buttonResume: {
        text: 'Resume',
        class: 'disable',
        disabled: true,
      },
      buttonDownload: {
        text: 'Download',
        class: 'info',
        disabled: false,
      },
      voiceConfig: {
        zhMan: {
          id: 1,
          name: '云泽',
          class: 'disable',
        },
        zhWomen: {
          id: 2,
          name: '晓晓',
          class: 'disable',
        },
      },
      tokenRegion: {} as prerequisite,
      player: {} as sdk.SpeakerAudioDestination,
      activeVoiceButtonId: 0,
    }
  },
  computed: {
    zhManClass() {
      return this.voiceConfig.zhMan.id === this.activeVoiceButtonId ? 'vigilant' : 'disable'
    },
    zhWomenClass() {
      return this.voiceConfig.zhWomen.id === this.activeVoiceButtonId ? 'vigilant' : 'disable'
    },
  },
  methods: {
    changeVoice(_: MouseEvent, o: number) {
      this.activeVoiceButtonId = o
    },
    async prepare(): Promise<prerequisite> {
      const authorizationEndpoint = 'http://localhost:3001/api/get-speech-token'
      try {
        const res = await axios.get(authorizationEndpoint)
        const { token, region } = res.data
        return { token, region }
      } catch (err) {
        window.console.log('authorization failed')
        throw err
      }
    },
    async play() {
      window.console.log('start play')
      if (!this.tokenRegion.token || !this.tokenRegion.region) {
        this.tokenRegion = await this.prepare()
      }
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.tokenRegion.token, this.tokenRegion.region)
      if (!speechConfig) {
        window.console.log('speechConfig is nothing,something go wrong!')
        return
      }
      // speechConfig.speechSynthesisVoiceName = 'Microsoft Server Speech Text to Speech Voice (zh-CN, YunzeNeural)'
      speechConfig.speechSynthesisVoiceName = 'Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)'
      // speechConfig.speechSynthesisVoiceName = 'Microsoft Server Speech Text to Speech Voice (ja-JP, MayuNeural)'
      // speechConfig.speechSynthesisVoiceName = 'Microsoft Server Speech Text to Speech Voice (ja-JP, NaokiNeural)'
      speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3
      this.player = new sdk.SpeakerAudioDestination()
      const audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player)
      let synthesizer: sdk.SpeechSynthesizer | undefined = new sdk.SpeechSynthesizer(speechConfig, audioConfig)
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
        synthesizer = undefined
      }
      function errCb(err: string) {
        window.console.log(err)
        synthesizer && synthesizer.close()
        synthesizer = undefined
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
      if (!this.tokenRegion.token || !this.tokenRegion.region) {
        this.tokenRegion = await this.prepare()
      }
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(this.tokenRegion.token, this.tokenRegion.region)
      if (!speechConfig) {
        window.console.log('speechConfig is nothing,something go wrong!')
        return
      }
      // speechConfig.speechSynthesisVoiceName = 'Microsoft Server Speech Text to Speech Voice (zh-CN, YunzeNeural)'
      speechConfig.speechSynthesisVoiceName = 'Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)'
      // speechConfig.speechSynthesisVoiceName = 'Microsoft Server Speech Text to Speech Voice (ja-JP, MayuNeural)'
      // speechConfig.speechSynthesisVoiceName = 'Microsoft Server Speech Text to Speech Voice (ja-JP, NaokiNeural)'
      speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3
      let synthesizer: sdk.SpeechSynthesizer | undefined = new sdk.SpeechSynthesizer(speechConfig, null)
      synthesizer.speakTextAsync(kintone.app.record.get().record.myspeech.value)
      this.buttonDownload.disabled = true
      this.buttonDownload.class = 'disable'
      this.buttonPlay.disabled = true
      this.buttonPlay.class = 'disable'
      synthesizer.synthesisCompleted = (_, e) => {
        synthesizer && synthesizer.close()
        synthesizer = undefined
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
    // console.log(kintone.app.record.get().record.myspeech.value)
  },
}
</script>

<style>
@import 'app.css';
</style>
