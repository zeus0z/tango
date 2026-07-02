import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { playKana } from './speak'
import { HIRAGANA } from '@/lib/constants/hiragana'
import kanaSounds from '../../../../scripts/kana-sounds.json'

class FakeAudio {
  src: string
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  addEventListener = vi.fn()
  constructor(src: string) {
    this.src = src
  }
}

describe('playKana', () => {
  let instances: FakeAudio[]

  beforeEach(() => {
    instances = []
    vi.stubGlobal(
      'Audio',
      vi.fn().mockImplementation(function (src: string) {
        const instance = new FakeAudio(src)
        instances.push(instance)
        return instance
      }),
    )
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak: vi.fn() })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      vi.fn().mockImplementation(function (text: string) {
        return { text, lang: '', rate: 1 }
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('plays the mp3 keyed by romaji', () => {
    playKana('か', 'ka')
    expect(instances).toHaveLength(1)
    expect(instances[0].src).toBe('/audio/kana/ka.mp3')
    expect(instances[0].play).toHaveBeenCalled()
  })

  it('pauses the in-flight clip before playing the next one', () => {
    playKana('か', 'ka')
    playKana('き', 'ki')
    expect(instances[0].pause).toHaveBeenCalled()
    expect(instances[1].src).toBe('/audio/kana/ki.mp3')
  })

  it('falls back to speechSynthesis when play() rejects', async () => {
    instances = []
    vi.stubGlobal(
      'Audio',
      vi.fn().mockImplementation(function (src: string) {
        const instance = new FakeAudio(src)
        instance.play = vi.fn().mockRejectedValue(new Error('blocked'))
        instances.push(instance)
        return instance
      }),
    )

    playKana('か', 'ka')
    await vi.waitFor(() => {
      expect(window.speechSynthesis.speak).toHaveBeenCalled()
    })
    expect(window.SpeechSynthesisUtterance).toHaveBeenCalledWith('か')
  })

  it('falls back to speechSynthesis on an audio error event', () => {
    playKana('か', 'ka')
    const errorHandler = instances[0].addEventListener.mock.calls.find(([event]) => event === 'error')?.[1]
    expect(errorHandler).toBeDefined()

    errorHandler()

    expect(window.speechSynthesis.speak).toHaveBeenCalled()
    expect(window.SpeechSynthesisUtterance).toHaveBeenCalledWith('か')
  })
})

describe('kana audio manifest coverage', () => {
  it('has a static clip for every seeded hiragana romaji', () => {
    const manifestIds = new Set((kanaSounds as { id: string }[]).map((s) => s.id))
    const missing = HIRAGANA.filter((h) => !manifestIds.has(h.romaji)).map((h) => h.romaji)
    expect(missing).toEqual([])
  })
})
