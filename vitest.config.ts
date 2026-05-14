import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        'src/main.ts',
        'src/**/*.html',
        'src/**/*.scss',
        'src/app/core/models/index.ts',
        'src/testing/**',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
});
