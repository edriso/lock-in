import { expect, test, type Page } from '@playwright/test';

// Override document visibility inside the page and fire the event.
async function setHidden(page: Page, value: boolean) {
  await page.evaluate((hidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (hidden ? 'hidden' : 'visible'),
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, value);
}

test('happy path: lock in, bank a clean session, and it persists', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');

  await page.getByLabel('What are you locking in on?').fill('Calculus');
  await page.getByLabel('Why does it matter?').fill('Pass the final');
  await page.getByRole('button', { name: 'Lock In' }).click();

  // Promise gate → run.
  await page.getByRole('button', { name: /I.?m in/ }).click();
  await expect(page.getByText('locked in', { exact: true })).toBeVisible();

  // Fast-forward past the 2-minute promise, then end & bank.
  await page.clock.runFor(125_000);
  await page.getByRole('button', { name: /End & bank/ }).click();
  await expect(page.getByText('Clean lock')).toBeVisible();
  await page.getByRole('button', { name: 'Bank it' }).click();

  // Streak and log updated.
  await expect(page.getByText(/day locked in/)).toBeVisible();
  await expect(page.getByText('Calculus')).toBeVisible();

  // Survives a reload (localStorage persistence).
  await page.reload();
  await expect(page.getByText('Calculus')).toBeVisible();
  await expect(page.getByText(/day locked in/)).toBeVisible();
});

test('leaving past the grace window banks a broken session', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');

  await page.getByRole('button', { name: 'Lock In' }).click();
  await page.getByRole('button', { name: /I.?m in/ }).click();

  // Leave for 10s (> 7s normal grace) → broken.
  await setHidden(page, true);
  await expect(page.getByText(/get back here/)).toBeVisible();
  await page.clock.runFor(10_000);
  await setHidden(page, false);

  await page.clock.runFor(125_000);
  await page.getByRole('button', { name: /End & bank/ }).click();
  await expect(page.getByText('Locked, with a wobble')).toBeVisible();
});
