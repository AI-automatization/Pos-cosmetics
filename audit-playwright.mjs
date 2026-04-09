// Playwright full-page audit: login + intercept all API requests
import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';
const EMAIL = 'owner@kosmetika.uz';
const PASSWORD = 'Demo1234!';
const SLUG = 'kosmetika-demo';

const PAGES = [
  '/dashboard',
  '/catalog/products',
  '/catalog/categories',
  '/catalog/suppliers',
  '/inventory',
  '/inventory/movements',
  '/inventory/expiry',
  '/inventory/low-stock',
  '/sales/orders',
  '/sales/returns',
  '/sales/shifts',
  '/payments/history',
  '/finance/expenses',
  '/reports/daily-revenue',
  '/reports/top-products',
  '/customers',
  '/nasiya',
  '/nasiya/aging',
  '/analytics',
  '/promotions',
  '/exchange-rates',
  '/settings/users',
  '/settings/billing',
  '/settings/audit-log',
];

function shortUrl(url) {
  const idx = url.indexOf('/api/v1/');
  return idx >= 0 ? url.slice(idx) : url;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  // ── 1. LOGIN ─────────────────────────────────────────────────────────────────
  console.error('=== LOGGING IN ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  const inputs = page.locator('input');
  await inputs.nth(0).fill(SLUG);
  await inputs.nth(1).fill(EMAIL);
  await inputs.nth(2).fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);

  const afterLoginUrl = page.url();
  console.error('After login URL:', afterLoginUrl);
  if (afterLoginUrl.includes('/login')) {
    console.error('LOGIN FAILED');
    await browser.close();
    process.exit(1);
  }

  // ── 2. AUDIT EACH PAGE ────────────────────────────────────────────────────────
  const results = [];

  for (const route of PAGES) {
    console.error('Testing:', route);
    const pageRequests = [];
    const pageErrors = [];

    const reqHandler = (req) => {
      if (req.url().includes('/api/v1/')) {
        pageRequests.push({ url: shortUrl(req.url()), method: req.method(), status: null, ok: null });
      }
    };
    const resHandler = (res) => {
      if (res.url().includes('/api/v1/')) {
        const short = shortUrl(res.url());
        const entry = [...pageRequests].reverse().find(r => r.url === short && r.status === null);
        if (entry) { entry.status = res.status(); entry.ok = res.ok(); }
      }
    };
    const failHandler = (req) => {
      if (req.url().includes('/api/v1/')) pageErrors.push(shortUrl(req.url()));
    };

    page.on('request', reqHandler);
    page.on('response', resHandler);
    page.on('requestfailed', failHandler);

    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);

      // Detect "--" text (empty/unmapped values)
      const dashDash = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const found = new Set();
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent.trim() === '--') {
            const p = node.parentElement;
            if (p) found.add(p.tagName + (p.className ? '.' + [...p.classList].slice(0,3).join('.') : ''));
          }
        }
        return [...found].slice(0, 15);
      });

      // Horizontal overflow check
      const overflowX = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );

      results.push({
        page: route,
        redirectedToLogin: page.url().includes('/login'),
        requests: pageRequests,
        networkErrors: pageErrors,
        dashDashCount: dashDash.length,
        dashDashSamples: dashDash,
        overflowX,
      });
    } catch (err) {
      results.push({
        page: route,
        error: err.message.slice(0, 150),
        requests: pageRequests,
        networkErrors: pageErrors,
        dashDashCount: 0,
        dashDashSamples: [],
        overflowX: false,
      });
    }

    page.removeListener('request', reqHandler);
    page.removeListener('response', resHandler);
    page.removeListener('requestfailed', failHandler);
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
