import { resolve } from 'path'
import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    WindiCSS({
      // transformCSS: 'pre'
      config: {
        extract: {
          // accepts globs and file paths relative to project root
          include: [
            'index.html',
            '**/*.{vue,html,ts}',
          ],
          exclude: [
            'node_modules/**/*',
            '.git/**/*',
          ],
        }
      }
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
})
