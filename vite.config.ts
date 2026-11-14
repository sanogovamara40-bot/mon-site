import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    // Preview is used to expose the built app through a temporary tunnel.
    allowedHosts: ['.serveousercontent.com', '.lhr.life', '.trycloudflare.com'],
  },
})
