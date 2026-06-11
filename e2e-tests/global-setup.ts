import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Global setup for Playwright, like seeding the DB
  // This will be expanded later when the backend is ready.
  console.log('Global setup running...');
}

export default globalSetup;
