import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/components'),
      '@location': path.resolve(__dirname, 'src/location-selector')
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'DataForgeComponents',
      formats: ['es', 'umd'],
      fileName: (format) => `data-forge.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
