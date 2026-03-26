import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  fullyParallel: false,
  workers: 1,
  globalSetup: './global.setup.ts',

  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  webServer: [
    {
      command: 'npm run dev',
      cwd: '../server',
      url: 'http://localhost:3000/api/users/me',
      ignoreHTTPSErrors: true,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npx ng serve --no-open',
      cwd: '../client',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
