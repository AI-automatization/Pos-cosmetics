/**
 * RAOS Warehouse Audit — Playwright script
 * Run: node warehouse-audit.mjs
 */

import { chromium } from 'playwright';

const BASE  = 'http://localhost:3001';
const CREDS = { email: 'warehouse@kosmetika.uz', password: 'Demo1234!', slug: 'kosmetika-demo' };

const results = [];

function row(page, api, status, problem, fix) {
  results.push({ page, api, status: String(status), problem, fix });
}

function printTable() {
  const cols = ['Sahifa', "API so'rov", 'Status', 'Muammo', 'Natija'];
  const rows = results.map((r) => [r.page, r.api, r.status, r.problem, r.fix]);
  const widths = cols.map((c, i) =>
    Math.max(c.length, ...rows.map((r) => (r[i] || '').length)),
  );
  const line = (cells) =>
    '| ' + cells.map((c, i) => (c || '').padEnd(widths[i])).join(' | ') + ' |';
  const sep = '+-' + widths.map((w) => '-'.repeat(w)).join('-+-') + '-+';
  console.log('\n' + sep);
  console.log(line(cols));
  console.log(sep);
  rows.forEach((r) => console.log(line(r)));
  console.log(sep + '\n');
}

async function captureRequests(pg, url, waitMs = 4500) {
  const captured = {};
  const handler = (response) => {
    const u = response.url();
    const m = u.match(/\/api\/v1(\/[^?#]*)/);
    if (m) {
      const path = m[1];
      if (!captured[path]) captured[path] = { status: response.status(), url: u };
    }
  };
  pg.on('response', handler);
  await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await pg.waitForTimeout(waitMs);
  pg.off('response', handler);
  return captured;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const pg = await context.newPage();

  // ── 1. LOGIN ─────────────────────────────────────────────────────────────────
  console.log('\n[1/3] Login qilinmoqda…');

  await pg.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });

  await pg.fill('input[autocomplete="organization"]', CREDS.slug);
  await pg.fill('input[type="email"]', CREDS.email);
  await pg.fill('input[type="password"]', CREDS.password);
  await pg.click('button[type="submit"]');

  // Next.js SPA — router.push() doesn't trigger full navigation
  // Wait enough time for auth/login + auth/me + cookie set + router.push
  await pg.waitForTimeout(10000);

  const afterLoginUrl = pg.url();
  console.log('  Redirect URL:', afterLoginUrl);

  const redirectedToWarehouse = afterLoginUrl.includes('/warehouse');
  row(
    '/login → /warehouse',
    'POST /auth/login',
    redirectedToWarehouse ? 200 : 'FAIL',
    redirectedToWarehouse ? '' : `Kutilgan /warehouse, lekin: ${afterLoginUrl}`,
    redirectedToWarehouse ? 'OK' : 'middleware.ts / useAuth.ts tekshirish',
  );

  if (!redirectedToWarehouse) {
    const errText = await pg.evaluate(() => {
      const errs = [...document.querySelectorAll('[class*="red"], [class*="error"]')];
      return errs.map((e) => e.textContent?.trim()).filter(Boolean).join(' | ');
    });
    console.log('  Xato matni:', errText || '(topilmadi)');
    printTable();
    await browser.close();
    process.exit(1);
  }
  console.log('  Login muvaffaqiyatli ✓');

  // ── 2. WAREHOUSE PAGES ────────────────────────────────────────────────────────
  console.log('\n[2/3] Warehouse sahifalari…');

  const PAGES = [
    {
      path: '/warehouse',
      label: '/warehouse',
      expectedApis: ['/warehouse/dashboard', '/warehouse/alerts'],
    },
    {
      path: '/warehouse/stock-in',
      label: '/warehouse/stock-in',
      expectedApis: ['/catalog/products', '/catalog/suppliers'],
    },
    {
      path: '/warehouse/invoices',
      label: '/warehouse/invoices',
      expectedApis: ['/warehouse/invoices'],
    },
    {
      path: '/warehouse/write-off',
      label: '/warehouse/write-off',
      expectedApis: ['/catalog/products'],
    },
    {
      path: '/warehouse/expiry',
      label: '/warehouse/expiry',
      expectedApis: ['/warehouse/alerts'],
    },
    {
      path: '/warehouse/low-stock',
      label: '/warehouse/low-stock',
      expectedApis: ['/inventory/levels'],
    },
    {
      path: '/warehouse/history',
      label: '/warehouse/history',
      expectedApis: ['/warehouse/movements'],
    },
  ];

  for (const spec of PAGES) {
    console.log(`\n  ${spec.path}`);
    const captured = await captureRequests(pg, `${BASE}${spec.path}`, 4500);

    const capturedKeys = Object.keys(captured);
    console.log(`    API so'rovlar: ${capturedKeys.length > 0 ? capturedKeys.join(', ') : '(yo\'q)'}`);

    for (const apiPath of spec.expectedApis) {
      const matchKey = capturedKeys.find((k) => k.startsWith(apiPath));
      const status   = matchKey ? captured[matchKey].status : 'NO_REQ';

      let problem = '';
      let fix     = 'OK';

      if (status === 'NO_REQ') {
        problem = "So'rov yuborilmadi";
        fix = 'Hook/API mapping tekshirish';
      } else if (status === 403) {
        problem = '403 — WAREHOUSE roli ruxsat yoq';
        fix = "@Roles ga 'WAREHOUSE' qo'shish";
      } else if (status === 404) {
        problem = '404 — endpoint topilmadi';
        fix = 'Controller URL tekshirish';
      } else if (status >= 500) {
        problem = `${status} server xatosi`;
        fix = 'Backend loglarni tekshirish';
      } else if (status === 401) {
        problem = '401 — token xato';
        fix = 'apiClient interceptor tekshirish';
      }

      row(spec.label, `GET ${apiPath}`, status, problem, fix);
      const icon = (!problem) ? '✓' : '⚠';
      console.log(`    ${icon} GET ${apiPath} → ${status}${problem ? '  →  ' + problem : ''}`);
    }

    // scroll check on list pages
    const hasScroll = await pg.evaluate(() =>
      document.querySelectorAll('.overflow-y-auto, .overflow-auto, .overflow-x-auto').length > 0,
    );
    if (!hasScroll) {
      row(spec.label, 'SCROLL', 'MISSING', "overflow-y-auto yo'q", "overflow-y-auto qo'shish kerak");
      console.log(`    ⚠ overflow-y-auto yo'q`);
    }
  }

  // ── 3. FORBIDDEN ENDPOINTS ───────────────────────────────────────────────────
  console.log('\n[3/3] Taqiqlangan endpointlar…');

  const token = await pg.evaluate(() => localStorage.getItem('access_token'));
  if (!token) {
    console.error('  access_token topilmadi!');
  } else {
    const FORBIDDEN = [
      { path: '/api/v1/sales/orders',     label: 'GET /sales/orders' },
      { path: '/api/v1/nasiya',           label: 'GET /nasiya' },
      { path: '/api/v1/finance/expenses', label: 'GET /finance/expenses' },
      { path: '/api/v1/users',            label: 'GET /users (settings/users)' },
    ];

    for (const spec of FORBIDDEN) {
      const status = await pg.evaluate(
        async ({ path, tok }) => {
          try {
            const r = await fetch(path, { headers: { Authorization: `Bearer ${tok}` } });
            return r.status;
          } catch { return 'ERR'; }
        },
        { path: spec.path, tok: token },
      );

      const ok = status === 403;
      row(
        'SECURITY',
        spec.label,
        status,
        ok ? '' : `${status} qaytdi — 403 bo'lishi kerak!`,
        ok ? 'OK — 403 ✓' : "@Roles qo'shish kerak",
      );
      console.log(`  ${ok ? '✓' : '❌'} ${spec.label} → ${status}`);
    }
  }

  // ── PRINT TABLE ───────────────────────────────────────────────────────────────
  printTable();

  const failures = results.filter((r) => r.problem !== '');
  if (failures.length === 0) {
    console.log('✓ Barcha testlar muvaffaqiyatli!\n');
  } else {
    console.log(`${failures.length} ta muammo topildi:\n`);
    failures.forEach((r) =>
      console.log(`  [${r.page}] ${r.api} → ${r.problem}  →  Tuzatish: ${r.fix}`),
    );
    console.log();
  }

  await browser.close();
})().catch((err) => {
  console.error('Playwright xatosi:', err.message);
  process.exit(1);
});
