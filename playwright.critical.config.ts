import { defineConfig } from '@playwright/test';
import { readFileSync } from 'node:fs';

if (!process.env.RCAAS_CRITICAL_CONFIG) throw new Error('Set RCAAS_CRITICAL_CONFIG to an isolated runtime configuration; never target client data.');
const runtime = JSON.parse(readFileSync(process.env.RCAAS_CRITICAL_CONFIG, 'utf8'));
export default defineConfig({
  testDir: './test/critical', workers: 1, fullyParallel: false, timeout: 180000,
  outputDir: 'test-results/critical-studio',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/critical-studio', open: 'never' }]],
  use: { baseURL: runtime.base, viewport: { width: 1440, height: 960 }, channel: 'chromium', actionTimeout: 15000, navigationTimeout: 30000, trace: 'retain-on-failure', launchOptions: { args: ['--enable-unsafe-swiftshader'] } },
});
