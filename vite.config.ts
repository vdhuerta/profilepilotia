import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Cast `process` to `any` to bypass incorrect type definitions that cause "Property 'cwd' does not exist on type 'Process'".
  const env = loadEnv(mode, (process as any).cwd(), '')
  return {
    plugins: [react()],
    // This makes the environment variable available to the client-side code
    // under `process.env.API_KEY`, using the value from `VITE_API_KEY`.
    // The user must set VITE_API_KEY in their deployment environment (e.g., Netlify).
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  }
})
