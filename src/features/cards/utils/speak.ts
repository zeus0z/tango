/**
 * speak.ts — Web Speech API helper for Japanese character audio playback.
 * Falls back silently if the browser does not support speechSynthesis.
 */

export function speakHiragana(character: string): void {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(character)
  u.lang = 'ja-JP'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
