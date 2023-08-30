/// <reference types="vitest" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { icons } from './public/icons.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      srcDir: 'src',
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ttf,woff,woff2}'],
      },
      manifest: {
        name: 'Minesweeper',
        short_name: 'Minesweeper',
        theme_color: '#242424',
        background_color: '#242424',
        display: 'fullscreen',
        icons,
      },
    }),
  ],

  build: {
    cssMinify: 'lightningcss',
  },

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './tests/setup.ts',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true,
  }
})
