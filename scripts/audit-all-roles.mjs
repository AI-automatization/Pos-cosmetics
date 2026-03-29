/**
 * RAOS — Full Role Audit (Playwright)
 * Roles: MANAGER, CASHIER, WAREHOUSE
 * Output: /tmp/audit-result.json
 *
 * Usage: node scripts/audit-all-roles.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE   = 'https://web-production-5b0b7.up.railway.app';
const OUTPUT = '/tmp/audit-result.json';

const ROLES = [
  {
    name: 'MANAGER',
    email: 'manager@kosmetika.uz',
    password: 'Demo1234!',
    slug: 'kosmetika-demo',
    expectedRedirect: '/dashboard',
    pages: [
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
    ],
  },
  {
    name: 'CASHIER',
    email: 'cashier@kosmetika.uz',
    password: 'Demo1234!',
    slug: 'kosmetika-demo',
    expectedRedirect: '/pos',
    pages: ['/pos'],
  },
  {
    name: 'WAREHOUSE',
    email: 'warehouse@kosmetika.uz',
    password: 'Demo1234!',
    slug: 'kosmetika-demo',
    expectedRedirect: '/warehouse',
    pages: [
      '/warehouse',
      '/warehouse/stock-in',
      '/warehouse/invoices',
      '/warehouse/write-off',
      '/warehouse/expiry',
      '/warehouse/low-stock',
      '/warehouse/history',
    ],
  },
];

function shortUrl(url) {
  const idx = url.indexOf('/api/v1/');
  return idx >= 0 ? url.slice(idx) : url;
}

async function loginAs(browser, role) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page    = await context.newPage();

  console.error(`\n[${role.name}] Logging in as ${role.email}...`);

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Fill login form
  const inputs = page.locator('input');
  const count  = await inputs.count();

  if (count >= 3) {
    await inputs.nth(0).fill(role.slug);
    await inputs.nth(1).fill(role.email);
    await inputs.nth(2).fill(role.password);
  } else if (count === 2) {
    await inputs.nth(0).fill(role.email);
    await inputs.nth(1).fill(role.password);
  }

  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(6000);

  const afterUrl = page.url();
  console.error(`[${role.name}] After login: ${afterUrl}`);

  const loginOk = !afterUrl.includes('/login');
  if (!loginOk) {
    const errText = await page.evaluate(() => {
      const els = [...document.querySelectorAll('[class*="red"],[class*="error"],[class*="danger"],[role="alert"]')];
      return els.map(e => e.textContent?.trim()).filter(Boolean).join(' | ');
    });
    console.error(`[${role.name}] LOGIN FAILED — ${errText || 'no error text found'}`);
    await context.close();
    return null;
  }

  console.error(`[${role.name}] Login OK → ${afterUrl}`);
  return { context, page, loginRedirect: afterUrl };
}

async function auditPage(page, route, role) {
  const pageRequests = [];
  const pageErrors   = [];

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

  page.on('request',       reqHandler);
  page.on('response',      resHandler);
  page.on('requestfailed', failHandler);

  const result = {
    role:           role.name,
    page:           route,
    redirectedToLogin: false,
    requests:       [],
    networkErrors:  [],
    dashDashCount:  0,
    dashDashSamples:[],
    emptyPage:      false,
    overflowX:      false,
    error:          null,
  };

  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(2000);

    result.redirectedToLogin = page.url().includes('/login');

    // Detect "--" (unmapped/empty values)
    const dashDash = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const found  = new Set();
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() === '--') {
          const p = node.parentElement;
          if (p) found.add(p.tagName + (p.className ? '.' + [...p.classList].slice(0, 3).join('.') : ''));
        }
      }
      return [...found].slice(0, 15);
    });

    // Detect empty page: no meaningful content (tables/cards/forms empty)
    const emptyPage = await page.evaluate(() => {
      const body = document.body.innerText || '';
      // If page has loading spinner or error state still showing
      const hasTable  = document.querySelector('table tbody tr') !== null;
      const hasCards  = document.querySelectorAll('[class*="card"],[class*="Card"]').length > 0;
      const hasForm   = document.querySelector('form') !== null;
      const mainText  = body.replace(/\s+/g, ' ').trim().length;
      return mainText < 50 || (!hasTable && !hasCards && !hasForm && mainText < 200);
    });

    result.overflowX      = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 5
    );
    result.dashDashCount  = dashDash.length;
    result.dashDashSamples= dashDash;
    result.emptyPage      = emptyPage;
    result.requests       = pageRequests;
    result.networkErrors  = pageErrors;

    // Screenshot for non-200 or empty pages
    const hasErrors = pageRequests.some(r => r.status && r.status !== 200 && r.status !== 304);
    if (hasErrors || emptyPage || result.redirectedToLogin) {
      console.error(`  [${role.name}] ${route} ← PROBLEM: errors=${hasErrors} empty=${emptyPage} loginRedirect=${result.redirectedToLogin}`);
    } else {
      console.error(`  [${role.name}] ${route} ✓`);
    }

  } catch (err) {
    result.error    = err.message.slice(0, 200);
    result.requests = pageRequests;
    result.networkErrors = pageErrors;
    console.error(`  [${role.name}] ${route} ERROR: ${result.error}`);
  }

  page.removeListener('request',       reqHandler);
  page.removeListener('response',      resHandler);
  page.removeListener('requestfailed', failHandler);

  return result;
}

async function main() {
  const browser     = await chromium.launch({ headless: true });
  const allResults  = [];

  for (const role of ROLES) {
    const session = await loginAs(browser, role);

    const roleResult = {
      role:      role.name,
      loginOk:   session !== null,
      loginUrl:  session?.loginRedirect ?? null,
      pages:     [],
    };

    if (!session) {
      allResults.push(roleResult);
      continue;
    }

    const { context, page } = session;

    for (const route of role.pages) {
      const r = await auditPage(page, route, role);
      roleResult.pages.push(r);
    }

    await context.close();
    allResults.push(roleResult);
  }

  await browser.close();

  // Write JSON
  writeFileSync(OUTPUT, JSON.stringify(allResults, null, 2));
  console.error(`\nResults saved to ${OUTPUT}`);

  // Print summary
  let totalPages   = 0;
  let totalErrors  = 0;
  let totalEmpty   = 0;
  let totalDash    = 0;

  for (const role of allResults) {
    console.error(`\n── ${role.role} (login: ${role.loginOk ? 'OK' : 'FAIL'}) ──`);
    for (const pg of role.pages) {
      totalPages++;
      const badReqs   = (pg.requests || []).filter(r => r.status && r.status !== 200 && r.status !== 304);
      const isOk      = !pg.error && !pg.redirectedToLogin && badReqs.length === 0 && !pg.emptyPage;
      const icon      = isOk ? '✓' : '✗';
      if (!isOk) {
        totalErrors++;
        const reasons = [];
        if (pg.redirectedToLogin)  reasons.push('→LOGIN');
        if (pg.error)              reasons.push(`ERR:${pg.error.slice(0,60)}`);
        if (pg.emptyPage)          { reasons.push('EMPTY'); totalEmpty++; }
        badReqs.forEach(r => reasons.push(`${r.status} ${r.url}`));
        console.error(`  ${icon} ${pg.page}  [${reasons.join(' | ')}]`);
      } else {
        console.error(`  ${icon} ${pg.page}`);
      }
      if (pg.dashDashCount > 0)    { totalDash++; console.error(`     ⚠ "--" x${pg.dashDashCount}: ${pg.dashDashSamples.join(', ')}`); }
    }
  }

  console.error(`\n═══════════════════════════════════════`);
  console.error(`Total pages: ${totalPages} | Errors: ${totalErrors} | Empty: ${totalEmpty} | "--" pages: ${totalDash}`);
  console.error(`═══════════════════════════════════════`);

  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
