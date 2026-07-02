// Ad-hoc discovery script (not part of the test suite). Run with:
//   node scripts/discover.js
// Dumps the live m4to.com page structure (roles, headings, nav, buttons,
// links, forms) plus response status codes for candidate routes, so specs
// can be written against real DOM structure instead of guesses.
const { chromium, request } = require('playwright');

const ROUTES = ['/', '/about', '/projects', '/contact', '/robots.txt', '/does-not-exist-xyz'];

async function checkRoutes(baseURL) {
  const ctx = await request.newContext();
  console.log('\n=== Route status codes ===');
  for (const route of ROUTES) {
    try {
      const res = await ctx.get(baseURL + route, { maxRedirects: 5 });
      console.log(route, '->', res.status());
    } catch (e) {
      console.log(route, '-> ERROR', e.message);
    }
  }
  await ctx.dispose();
}

async function checkClientRouting(baseURL) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log('\n=== Client-side routing check (direct nav to each route) ===');
  for (const route of ['/about', '/projects', '/contact', '/does-not-exist-xyz']) {
    try {
      await page.goto(baseURL + route, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(2000);
      const h1 = await page.locator('h1').first().textContent().catch(() => null);
      console.log(route, '-> finalURL:', page.url(), '| h1:', h1);
    } catch (e) {
      console.log(route, '-> ERROR', e.message);
    }
  }
  await browser.close();
}

async function main() {
  const baseURL = 'https://m4to.com';
  await checkRoutes(baseURL);
  await checkClientRouting(baseURL);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('[pageerror]', err.message));

  await page.goto(baseURL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000); // let SPA hydrate

  console.log('\n=== Title ===');
  console.log(await page.title());

  console.log('\n=== ARIA snapshot (page.locator("body")) ===');
  try {
    const ariaSnapshot = await page.locator('body').ariaSnapshot();
    console.log(ariaSnapshot.slice(0, 8000));
  } catch (e) {
    console.log('ariaSnapshot unavailable:', e.message);
  }

  console.log('\n=== Headings ===');
  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log(headings);

  console.log('\n=== Nav links (a tags) ===');
  const links = await page.locator('a').evaluateAll((els) =>
    els.map((el) => ({
      text: el.textContent.trim(),
      href: el.getAttribute('href'),
      target: el.getAttribute('target'),
    }))
  );
  console.log(JSON.stringify(links, null, 2));

  console.log('\n=== Buttons ===');
  const buttons = await page.locator('button, [role=button]').evaluateAll((els) =>
    els.map((el) => ({ text: el.textContent.trim(), ariaLabel: el.getAttribute('aria-label') }))
  );
  console.log(JSON.stringify(buttons, null, 2));

  console.log('\n=== Forms ===');
  const forms = await page.locator('form').evaluateAll((els) =>
    els.map((el) => ({
      action: el.getAttribute('action'),
      method: el.getAttribute('method'),
      fields: Array.from(el.querySelectorAll('input, textarea, select')).map((f) => ({
        tag: f.tagName,
        type: f.getAttribute('type'),
        name: f.getAttribute('name'),
        placeholder: f.getAttribute('placeholder'),
        required: f.hasAttribute('required'),
      })),
    }))
  );
  console.log(JSON.stringify(forms, null, 2));

  console.log('\n=== Cookie/consent banner check ===');
  const consentText = await page.getByText(/cookie|consent|accept/i).count();
  console.log('candidates matching cookie/consent/accept text:', consentText);

  console.log('\n=== Clicking START MULTIVERSE MACHINE (splash gate) ===');
  const startBtn = page.getByRole('button', { name: /start multiverse machine/i });
  if (await startBtn.count()) {
    await startBtn.click();
    await page.waitForTimeout(4000);

    console.log('\n--- Post-click ARIA snapshot ---');
    try {
      const s2 = await page.locator('body').ariaSnapshot();
      console.log(s2.slice(0, 10000));
    } catch (e) {
      console.log('ariaSnapshot unavailable:', e.message);
    }

    console.log('\n--- Post-click headings ---');
    console.log(await page.locator('h1, h2, h3').allTextContents());

    console.log('\n--- Post-click nav links ---');
    const links2 = await page.locator('a').evaluateAll((els) =>
      els.map((el) => ({ text: el.textContent.trim(), href: el.getAttribute('href'), target: el.getAttribute('target') }))
    );
    console.log(JSON.stringify(links2, null, 2));

    console.log('\n--- Post-click buttons ---');
    const buttons2 = await page.locator('button, [role=button]').evaluateAll((els) =>
      els.map((el) => ({ text: el.textContent.trim(), ariaLabel: el.getAttribute('aria-label') }))
    );
    console.log(JSON.stringify(buttons2, null, 2));

    console.log('\n--- Post-click forms ---');
    const forms2 = await page.locator('form').evaluateAll((els) =>
      els.map((el) => ({
        action: el.getAttribute('action'),
        method: el.getAttribute('method'),
        fields: Array.from(el.querySelectorAll('input, textarea, select')).map((f) => ({
          tag: f.tagName,
          type: f.getAttribute('type'),
          name: f.getAttribute('name'),
          placeholder: f.getAttribute('placeholder'),
          required: f.hasAttribute('required'),
        })),
      }))
    );
    console.log(JSON.stringify(forms2, null, 2));

    console.log('\n--- Post-click URL ---');
    console.log(page.url());
  } else {
    console.log('No START MULTIVERSE MACHINE button found on this run.');
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
