/// <reference types="vitest/config" />
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    // DOMParser / XMLSerializer を使うためブラウザ相当の環境で実行する
    environment: 'jsdom',
  },
  resolve: {
    // tsconfig.app.json の "@/*" と合わせる
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    // "/api/..." へのリクエストを Express に転送する（CORS 設定が不要になる）
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    watch: {
      // Windows のフォルダを Docker にマウントしていると変更通知が届かないため、ポーリングで検知する
      usePolling: true,
      interval: 300,
    },
  },
})
