// Fourth discovery pass: inspect the "Multiverse Me" / "Current Universe Me"
// / "API" tab-switcher buttons at the top of the page.
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://m4to.com/', { waitUntil: 'load', timeout: 60000 });
  await page.getByRole('button', { name: /start multiverse machine/i }).click();
  await page.waitForTimeout(3000);

  for (const name of ['Current Universe Me', 'API', 'Multiverse Me']) {
    console.log(`\n=== Clicking tab: ${name} ===`);
    await page.getByRole('button', { name, exact: true }).click();
    await page.waitForTimeout(1500);
    const h1 = await page.locator('h1').first().textContent().catch(() => null);
    const h3 = await page.locator('h3').first().textContent().catch(() => null);
    console.log('h1:', h1, '| h3:', h3);
    console.log('url:', page.url());
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
