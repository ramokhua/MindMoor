import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        const src = resolve(__dirname, 'public/_redirects')
        const destDir = resolve(__dirname, 'dist')
        const dest = resolve(destDir, '_redirects')
        
        console.log('📁 Checking for _redirects...')
        console.log('   Source:', src)
        console.log('   Destination:', dest)
        
        // Make sure dist exists
        if (!existsSync(destDir)) {
          console.log('⚠️ dist directory not found, creating...')
          mkdirSync(destDir, { recursive: true })
        }
        
        // Copy or create _redirects
        if (existsSync(src)) {
          console.log('✅ Found _redirects in public, copying...')
          copyFileSync(src, dest)
          const content = readFileSync(dest, 'utf-8')
          console.log('📄 _redirects content:', content.trim())
        } else {
          console.log('⚠️ _redirects not found in public, creating default...')
          const fs = require('fs')
          fs.writeFileSync(dest, '/*    /index.html   200\n')
          console.log('✅ Default _redirects created in dist')
        }
        
        // Verify it exists
        if (existsSync(dest)) {
          console.log('✅ _redirects successfully placed in dist!')
        } else {
          console.log('❌ FAILED to place _redirects in dist!')
        }
      }
    }
  ],
  base: '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  }
})
