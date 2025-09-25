import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This makes the environment variable available to the client-side code
  // under `process.env.API_KEY`, using the value from `VITE_API_KEY`.
  // The user must set VITE_API_KEY in their deployment environment (e.g., Netlify).
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  }
})