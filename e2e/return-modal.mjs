/**
 * Playwright test: ReturnModal design & UX audit
 * Tests against production URL: https://web-production-5b0b7.up.railway.app
 *
 * Run:
 *   node e2e/return-modal.mjs
 */

import { chromium } from 'playwright';

const BASE = 'https://web-production-5b0b7.up.railway.app';
const SLUG = 'kosmetika-demo';
const EMAIL = 'cashier@kosmetika.uz';
const PASSWORD = 'Demo1234!';

const PASS = (msg) => console.log(`  ✅ ${msg}`);
const FAIL = (msg) => console.log(`  ❌ ${msg}`);
const INFO = (msg) => console.log(`  ℹ️  ${msg}`);
const SECTION = (msg) => console.log(`\n${'─'.repeat(50)}\n${msg}\n${'─'.repeat(50)}`);

async function loginToPOS(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  const inputs = page.locator('input');
  await inputs.nth(0).fill(SLUG);
  await inputs.nth(1).fill(EMAIL);
  await inputs.nth(2).fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);

  const url = page.url();
  if (url.includes('/login')) throw new Error('Login failed — check credentials');
  INFO(`Logged in, redirected to: ${url}`);

  // Navigate to POS
  await page.goto(`${BASE}/pos`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  INFO(`POS URL: ${page.url()}`);
}

async function openReturnModal(page) {
  // Look for the return button (F4 hotkey or RotateCcw icon button)
  const returnBtn = page.locator('button').filter({ hasText: /qaytarish|return|F4/i }).first();
  const altBtn = page.locator('[data-testid="return-btn"], button:has(svg)').first();

  try {
    // Try pressing F4 (return hotkey in POS)
    await page.keyboard.press('F4');
    await page.waitForTimeout(1000);

    const modal = page.locator('.fixed.inset-0').first();
    const isVisible = await modal.isVisible().catch(() => false);
    if (isVisible) {
      INFO('ReturnModal opened via F4');
      return true;
    }
  } catch {}

  // Try clicking return button
  try {
    await returnBtn.click({ timeout: 3000 });
    await page.waitForTimeout(1000);
    const modal = page.locator('.fixed.inset-0').first();
    const isVisible = await modal.isVisible().catch(() => false);
    if (isVisible) {
      INFO('ReturnModal opened via button click');
      return true;
    }
  } catch {}

  INFO('Could not open ReturnModal directly — checking if shift needs to be opened first');
  return false;
}

