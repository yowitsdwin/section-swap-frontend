import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // REPLACE 'repo-name' with your actual GitHub repository name!
  // Example: if your URL is github.com/aldwin/section-swap, use '/section-swap/'
  base: '/section-swap-frontend/', 
})