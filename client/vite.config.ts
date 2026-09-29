import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'client',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 9995,
    strictPort: true,
  },
})
