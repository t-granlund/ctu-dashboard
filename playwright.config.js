import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'npx vite preview --port 4173',
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'Desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'Tablet', use: { viewport: { width: 768, height: 1024 } } },
  ],
});
