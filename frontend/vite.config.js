import path from "path"
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/aii/wr-management/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep a few large libs split, but put most vendor deps into a single React-aligned chunk
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('react-quill-new')) return 'vendor-editor';
            if (id.includes('lucide-react')) return 'vendor-icons';
            // Put the rest of node_modules (including React and UI primitives) into vendor-react
            // This helps avoid cross-chunk circular-init issues between vendor bundles.
            return 'vendor-react';
          }
        }
      },
    },
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096, // Inline small assets (4KB)
    reportCompressedSize: false, // Speed up build
  },
})
