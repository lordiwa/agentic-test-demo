import { test, expect } from './fixtures';

/**
 * Core flow: landing page load + splash gate.
 * m4to.com boots into a "SYSTEMS ONLINE" splash screen; the real portfolio
 * only renders after "START MULTIVERSE MACHINE" is clicked (confirmed via
 * live discovery: the pre-click DOM has no headings/links/forms at all).
 */
test.describe('landing page', () => {
  test('loads with the expected title and splash gate', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Rafael Matovelle/i);
    await expect(page.getByText(/systems online/i).first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: /start multiverse machine/i })
    ).toBeVisible();
  });

  test('entering the machine reveals the main portfolio content', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start multiverse machine/i }).click();

    await expect(page.getByRole('heading', { name: 'Rafael Matovelle', level: 1 })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /full stack engineer/i, level: 3 })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Professional Experience' })).toBeVisible();
  });
});
