import { defineConfig } from 'vitest/config'

export default defineConfig({
    esbuild: {
        jsxFactory: 'h',
        jsxFragment: '_fragment',
    },
    test: {
        coverage: {
            provider: 'istanbul',
            include: ['src/**/*.{ts,tsx}'],
        },
    },
})
