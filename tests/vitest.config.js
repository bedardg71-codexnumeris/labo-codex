import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['unit/**/*.test.js'],
        watch: false,
        reporters: 'default'
    }
});
