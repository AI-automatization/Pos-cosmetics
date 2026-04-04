import { chromium } from 'playwright';
const BASE = 'http://localhost:3001';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  // Listen to all responses
  page.on('response', r => {
    if (r.url().includes('/api/v1/')) console.error('RESPONSE:', r.status(), r.url());
  });

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  const count = await page.locator('input').count();
  console.error('Inputs found:', count);
  if (count < 3) { console.error('Not enough inputs'); await browser.close(); return; }

  const inputs = page.locator('input');
  await inputs.nth(0).fill('kosmetika-demo');
  await inputs.nth(1).fill('owner@kosmetika.uz');
  await inputs.nth(2).fill('Demo1234!');

  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);

  console.error('Final URL:', page.url());
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
