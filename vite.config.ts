import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'react'
          }

          if (
            id.includes('/three/') ||
            id.includes('@react-three/fiber') ||
            id.includes('@react-three/drei')
          ) {
            return 'three'
          }

          if (id.includes('/gsap/') || id.includes('/lenis/')) {
            return 'motion'
          }

          return undefined
        },
      },
    },
  },
})
