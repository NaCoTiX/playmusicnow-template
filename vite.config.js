import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '9fe0977a-b4bf-48bf-8b13-6bcd9346a519-00-1e6x1v6l0g0b1.worf.replit.dev',
      'localhost',
      '127.0.0.1'
    ]
  },
  build: {
    outDir: 'dist'
  }
})
