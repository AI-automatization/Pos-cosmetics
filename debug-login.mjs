import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Screenshot
  await page.screenshot({ path: '/tmp/login-page.png', fullPage: true });

  // Count and describe inputs
  const inputs = await page.evaluate(() => {
    const els = document.querySelectorAll('input');
    return [...els].map(i => ({ type: i.type, placeholder: i.placeholder, name: i.name, autocomplete: i.autocomplete }));
  });
  console.log('Inputs:', JSON.stringify(inputs, null, 2));

  // Fill
  const allInputs = page.locator('input');
  const count = await allInputs.count();
  console.log('Input count:', count);

  await allInputs.nth(0).fill('kosmetika-demo');
  await allInputs.nth(1).fill('owner@kosmetika.uz');
  await allInputs.nth(2).fill('Demo1234!');

  // Intercept login response
  const [loginResponse] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/auth/login'), { timeout: 10000 }).catch(() => null),
    page.locator('button[type="submit"]').click(),
  ]);

  if (loginResponse) {
    const status = loginResponse.status();
    const body = await loginResponse.text().catch(() => '');
    console.log('Login response status:', status);
    console.log('Login response body:', body.slice(0, 300));
  } else {
    console.log('No login response intercepted');
  }

  await page.waitForTimeout(3000);
  console.log('Final URL:', page.url());

  await page.screenshot({ path: '/tmp/after-login.png', fullPage: true });
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
