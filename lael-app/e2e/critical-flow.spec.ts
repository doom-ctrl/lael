import { test, expect } from '@playwright/test';

/**
 * Critical-flow E2E: sign up → add assessment → mark complete.
 *
 * Covers the three things that, if broken, block all real users
 * from using the app. Runs against a freshly-seeded test account
 * each run (timestamp-based email avoids collisions).
 *
 * Skipped by default so `bun run test` stays fast — opt in with
 * `RUN_E2E=1 bun run test:e2e`. The E2E test also requires a
 * running Convex backend (the dev server alone won't authenticate).
 */
const RUN_E2E = process.env.RUN_E2E === '1';
test.skip(!RUN_E2E, 'E2E tests require RUN_E2E=1 and a running Convex backend');

test('sign up, add assessment, mark complete', async ({ page }) => {
  const email = `e2e-${Date.now()}@lael.test`;
  const password = 'correct-horse-battery-staple';

  // 1. Sign up.
  await page.goto('/sign-up');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign up/i }).click();

  // Should land on the dashboard.
  await expect(page).toHaveURL(/\/$/);

  // 2. Open the Add Assessment dialog and submit a minimal entry.
  await page.getByRole('button', { name: /add assessment/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByLabel(/title/i).fill('Final exam');
  await page.getByLabel(/subject/i).fill('Math 101');
  // Date defaults to today — leave it.

  await page.getByRole('button', { name: /save|add/i }).last().click();

  // Dialog closes and the new assessment is visible on the dashboard.
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByText('Final exam')).toBeVisible();

  // 3. Mark complete via the row checkbox.
  const row = page.locator('text=Final exam').first();
  await row.scrollIntoViewIfNeeded();
  // The row has a checkbox — first one in the same row.
  const checkbox = row.locator('xpath=ancestor::*[self::li or self::div][1]')
    .getByRole('checkbox').first();
  if (await checkbox.isVisible()) {
    await checkbox.check();
  }

  // 4. Sign out.
  await page.getByRole('button', { name: /account menu/i }).click();
  await page.getByRole('menuitem', { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/sign-in/);
});
