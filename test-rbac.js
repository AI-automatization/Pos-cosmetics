const { chromium } = require('playwright');

const BASE = 'http://localhost:3001';
const API  = 'http://localhost:3000/api/v1';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
async function loginViaAPI(email, password, slug) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, slug }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  return (await res.json()).accessToken;
}

async function apiCheck(token, method, path) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status;
}

async function setupPage(browser, token, role) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Set localStorage + cookies before navigation
  await page.goto(BASE + '/login');
  await page.evaluate(({ token, role }) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', 'dummy');
    document.cookie = `session_active=1; path=/`;
    document.cookie = `user_role=${role}; path=/`;
  }, { token, role });

  return { ctx, page };
}

async function visitPage(page, path, apiPatterns) {
  const captured = [];

  const handler = (req) => {
    const u = req.url();
    if (u.includes('/api/v1') || u.includes('localhost:3000')) {
      const short = u.replace(/.*\/api\/v1/, '');
      captured.push({ url: short, method: req.method() });
    }
  };
  page.on('request', handler);

  const responses = {};
  const respHandler = (res) => {
    const u = res.url();
    if (u.includes('/api/v1') || u.includes('localhost:3000')) {
      const short = u.replace(/.*\/api\/v1/, '').split('?')[0];
      responses[short] = res.status();
    }
  };
  page.on('response', respHandler);

  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  page.off('request', handler);
  page.off('response', respHandler);

  return { captured, responses };
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
(async () => {
  const results = [];
  const log = (role, page, api, status, issue, fixed) => {
    results.push({ role, page, api, status, issue, fixed: fixed || '' });
    const icon = issue ? '❌' : '✅';
    console.log(`${icon} [${role}] ${page} | ${api} → ${status}${issue ? ' | ' + issue : ''}${fixed ? ' → ' + fixed : ''}`);
  };

  const browser = await chromium.launch({ headless: true });

  // ════════════════════════════════════════════
  // MANAGER
  // ════════════════════════════════════════════
  console.log('\n═══════════ MANAGER ═══════════');
  let mgrToken;
  try {
    mgrToken = await loginViaAPI('manager@kosmetika.uz', 'Demo1234!', 'kosmetika-demo');
    console.log('✅ Login OK');
  } catch (e) {
    console.log('❌ Login FAILED:', e.message);
    await browser.close(); process.exit(1);
  }

  const { page: mgrPage } = await setupPage(browser, mgrToken, 'MANAGER');

  const mgrPages = [
    { path: '/dashboard',             apiKey: '/dashboard' },
    { path: '/catalog/products',      apiKey: '/catalog/products' },
    { path: '/inventory',             apiKey: '/inventory' },
    { path: '/sales/orders',          apiKey: '/sales/orders' },
    { path: '/reports/daily-revenue', apiKey: '/reports/daily-revenue' },
    { path: '/customers',             apiKey: '/customers' },
    { path: '/nasiya',                apiKey: '/nasiya' },
    { path: '/analytics',             apiKey: '/analytics' },
  ];

  for (const p of mgrPages) {
    const { responses } = await visitPage(mgrPage, p.path, []);
    // Find the most relevant API call
    const apiStatuses = Object.entries(responses);
    if (apiStatuses.length === 0) {
      log('MANAGER', p.path, '(no api call)', '-', 'No API request intercepted', '');
    } else {
      for (const [api, status] of apiStatuses) {
        const issue = status >= 400 ? `HTTP ${status}` : null;
        log('MANAGER', p.path, api, status, issue, '');
      }
    }

    // Check scroll
    const hasScroll = await mgrPage.evaluate(() => document.body.scrollHeight > window.innerHeight);
    if (!hasScroll) {
      log('MANAGER', p.path, 'scroll', 'NONE', 'Нет скролла или страница пустая', '');
    }
  }

  // MANAGER — forbidden API checks (direct token call)
  console.log('\n--- MANAGER: Forbidden Endpoints ---');
  const mgrForbidden = [
    '/finance/expenses',
    '/settings/users',
    '/settings/billing',
  ];
  for (const ep of mgrForbidden) {
    const status = await apiCheck(mgrToken, 'GET', ep);
    const issue = status !== 403 ? `Ожидался 403, получен ${status}` : null;
    log('MANAGER', 'forbidden', ep, status, issue, issue ? 'Нужно убрать MANAGER из @Roles' : '');
  }

  // ════════════════════════════════════════════
  // VIEWER
  // ════════════════════════════════════════════
  console.log('\n═══════════ VIEWER ═══════════');
  let viewerToken;
  try {
    viewerToken = await loginViaAPI('viewer@kosmetika.uz', 'Demo1234!', 'kosmetika-demo');
    console.log('✅ Login OK');
  } catch (e) {
    console.log('❌ Login FAILED:', e.message);
  }

  if (viewerToken) {
    const { page: vPage } = await setupPage(browser, viewerToken, 'VIEWER');

    const viewerPages = [
      { path: '/dashboard',        apiKey: '/dashboard' },
      { path: '/catalog/products', apiKey: '/catalog/products' },
      { path: '/sales/orders',     apiKey: '/sales/orders' },
    ];

    for (const p of viewerPages) {
      const { responses } = await visitPage(vPage, p.path, []);
      const apiStatuses = Object.entries(responses);
      if (apiStatuses.length === 0) {
        log('VIEWER', p.path, '(no api call)', '-', 'No API request intercepted', '');
      } else {
        for (const [api, status] of apiStatuses) {
          const issue = status >= 400 ? `HTTP ${status}` : null;
          log('VIEWER', p.path, api, status, issue, '');
        }
      }

      // Check UI buttons
      await vPage.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
      await vPage.waitForTimeout(1500);

      const buttons = await vPage.evaluate(() => {
        const texts = ['создать', 'удалить', 'редактировать', 'create', 'delete', 'edit', 'добавить', 'add'];
        const visible = [];
        document.querySelectorAll('button, a[role="button"]').forEach(el => {
          const t = el.textContent?.toLowerCase().trim() || '';
          const isVisible = el.offsetParent !== null && !el.closest('[hidden]') && window.getComputedStyle(el).display !== 'none';
          if (isVisible && texts.some(kw => t.includes(kw))) {
            visible.push(el.textContent.trim());
          }
        });
        return visible;
      });

      if (buttons.length > 0) {
        log('VIEWER', p.path, 'UI buttons', 'VISIBLE', `Кнопки должны быть скрыты: ${buttons.join(', ')}`, 'Нужно useCanEdit() проверку');
      } else {
        log('VIEWER', p.path, 'UI buttons', 'HIDDEN', null, '');
      }
    }

    // VIEWER — forbidden API checks
    console.log('\n--- VIEWER: Forbidden Endpoints ---');
    const viewerForbidden = [
      { ep: '/finance/expenses', method: 'GET' },
      { ep: '/settings/users',   method: 'GET' },
      { ep: '/nasiya',           method: 'GET' },
    ];
    for (const { ep, method } of viewerForbidden) {
      const status = await apiCheck(viewerToken, method, ep);
      const issue = status !== 403 ? `Ожидался 403, получен ${status}` : null;
      log('VIEWER', 'forbidden', ep, status, issue, issue ? 'Нужно добавить @Roles без VIEWER' : '');
    }
  }

  await browser.close();

  // ════════════════════════════════════════════
  // Summary Table
  // ════════════════════════════════════════════
  console.log('\n\n══════════════════════════════════════════════════════════════════════');
  console.log(' РОЛЬ      | СТРАНИЦА                  | API ЗАПРОС                | СТАТУС | ПРОБЛЕМА');
  console.log('══════════════════════════════════════════════════════════════════════');
  for (const r of results) {
    const issue = r.issue || '—';
    const fixed = r.fixed ? ` [FIX: ${r.fixed}]` : '';
    console.log(` ${(r.role).padEnd(9)} | ${(r.page).padEnd(25)} | ${(r.api).padEnd(25)} | ${String(r.status).padEnd(6)} | ${issue}${fixed}`);
  }
  console.log('══════════════════════════════════════════════════════════════════════');

  const issues = results.filter(r => r.issue);
  console.log(`\nИтого проблем: ${issues.length}`);
  issues.forEach(r => console.log(`  ❌ [${r.role}] ${r.api} → ${r.status}: ${r.issue}`));
})();
