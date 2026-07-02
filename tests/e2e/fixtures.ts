import { test as base, expect, type Page } from '@playwright/test';

/**
 * m4to.com is a single-page, client-rendered "multiverse portfolio". Every
 * route serves the same shell, and the real content sits behind a splash
 * gate (a "START MULTIVERSE MACHINE" button) that must be clicked before
 * any portfolio content, nav, or forms exist in the DOM. All specs share
 * that entry sequence plus an optional cookie-consent dismissal here so it
 * isn't duplicated per file.
 */
async function dismissCookieBannerIfPresent(page: Page) {
  const banner = page.getByRole('button', { name: /accept|got it|agree/i });
  if (await banner.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await banner.click();
  }
}

async function enterPortfolio(page: Page) {
  await page.goto('/');
  await dismissCookieBannerIfPresent(page);
  const startButton = page.getByRole('button', { name: /start multiverse machine/i });
  await expect(startButton).toBeVisible();
  await startButton.click();
  await expect(page.getByRole('heading', { name: 'Rafael Matovelle', level: 1 })).toBeVisible();
}

export const test = base.extend<{ enteredPortfolioPage: Page }>({
  enteredPortfolioPage: async ({ page }, use) => {
    await enterPortfolio(page);
    await use(page);
  },
});

export { expect, enterPortfolio, dismissCookieBannerIfPresent };
