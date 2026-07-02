import { test, expect } from './fixtures';

/**
 * Core flow: link navigation. Discovery found no distinct in-app routes
 * (/about, /projects, /contact all serve the same SPA shell) and no internal
 * anchor nav in the header — the only navigational links on the page are the
 * external "Personal Links" (LinkedIn, GitHub, Remoose Interactive), all of
 * which open target=_blank. Each is verified to open a popup pointing at the
 * correct external destination.
 */
const externalLinks: Array<{ name: RegExp; hostname: string }> = [
  { name: /linkedin profile/i, hostname: 'linkedin.com' },
  { name: /github portfolio/i, hostname: 'github.com' },
  { name: /remoose interactive/i, hostname: 'remoose.com' },
];

test.describe('external link navigation', () => {
  for (const { name, hostname } of externalLinks) {
    test(`"${hostname}" link opens in a new tab pointing at the right destination`, async ({
      enteredPortfolioPage: page,
    }) => {
      const link = page.getByRole('link', { name }).first();
      await expect(link).toBeVisible();

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        link.click(),
      ]);
      await popup.waitForLoadState('domcontentloaded');

      expect(new URL(popup.url()).hostname).toContain(hostname);
      await popup.close();
    });
  }
});
