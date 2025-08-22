import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    // Fix para el problema de crypto.hash en Vite 7.x
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
  },
  build: {
    target: 'esnext',
    sourcemap: false,
  },
})
