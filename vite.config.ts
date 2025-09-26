import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fix: Define process.env variables to make them available in the client-side code,
  // sourcing from VITE_ variables during the build.
  // This is the standard way to expose environment variables to a Vite frontend
  // and aligns with the guideline to use process.env in the application code.
  define: {
    'process.env.API_KEY': process.env.VITE_API_KEY ? JSON.stringify(process.env.VITE_API_KEY) : 'undefined',
  },
})