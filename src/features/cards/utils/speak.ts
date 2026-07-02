/**
 * speak.ts — kana pronunciation playback.
 *
 * Primary path: static, PWA-precached MP3 clips generated once via
 * `pnpm generate:audio` (see scripts/generate-kana-audio.mjs), keyed by
 * romaji so hiragana and katakana share the same file per sound.
 *
 * Fallback: Web Speech API, used only when a clip is missing or fails to
 * play (e.g. a sound not yet in scripts/kana-sounds.json) — never the
 * primary path.
 */

let currentAudio: HTMLAudioElement | null = null

function fallbackSpeak(character: string): void {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(character)
  u.lang = 'ja-JP'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

export function playKana(character: string, romaji: string): void {
  currentAudio?.pause()

  const audio = new Audio(`/audio/kana/${romaji}.mp3`)
  currentAudio = audio
  audio.addEventListener('error', () => fallbackSpeak(character))
  audio.play().catch(() => fallbackSpeak(character))
}
