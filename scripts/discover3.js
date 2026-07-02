// Third discovery pass: safely determine the contact form's submission
// mechanism WITHOUT ever letting a real request reach m4to.com's backend.
// Every non-GET request is intercepted and fulfilled locally (never
// forwarded), so clicking "Send Message" here cannot create a real
// email/record even though this is the live site.
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const intercepted = [];
  await page.route('**/*', async (route) => {
    const req = route.request();
    if (req.method() !== 'GET') {
      intercepted.push({
        method: req.method(),
        url: req.url(),
        postData: req.postData(),
      });
      // Fulfill locally so nothing ever reaches the real backend.
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, mocked: true }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('https://m4to.com/', { waitUntil: 'load', timeout: 60000 });
  await page.getByRole('button', { name: /start multiverse machine/i }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: /send neural message/i }).click();
  await page.waitForTimeout(1500);

  await page.getByPlaceholder('Enter your full name').fill('Playwright Test');
  await page.getByPlaceholder('Enter your email address').fill('test+playwright@example.com');
  await page.getByPlaceholder("What's this about?").fill('Automated test - please ignore');
  await page.getByPlaceholder("Tell me what's on your mind...").fill('This is an automated Playwright test message and must never be sent for real.');

  console.log('=== Send Message button state before click ===');
  const sendBtn = page.getByRole('button', { name: /send message/i });
  console.log('enabled:', await sendBtn.isEnabled());

  console.log('\n=== Clicking Send Message (all non-GET requests intercepted/mocked) ===');
  await sendBtn.click();
  await page.waitForTimeout(3000);

  console.log('\n=== Intercepted non-GET requests ===');
  console.log(JSON.stringify(intercepted, null, 2));

  console.log('\n=== Post-submit ARIA snapshot (success/error UI) ===');
  const snap = await page.locator('body').ariaSnapshot();
  console.log(snap.slice(0, 3000));

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
