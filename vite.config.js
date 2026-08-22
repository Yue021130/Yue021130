import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.REPOSITORY_NAME ? `/${process.env.REPOSITORY_NAME}/` : '/',
  plugins: [react()],
})
