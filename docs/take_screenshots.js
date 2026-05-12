const { chromium } = require('playwright');
const path = require('path');

const DESKTOP = path.join(require('os').homedir(), 'Desktop', 'RAOS_Screenshots');
const BASE_URL = 'https://raos.uz';
const EMAIL = 'owner@kosmetika.uz';
const PASSWORD = 'Demo2026!';

const PAGES = [
  { name: '03_dashboard', url: '/dashboard', wait: 5000 },
  { name: '03_dashboard_full', url: '/dashboard', fullPage: true, wait: 5000 },
  { name: '04_products', url: '/catalog/products', wait: 4000 },
  { name: '05_categories', url: '/catalog/categories', wait: 4000 },
  { name: '06_suppliers', url: '/catalog/suppliers', wait: 4000 },
  { name: '07_inventory', url: '/inventory', wait: 4000 },
  { name: '08_customers', url: '/customers', wait: 4000 },
  { name: '09_workers', url: '/workers', wait: 4000 },
  { name: '10_reports', url: '/reports', wait: 4000 },
  { name: '11_analytics', url: '/analytics', wait: 5000 },
  { name: '12_nasiya', url: '/nasiya', wait: 4000 },
  { name: '13_realestate', url: '/realestate', wait: 4000 },
  { name: '14_settings_users', url: '/settings/users', wait: 4000 },
  { name: '15_settings_branches', url: '/settings/branches', wait: 4000 },
  { name: '16_tasks', url: '/tasks', wait: 4000 },
  { name: '17_promotions', url: '/promotions', wait: 4000 },
  { name: '18_chegirma', url: '/chegirma', wait: 4000 },
  { name: '19_exchange_rates', url: '/exchange-rates', wait: 4000 },
  { name: '20_billing', url: '/settings/billing', wait: 4000 },
  { name: '21_audit_log', url: '/settings/audit-log', wait: 4000 },
  { name: '22_onboarding', url: '/onboarding', wait: 4000 },
  { name: '23_printer', url: '/settings/printer', wait: 4000 },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function loginAndGetState(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'uz-UZ',
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  page.on('pageerror', () => {});

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Screenshot login
  await page.screenshot({ path: path.join(DESKTOP, '01_login.png') });
  console.log('  Done: 01_login.png');

  // Fill and screenshot
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(DESKTOP, '02_login_filled.png') });
  console.log('  Done: 02_login_filled.png');

  // Submit
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('  Logged in successfully!');
  } catch {
    console.log('  Login redirect URL:', page.url());
    await page.waitForTimeout(5000);
  }

  // Save auth state (cookies)
  const state = await ctx.storageState();
  await ctx.close();
  return state;
}

async function takeScreenshot(browser, storageState, cfg) {
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'uz-UZ',
    ignoreHTTPSErrors: true,
    storageState,
  });
  const page = await ctx.newPage();
  page.on('pageerror', () => {});

  try {
    await page.goto(`${BASE_URL}${cfg.url}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(cfg.wait || 4000);

    // If redirected to login, re-login
    if (page.url().includes('/login')) {
      console.log(`  [${cfg.name}] Session lost, re-logging...`);
      await page.fill('input[type="email"]', EMAIL);
      await page.fill('input[type="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      await page.goto(`${BASE_URL}${cfg.url}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(cfg.wait || 4000);
    }

    await page.screenshot({
      path: path.join(DESKTOP, `${cfg.name}.png`),
      fullPage: cfg.fullPage || false,
    });
    console.log(`  Done: ${cfg.name}.png`);
    await ctx.close();
    return true;
  } catch (e) {
    console.log(`  ERROR [${cfg.name}]: ${e.message.split('\n')[0]}`);
    try {
      await page.screenshot({ path: path.join(DESKTOP, `${cfg.name}_error.png`) });
    } catch {}
    await ctx.close();
    return false;
  }
}

async function main() {
  let browser = await chromium.launch({ headless: true });

  // Step 1: Login and get state
  console.log('=== LOGIN ===');
  const authState = await loginAndGetState(browser);

  // Step 2: Take screenshots one by one with fresh context each time
  let count = 2;
  const BATCH_SIZE = 5;

  for (let i = 0; i < PAGES.length; i++) {
    const cfg = PAGES[i];
    console.log(`[${i + 1}/${PAGES.length}] ${cfg.name} → ${cfg.url}`);

    const ok = await takeScreenshot(browser, authState, cfg);
    if (ok) count++;

    // Pause between requests to avoid throttling
    await sleep(2000);

    // Restart browser every BATCH_SIZE pages to avoid memory/network issues
    if ((i + 1) % BATCH_SIZE === 0 && i < PAGES.length - 1) {
      console.log('  --- Restarting browser ---');
      await browser.close();
      await sleep(3000);
      browser = await chromium.launch({ headless: true });
    }
  }

  await browser.close();
  console.log(`\n=== DONE: ${count}/${PAGES.length + 2} screenshots ===`);
  console.log(`Saved to: ${DESKTOP}`);
}

main().catch(console.error);
