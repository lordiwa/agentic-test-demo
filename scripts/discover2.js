// Second discovery pass: inspect the "Send Neural Message" modal (likely the
// contact form), the top tab-switcher buttons, and whether /about /projects
// /contact are distinct routes or just aliases for the same single-page app.
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('request', (req) => {
    if (req.method() !== 'GET') console.log('[request]', req.method(), req.url());
  });

  await page.goto('https://m4to.com/', { waitUntil: 'load', timeout: 60000 });
  await page.getByRole('button', { name: /start multiverse machine/i }).click();
  await page.waitForTimeout(3000);

  console.log('=== Clicking Send Neural Message ===');
  await page.getByRole('button', { name: /send neural message/i }).click();
  await page.waitForTimeout(2000);
  console.log('--- ARIA snapshot after opening contact ---');
  const snap = await page.locator('body').ariaSnapshot();
  console.log(snap.slice(0, 6000));

  console.log('\n--- Forms after opening contact ---');
  const forms = await page.locator('form').evaluateAll((els) =>
    els.map((el) => ({
      action: el.getAttribute('action'),
      method: el.getAttribute('method'),
      fields: Array.from(el.querySelectorAll('input, textarea, select, button')).map((f) => ({
        tag: f.tagName,
        type: f.getAttribute('type'),
        name: f.getAttribute('name'),
        placeholder: f.getAttribute('placeholder'),
        required: f.hasAttribute('required'),
        text: f.textContent ? f.textContent.trim().slice(0, 40) : null,
      })),
    }))
  );
  console.log(JSON.stringify(forms, null, 2));

  console.log('\n--- All inputs/textareas on page (in case not wrapped in <form>) ---');
  const inputs = await page.locator('input, textarea').evaluateAll((els) =>
    els.map((f) => ({
      tag: f.tagName,
      type: f.getAttribute('type'),
      name: f.getAttribute('name'),
      id: f.getAttribute('id'),
      placeholder: f.getAttribute('placeholder'),
      required: f.hasAttribute('required'),
    }))
  );
  console.log(JSON.stringify(inputs, null, 2));

  await page.screenshot({ path: 'scripts/contact-modal.png', fullPage: false }).catch(() => {});

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
