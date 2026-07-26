import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) {
            return "three-core";
          }

          if (
            id.includes("node_modules/@react-three/fiber") ||
            id.includes("node_modules/@react-three/drei")
          ) {
            return "r3f-stack";
          }

          if (id.includes("node_modules/gsap") || id.includes("node_modules/lenis")) {
            return "motion";
          }

          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
