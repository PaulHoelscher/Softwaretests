import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm run build:client && npm run start:test",
    url: "http://localhost:4000",
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe"
  },
  use: {
    baseURL: "http://localhost:4000",
    headless: true
  },
  testDir: "tests/e2e"
};

export default config;
