import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/workload-management/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries - loaded on every page
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts library - only needed on Dashboard
          'vendor-charts': ['recharts'],
          // Rich text editor - only needed when editing notes
          'vendor-editor': ['react-quill-new'],
          // Date utilities - tree-shaken, keep separate
          'vendor-utils': ['date-fns'],
        },
      },
    },
    // Increase limit since vendor-charts will be ~300KB
    chunkSizeWarningLimit: 350,
  },
})
