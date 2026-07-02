import { test, expect } from './fixtures';

/**
 * Core flow: contact form ("Send Neural Message").
 *
 * SAFETY CONSTRAINT: this form submits via the EmailJS browser SDK
 * (POST https://api.emailjs.com/api/v1.0/email/send), confirmed by live
 * discovery with the outgoing request captured and blocked before it ever
 * left the browser. This test intercepts and locally fulfills every non-GET
 * request BEFORE filling or submitting the form, so no real request ever
 * reaches EmailJS and no real email/record is ever created — even though
 * this suite runs against the live production site.
 */
const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

test.describe('contact form', () => {
  test('fills, submits, and shows success UI without hitting the real EmailJS endpoint', async ({
    enteredPortfolioPage: page,
  }) => {
    const interceptedRequests: { url: string; postData: string | null }[] = [];

    // Intercept every non-GET request and fulfill it locally so nothing
    // reaches a real backend, regardless of which endpoint the form posts to.
    await page.route('**/*', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.continue();
        return;
      }
      interceptedRequests.push({ url: request.url(), postData: request.postData() });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, mocked: true }),
      });
    });

    await page.getByRole('button', { name: /send neural message/i }).click();
    await expect(page.getByRole('heading', { name: /neural link communication/i })).toBeVisible();

    await page.getByPlaceholder('Enter your full name').fill('Playwright Test');
    await page.getByPlaceholder('Enter your email address').fill('test+playwright@example.com');
    await page.getByPlaceholder("What's this about?").fill('Automated test - please ignore');
    await page
      .getByPlaceholder("Tell me what's on your mind...")
      .fill('This is an automated Playwright test message and must never be sent for real.');

    const sendButton = page.getByRole('button', { name: /send message/i });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    await expect(page.getByRole('heading', { name: /message sent successfully/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /return to portfolio/i })).toBeVisible();

    // Assert the mocked request is what we expected to intercept — proof
    // the real EmailJS endpoint was the one blocked, not that nothing fired.
    const emailjsRequests = interceptedRequests.filter((r) => r.url === EMAILJS_ENDPOINT);
    expect(emailjsRequests.length).toBeGreaterThan(0);
    const payload = JSON.parse(emailjsRequests[0].postData ?? '{}');
    expect(payload.template_params.from_email).toBe('test+playwright@example.com');
    expect(payload.template_params.name).toBe('Playwright Test');
  });
});
