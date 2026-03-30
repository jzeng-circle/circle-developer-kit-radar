import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/circle-developer-kit-radar/',
  server: {
    port: 3737,
    strictPort: true, // fail instead of picking a random port
  },
})
