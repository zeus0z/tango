#!/usr/bin/env node
/**
 * One-time build tool — renders the kana sound manifest to static MP3s via
 * edge-tts (Microsoft ja-JP-NanamiNeural), then normalizes/trims with ffmpeg.
 *
 * Prerequisites (not repo dependencies, dev-machine only):
 *   pip install edge-tts
 *   ffmpeg on PATH
 *
 * Usage:
 *   node scripts/generate-kana-audio.mjs [--force]
 *
 * Output: public/audio/kana/<id>.mp3 (one per manifest entry). Idempotent —
 * existing files are skipped unless --force is passed.
 */

import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MANIFEST_PATH = join(__dirname, 'kana-sounds.json')
const OUT_DIR = join(ROOT, 'public', 'audio', 'kana')
const VOICE = 'ja-JP-NanamiNeural'

const force = process.argv.includes('--force')

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf-8' })
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed:\n${result.stderr || result.stdout}`)
  }
  return result
}

function checkTool(cmd, versionArgs) {
  const result = spawnSync(cmd, versionArgs, { stdio: 'pipe' })
  if (result.error || result.status !== 0) {
    console.error(`Missing prerequisite: "${cmd}" not found on PATH.`)
    if (cmd === 'edge-tts') console.error('  Install with: pip install edge-tts')
    if (cmd === 'ffmpeg') console.error('  Install ffmpeg and ensure it is on PATH.')
    process.exit(1)
  }
}

function main() {
  checkTool('edge-tts', ['--version'])
  checkTool('ffmpeg', ['-version'])

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
  mkdirSync(OUT_DIR, { recursive: true })

  let generated = 0
  let skipped = 0
  const failed = []

  for (const { id, text } of manifest) {
    const outPath = join(OUT_DIR, `${id}.mp3`)
    if (existsSync(outPath) && !force) {
      skipped++
      continue
    }

    const rawPath = join(tmpdir(), `tango-kana-raw-${id}-${process.pid}.mp3`)
    try {
      run('edge-tts', ['--voice', VOICE, '--text', text, '--write-media', rawPath])

      // Trim leading/trailing silence, add a small tail pad (fixes the
      // "clipped, too short" complaint from the old Web Speech API), and
      // normalize loudness across all clips so playback volume is consistent.
      run('ffmpeg', [
        '-y',
        '-i', rawPath,
        '-af', 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05:stop_periods=1:stop_threshold=-50dB:stop_silence=0.05,apad=pad_dur=0.15,loudnorm=I=-16:TP=-1.5:LRA=11',
        '-ar', '44100',
        '-ac', '1',
        '-b:a', '64k',
        outPath,
      ])

      generated++
      console.log(`✓ ${id}.mp3`)
    } catch (err) {
      failed.push(id)
      console.error(`✗ ${id}: ${err.message}`)
    } finally {
      if (existsSync(rawPath)) rmSync(rawPath, { force: true })
    }
  }

  console.log(`\nDone. Generated ${generated}, skipped ${skipped} (already existed), failed ${failed.length}.`)
  if (failed.length > 0) {
    console.error(`Failed ids: ${failed.join(', ')}`)
    process.exit(1)
  }
}

main()
