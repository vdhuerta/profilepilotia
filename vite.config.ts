import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Fix for "Property 'cwd' does not exist on type 'Process'" error on line 6.
// We import `cwd` explicitly from `node:process` to avoid issues with a potentially
// conflicting global `process` type.
import { cwd } from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')
  return {
    plugins: [react()],
    define: {
      // Fix: Define process.env.API_KEY for client-side use, aligning with @google/genai guidelines.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  }
})