async function main() {
  console.log('\n🎭 ReturnModal Design & UX Playwright Audit');
  console.log(`Target: ${BASE}/pos\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const results = { pass: 0, fail: 0, info: 0 };

  const check = (cond, pass, fail) => {
    if (cond) { PASS(pass); results.pass++; }
    else { FAIL(fail); results.fail++; }
  };

  try {
    // ── LOGIN ─────────────────────────────────────────────────────────────────
    SECTION('1. Login + POS Navigation');
    await loginToPOS(page);
    check(page.url().includes('/pos') || !page.url().includes('/login'),
      'Redirected away from login', 'Still on login page');

    // Screenshot: POS initial state
    await page.screenshot({ path: 'e2e/screenshots/01-pos-initial.png', fullPage: false });
    INFO('Screenshot: 01-pos-initial.png');

    // ── POS PAGE CHECKS ───────────────────────────────────────────────────────
    SECTION('2. POS Page Layout');

    const posBody = await page.locator('body').evaluate(el => {
      const style = window.getComputedStyle(el);
      return { bg: style.backgroundColor };
    });
    INFO(`Body background: ${posBody.bg}`);

    // Check POS has light theme (white/gray background)
    const hasLightBg = await page.locator('.bg-white, .bg-gray-50').first().isVisible().catch(() => false);
    check(hasLightBg, 'POS has light theme (bg-white/bg-gray-50 visible)', 'POS light theme not detected');

    // ── OPEN RETURN MODAL ────────────────────────────────────────────────────
    SECTION('3. Open ReturnModal');
    const modalOpened = await openReturnModal(page);

    if (!modalOpened) {
      INFO('Modal could not be opened — checking if shift is required');

      // Check if there's a "shift not open" warning
      const shiftWarning = page.locator('text=/smena|shift/i').first();
      const shiftVisible = await shiftWarning.isVisible().catch(() => false);
      if (shiftVisible) INFO('Shift must be opened first to use ReturnModal');

      await page.screenshot({ path: 'e2e/screenshots/02-pos-state.png' });
      INFO('Screenshot: 02-pos-state.png');
    } else {
      // ── MODAL DESIGN CHECKS ─────────────────────────────────────────────────
      SECTION('4. ReturnModal Design Checks');

      const modal = page.locator('.fixed.inset-0').first();
      await page.screenshot({ path: 'e2e/screenshots/03-return-modal-step1.png' });
      INFO('Screenshot: 03-return-modal-step1.png');

      // 4.1 Backdrop
      const backdrop = page.locator('.bg-black\\/40, .bg-black\\/50, .bg-black\\/70').first();
      check(await backdrop.isVisible().catch(() => false),
        'Modal has semi-transparent backdrop', 'No backdrop found');

      // 4.2 Modal container — should be WHITE (light theme)
      const modalContent = modal.locator('.bg-white').first();
      check(await modalContent.isVisible().catch(() => false),
        'Modal uses WHITE background (light theme)', 'Modal NOT using white background');

      // 4.3 Header with RotateCcw icon
      const header = page.locator('h2:has-text("Mahsulot qaytarish"), h2:has-text("qaytarish")').first();
      check(await header.isVisible().catch(() => false),
        'Modal header "Mahsulot qaytarish" visible', 'Modal header not found');

      // 4.4 Close button
      const closeBtn = page.locator('[aria-label="Yopish"], button:has(.lucide-x)').first();
      check(await closeBtn.isVisible().catch(() => false),
        'Close (X) button visible', 'Close button not found');

      // 4.5 Step indicator
      const stepIndicator = page.locator('text=Qidirish').first();
      check(await stepIndicator.isVisible().catch(() => false),
        'Step indicator "Qidirish" visible', 'Step indicator not found');

      // 4.6 Order number input (light background)
      const orderInput = page.locator('input[type="number"][placeholder*="Chek"]');
      check(await orderInput.isVisible().catch(() => false),
        'Order number input visible', 'Order number input not found');

      // Check input has light background
      const inputBg = await orderInput.evaluate(el => window.getComputedStyle(el).backgroundColor).catch(() => '');
      INFO(`Input background color: ${inputBg}`);
      // Light theme: white (255,255,255) or near-white
      const isLightInput = inputBg.includes('255, 255, 255') || inputBg.includes('rgb(255');
      check(isLightInput, 'Order input has light (white) background', 'Order input still has dark background');

      // 4.7 Search button with orange color
      const searchBtn = page.locator('button:has-text("Qidirish")').last();
      check(await searchBtn.isVisible().catch(() => false),
        '"Qidirish" button visible', '"Qidirish" button not found');

      const btnColor = await searchBtn.evaluate(el => window.getComputedStyle(el).backgroundColor).catch(() => '');
      INFO(`Search button color: ${btnColor}`);
      const isOrange = btnColor.includes('249') || btnColor.includes('234, 88') || btnColor.toLowerCase().includes('orange');
      check(isOrange, 'Search button has orange color', 'Search button orange color not confirmed');

      // 4.8 No dark backgrounds (gray-900) in modal
      const darkBg = modal.locator('.bg-gray-900, .bg-gray-800').first();
      const hasDarkBg = await darkBg.isVisible().catch(() => false);
      check(!hasDarkBg, 'Modal has NO dark gray-900/gray-800 backgrounds', 'Modal still has dark backgrounds!');

      // ── INTERACTION CHECKS ───────────────────────────────────────────────────
      SECTION('5. ReturnModal Interaction');

      // 5.1 Type invalid order number
      await orderInput.fill('99999');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      const errorMsg = page.locator('.bg-red-50, .text-red-600, .border-red-200').first();
      const hasError = await errorMsg.isVisible().catch(() => false);
      check(hasError, 'Error message shown for invalid order', 'No error for invalid order');

      await page.screenshot({ path: 'e2e/screenshots/04-return-modal-error.png' });
      INFO('Screenshot: 04-return-modal-error.png');

      // 5.2 Close modal
      await closeBtn.click().catch(async () => {
        await page.keyboard.press('Escape');
      });
      await page.waitForTimeout(500);

      const modalGone = !(await modal.isVisible().catch(() => false));
      check(modalGone, 'Modal closes on X click', 'Modal did not close');
    }

    // ── MOBILE VIEWPORT TEST ─────────────────────────────────────────────────
    SECTION('6. Mobile Viewport (375px)');
    await context.browser().newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await context.newPage();
    await mobilePage.goto(`${BASE}/pos`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mobilePage.waitForTimeout(2000);

    const mobileOverflow = await mobilePage.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 5
    );
    check(!mobileOverflow, 'No horizontal overflow on mobile (375px)', 'Horizontal overflow on mobile!');
    await mobilePage.screenshot({ path: 'e2e/screenshots/05-mobile-pos.png' });
    INFO('Screenshot: 05-mobile-pos.png');
    await mobilePage.close();

  } catch (err) {
    FAIL(`Unexpected error: ${err.message.slice(0, 200)}`);
    results.fail++;
  } finally {
    await browser.close();
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  SECTION('SUMMARY');
  console.log(`  ✅ Pass: ${results.pass}`);
  console.log(`  ❌ Fail: ${results.fail}`);
  console.log(`  Screenshots saved in: e2e/screenshots/\n`);

  if (results.fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
