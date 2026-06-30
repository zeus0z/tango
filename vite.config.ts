import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      // Explicitly include static assets in precache
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-512x512-maskable.png',
      ],
      workbox: {
        // Precache JS, CSS, HTML, fonts, and image assets.
        // Note: .woff (legacy) is intentionally excluded — all modern browsers
        // support .woff2, and the .woff fallback files for Japanese fonts can
        // exceed the Workbox 2 MiB per-file precache limit. .woff2 files for
        // all 4 bundled Japanese fonts are ≤1.9 MiB and are fully precached.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching for card images and any Supabase storage assets
        runtimeCaching: [
          {
            // Cache Supabase storage assets (card images, audio) with CacheFirst
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Supabase API responses (card data) with NetworkFirst for freshness
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Tango',
        short_name: 'Tango',
        description: 'Learn Japanese hiragana and katakana with spaced repetition',
        theme_color: '#6366f1',
        background_color: '#0f0f11',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
