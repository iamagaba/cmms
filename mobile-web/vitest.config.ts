import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})