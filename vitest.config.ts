import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: true,
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})