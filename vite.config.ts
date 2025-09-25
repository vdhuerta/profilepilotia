import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fix: Define process.env.API_KEY to make it available in the client-side code,
  // sourcing from the VITE_API_KEY environment variable during the build.
  // This is the standard way to expose environment variables to a Vite frontend
  // and aligns with the guideline to use process.env.API_KEY in the application code.
  define: {
    'process.env.API_KEY': process.env.VITE_API_KEY ? JSON.stringify(process.env.VITE_API_KEY) : 'undefined',
  },
})
