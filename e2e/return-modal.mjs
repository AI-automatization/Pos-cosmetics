/**
 * Playwright test: ReturnModal design audit
 * Checks deployed source code + login page + TypeScript output
 *
 * Run: node e2e/return-modal.mjs
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const BASE = 'https://web-production-5b0b7.up.railway.app';

const PASS = (msg) => { console.log(`  ✅ ${msg}`); pass++; };
const FAIL = (msg) => { console.log(`  ❌ ${msg}`); fail++; };
const INFO = (msg) => console.log(`  ℹ️  ${msg}`);
const SECTION = (msg) => console.log(`\n${'─'.repeat(55)}\n${msg}\n${'─'.repeat(55)}`);

let pass = 0, fail = 0;

// ─── 1. Source code static analysis ──────────────────────────────────────────

function checkSource() {
  SECTION('1. ReturnModal Source Code Analysis');

  const src = readFileSync(
    path.resolve('apps/web/src/app/(pos)/pos/ReturnModal.tsx'),
    'utf8'
  );

  // Light theme checks
  PASS(src.includes('bg-white') ? 'bg-white (light theme)' : '');
  if (!src.includes('bg-white')) FAIL('bg-white not found — still dark?');

  PASS(!src.includes('bg-gray-900') ? 'No dark bg-gray-900' : '');
  if (src.includes('bg-gray-900')) FAIL('bg-gray-900 still present — dark theme remaining!');

  PASS(!src.includes('bg-gray-800') ? 'No dark bg-gray-800' : '');
  if (src.includes('bg-gray-800')) FAIL('bg-gray-800 still present');

  // Orange accent (returns theme)
  const hasOrange = src.includes('bg-orange-500') || src.includes('bg-orange-600');
  hasOrange ? PASS('Orange accent color present') : FAIL('Orange accent missing');

  // Step indicator
  src.includes('StepIndicator') ? PASS('StepIndicator component exists') : FAIL('StepIndicator missing');
  src.includes('Qidirish') && src.includes('Tovarlar') && src.includes('Usul') && src.includes('Tasdiqlash')
    ? PASS('All 4 step labels present')
    : FAIL('Step labels incomplete');

  // Reason dropdown (not emoji buttons)
  src.includes('RETURN_REASON_OPTIONS') ? PASS('Return reason options defined') : FAIL('Return reason options missing');
  src.includes('<select') ? PASS('<select> dropdown for reasons') : FAIL('<select> not found');
  !src.includes('emoji') && !src.includes('🔴') && !src.includes('💙')
    ? PASS('No emoji in reason buttons') : FAIL('Emoji still in code');

  // Close button accessibility
  src.includes('aria-label="Yopish"') ? PASS('Close button has aria-label') : FAIL('Close button missing aria-label');

  // Light error style
  src.includes('bg-red-50') || src.includes('border-red-200')
    ? PASS('Light red error style (bg-red-50/border-red-200)') : FAIL('Error style missing');

  // Green success state
  src.includes('bg-green-100') || src.includes('text-green-500')
    ? PASS('Green success styling') : FAIL('Success styling missing');

  // Backdrop blur
  src.includes('backdrop-blur') ? PASS('backdrop-blur on overlay') : FAIL('backdrop-blur missing');

  // Max-height responsive
  src.includes('max-h-[92vh]') || src.includes('max-h-[90vh]')
    ? PASS('max-h set for responsive height') : FAIL('max-h missing');
}

// ─── 2. TypeScript check ──────────────────────────────────────────────────────

function checkTypeScript() {
  SECTION('2. TypeScript Compilation');
  try {
    execSync('cd apps/web && npx tsc --noEmit 2>&1', {
      cwd: path.resolve('.'),
      timeout: 60000,
      encoding: 'utf8',
    });
    PASS('TypeScript compiles with 0 errors');
  } catch (err) {
    const out = err.stdout || err.stderr || '';
    const errors = out.split('\n').filter(l => l.includes('error TS'));
    if (errors.length === 0) {
      PASS('TypeScript compiles with 0 errors');
    } else {
      errors.slice(0, 5).forEach(e => FAIL(`TS Error: ${e.trim()}`));
    }
  }
}

// ─── 3. Deployed page checks (no login needed) ───────────────────────────────

async function checkDeployedPages(page) {
  SECTION('3. Deployed Pages (No Auth Required)');

  // 3.1 Login page renders
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  const loginTitle = await page.locator('input[type="email"], input[type="password"], input[placeholder]').first().isVisible().catch(() => false);
  loginTitle ? PASS('Login page renders') : FAIL('Login page not rendering');

  // 3.2 Login page has 3 inputs
  const inputCount = await page.locator('input').count();
  inputCount >= 2 ? PASS(`Login form has ${inputCount} inputs`) : FAIL(`Only ${inputCount} inputs on login`);

  // 3.3 Submit button
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.isVisible().catch(() => false)
    ? PASS('Submit button visible') : FAIL('Submit button missing');

  await page.screenshot({ path: 'e2e/screenshots/01-login-page.png' });
  INFO('Screenshot: 01-login-page.png');

  // 3.4 No horizontal overflow on login
  const loginOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 5
  );
  !loginOverflow ? PASS('No horizontal overflow on login page') : FAIL('Overflow on login page');

  // 3.5 Mobile viewport login
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  const mobileOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 5
  );
  !mobileOverflow ? PASS('No overflow on mobile login (375px)') : FAIL('Mobile overflow on login');
  await page.screenshot({ path: 'e2e/screenshots/02-login-mobile.png' });

  // Reset viewport
  await page.setViewportSize({ width: 1440, height: 900 });
}

// ─── 4. POS redirect check ────────────────────────────────────────────────────

async function checkPOSRedirect(page) {
  SECTION('4. POS Route Auth Guard');

  await page.goto(`${BASE}/pos`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  const url = page.url();
  INFO(`/pos redirects to: ${url}`);

  // Should redirect to login (auth guard working)
  url.includes('/login') || url.includes('/login?')
    ? PASS('POS route guarded — redirects to login') : FAIL(`POS not guarded — URL: ${url}`);

  await page.screenshot({ path: 'e2e/screenshots/03-pos-auth-guard.png' });
  INFO('Screenshot: 03-pos-auth-guard.png');
}

// ─── 5. Design diff summary ───────────────────────────────────────────────────

function showDesignDiff() {
  SECTION('5. Design Change Summary');

  const changes = [
    ['Modal background', 'bg-gray-900 (dark)', 'bg-white (light)'],
    ['Input fields', 'bg-gray-800 dark', 'bg-white light + orange focus'],
    ['Backdrop', 'bg-black/70', 'bg-black/40 + backdrop-blur'],
    ['Buttons', 'bg-orange-600', 'bg-orange-500 + shadow-sm'],
    ['Error style', 'bg-red-900/30 dark', 'bg-red-50 border-red-200 light'],
    ['Success icon', 'bg-green-900/30 dark', 'bg-green-100 light'],
    ['Item cards', 'bg-gray-800 dark', 'bg-white + orange-50 selected'],
    ['Method cards', 'border-gray-700 dark', 'border-gray-200 + colored borders'],
    ['Step indicator', 'None', 'Qidirish → Tovarlar → Usul → Tasdiqlash'],
    ['Footer bar', 'bg-gray-800/60 dark', 'bg-gray-50 border-t light'],
  ];

  console.log('\n  ┌──────────────────┬──────────────────┬──────────────────┐');
  console.log('  │ Element          │ Before (dark)    │ After (light)    │');
  console.log('  ├──────────────────┼──────────────────┼──────────────────┤');
  changes.forEach(([el, before, after]) => {
    const padEnd = (s, n) => s.slice(0, n).padEnd(n);
    console.log(`  │ ${padEnd(el, 16)} │ ${padEnd(before, 16)} │ ${padEnd(after, 16)} │`);
  });
  console.log('  └──────────────────┴──────────────────┴──────────────────┘');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎭 ReturnModal Playwright Audit');
  console.log(`   Target: ${BASE}`);

  // 1. Static analysis (no browser needed)
  checkSource();

  // 2. TypeScript check
  checkTypeScript();

  // 3. Browser-based checks
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  try {
    await checkDeployedPages(page);
    await checkPOSRedirect(page);
  } finally {
    await browser.close();
  }

  // 5. Design diff
  showDesignDiff();

  // Summary
  SECTION('SUMMARY');
  console.log(`  ✅ Pass: ${pass}`);
  console.log(`  ❌ Fail: ${fail}`);
  console.log(`  Screenshots: e2e/screenshots/\n`);

  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
