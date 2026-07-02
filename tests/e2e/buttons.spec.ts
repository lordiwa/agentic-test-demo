import { test, expect } from './fixtures';

/**
 * Core flow: key interactive buttons that change visible content.
 *
 * In scope: the "universe" persona tab-switcher (documented, primary
 * navigation UI) and the contact modal's "Back" button.
 *
 * Deliberately out of scope: the Neural Tetris / Mad Libs / Skate Runner /
 * Generative Art / AI Integration "game" buttons. PROJECT.md scopes these
 * out explicitly ("Hidden/easter-egg features (deliberately untested)"),
 * and live discovery confirmed they are self-contained mini-games rather
 * than core portfolio flows.
 */
test.describe('interactive buttons', () => {
  test('"Multiverse Me" swaps to a random alternate persona, and can be switched back', async ({
    enteredPortfolioPage: page,
  }) => {
    const defaultSubtitle = page.getByRole('heading', { name: /full stack engineer/i, level: 3 });
    await expect(defaultSubtitle).toBeVisible();

    await page.getByRole('button', { name: 'Multiverse Me', exact: true }).click();
    // The alternate persona is randomized per visit (live discovery observed
    // "Amateur Dancer" on one run and a "Dragon Tamer" persona with an
    // entirely different layout on another), so assert the default identity
    // is replaced rather than pinning exact random copy. h1 stays stable
    // across personas.
    await expect(defaultSubtitle).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Rafael Matovelle', level: 1 })).toBeVisible();

    await page.getByRole('button', { name: 'Current Universe Me', exact: true }).click();
    await expect(defaultSubtitle).toBeVisible();
  });

  test('the contact modal\'s Back button returns to the main portfolio view', async ({
    enteredPortfolioPage: page,
  }) => {
    await page.getByRole('button', { name: /send neural message/i }).click();
    await expect(page.getByRole('heading', { name: /neural link communication/i })).toBeVisible();

    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByRole('heading', { name: 'Rafael Matovelle', level: 1 })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /neural link communication/i })
    ).not.toBeVisible();
  });
});
