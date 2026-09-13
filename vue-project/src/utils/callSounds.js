// Web Audio API Ringtone generator for Voice & Video Calling
// Provides high quality outgoing dialing tones and incoming ring melodies without needing external audio files.

let audioCtx = null
let currentSource = null
let ringTimer = null

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      audioCtx = new AudioContext()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function playOutgoingDialing() {
  stopCallSounds()
  const ctx = getAudioContext()
  if (!ctx) return

  let isPlaying = true

  const playBeep = () => {
    if (!isPlaying) return
    try {
      const now = ctx.currentTime
      // Standard US/UK Dual Tone (440Hz + 480Hz)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.frequency.value = 440
      osc2.frequency.value = 480

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05)
      gain.gain.setValueAtTime(0.08, now + 1.2)
      gain.gain.linearRampToValueAtTime(0, now + 1.3)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 1.3)
      osc2.stop(now + 1.3)

      ringTimer = setTimeout(playBeep, 3500)
    } catch (e) {
      console.warn('Dialing tone error', e)
    }
  }

  playBeep()
}

export function playIncomingRing() {
  stopCallSounds()
  const ctx = getAudioContext()
  if (!ctx) return

  let isPlaying = true

  const playChime = () => {
    if (!isPlaying) return
    try {
      const now = ctx.currentTime
      // Harmonic chime (523Hz C5 -> 659Hz E5 -> 784Hz G5)
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq

        const start = now + (idx * 0.12)
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.12, start + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.5)
      })

      ringTimer = setTimeout(playChime, 2500)
    } catch (e) {
      console.warn('Incoming ring tone error', e)
    }
  }

  playChime()
}

export function playCallEnded() {
  stopCallSounds()
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.linearRampToValueAtTime(220, now + 0.3)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.3)
  } catch (e) {}
}

export function stopCallSounds() {
  if (ringTimer) {
    clearTimeout(ringTimer)
    ringTimer = null
  }
}
