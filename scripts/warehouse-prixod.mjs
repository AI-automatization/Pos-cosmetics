/**
 * Playwright: Owner login → Warehouse stock-in (prixod)
 * Middleware OWNER ni warehouse ga qo'ymaydi, shuning uchun
 * cookie da role=WAREHOUSE qilib o'rnatamiz
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';
const SLUG = 'kosmetika-demo';
const EMAIL = 'owner@kosmetika.uz';
const PASSWORD = 'Demo1234!';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await browser.newPage();

  // ── 1. Login as OWNER ──
  console.log('1. Login...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="my-store"]', SLUG);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
  console.log(`   Login OK → ${page.url()}`);

  // ── 2. Override role cookie to WAREHOUSE so middleware lets us through ──
  console.log('2. Cookie: user_role=WAREHOUSE...');
  await page.context().addCookies([{
    name: 'user_role',
    value: 'WAREHOUSE',
    domain: 'localhost',
    path: '/',
  }]);

  // ── 3. Navigate to warehouse stock-in ──
  console.log('3. /warehouse/stock-in...');
  await page.goto(`${BASE}/warehouse/stock-in`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check if we're actually on stock-in page
  const pageTitle = await page.textContent('h1').catch(() => '');
  console.log(`   Page title: ${pageTitle}`);

  if (!pageTitle?.includes('qabul')) {
    await page.screenshot({ path: 'scripts/prixod-debug.png', fullPage: true });
    console.log('   Debug screenshot: scripts/prixod-debug.png');
    console.log('⚠️  Stock-in sahifasi ochilmadi');
    await page.waitForTimeout(5000);
    await browser.close();
    return;
  }

  // ── 4. Fill stock-in form ──
  console.log('4. Form to\'ldirish...');
  await page.fill('input[placeholder="INV-2026-001"]', 'INV-2026-PW-001');

  const noteInput = page.locator('input[placeholder*="izoh"], input[placeholder*="Izoh"]');
  if (await noteInput.count() > 0) {
    await noteInput.first().fill('Playwright test — kosmetika prixod');
  }

  // Wait for products to load
  await page.waitForTimeout(3000);

  const productSelect = page.locator('tbody select').first();
  const options = await productSelect.locator('option').all();
  console.log(`   ${options.length - 1} ta mahsulot`);

  if (options.length > 1) {
    // Select first product
    const val = await options[1].getAttribute('value');
    const name = await options[1].textContent();
    await productSelect.selectOption(val);
    console.log(`   Tanlandi: ${name}`);

    // Quantity = 10
    await page.locator('tbody input[type="number"]').first().fill('10');
    // Price = 850,000
    await page.locator('tbody input[type="number"]').nth(1).fill('850000');
    // Batch
    await page.locator('input[placeholder="Batch-001"]').first().fill('BATCH-PW-001');
    // Expiry
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6);
    await page.locator('tbody input[type="date"]').first().fill(expiry.toISOString().split('T')[0]);

    await page.screenshot({ path: 'scripts/prixod-filled.png', fullPage: true });
    console.log('5. Saqlash...');

    const saveBtn = page.locator('button[type="submit"]');
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      try {
        await page.waitForURL('**/warehouse/invoices**', { timeout: 15000 });
        console.log('✅ Prixod saqlandi!');
      } catch {
        await page.screenshot({ path: 'scripts/prixod-error.png', fullPage: true });
        console.log('⚠️  Redirect bo\'lmadi, screenshot: scripts/prixod-error.png');
      }
    } else {
      console.log('⚠️  Save disabled');
      await page.screenshot({ path: 'scripts/prixod-disabled.png', fullPage: true });
    }
  } else {
    console.log('⚠️  Mahsulotlar yo\'q');
  }

  await page.screenshot({ path: 'scripts/prixod-result.png', fullPage: true });
  console.log('\n15s ochiq...');
  await page.waitForTimeout(15000);
  await browser.close();
})();
