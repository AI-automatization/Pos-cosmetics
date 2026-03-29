---
name: webapp-testing
description: Test local web applications using Playwright for UI verification, debugging, screenshot capture, and browser log inspection. Uses reconnaissance-then-action pattern. From Anthropic official skills.
argument-hint: URL to test (e.g., http://localhost:3001), or describe what to test
---

# Web App Testing with Playwright

Test local web applications using Playwright for frontend verification, debugging, and automated UI testing.

## User Arguments

```
$ARGUMENTS
```

Provide the URL to test and/or describe what to test (e.g., "test the login flow at http://localhost:3001").

## Prerequisites

Ensure Playwright is installed:
```bash
npx playwright install chromium
```

## Reconnaissance-Then-Action Pattern

**Always do recon first before taking actions:**

1. **Navigate** to the application URL
2. **Wait** for network idle state (`networkidle`)
3. **Capture screenshot** to see current state
4. **Inspect DOM** to identify selectors
5. **Then execute** actions with discovered selectors

This prevents selector guessing and ensures reliable automation.

## Server Lifecycle Management

If the dev server is not running, start it first:

```bash
# Start server in background
pnpm --filter web dev &
# Wait for it to be ready
npx wait-on http://localhost:3001
```

For multi-server setups (backend + frontend):
```bash
# Start API
pnpm --filter api dev &
# Start web
pnpm --filter web dev &
npx wait-on http://localhost:3000 http://localhost:3001
```

## Playwright Test Patterns

### Basic Navigation & Screenshot
```javascript
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3001');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### Form Interaction
```javascript
// Recon first
const html = await page.content();
// Then act with confirmed selectors
await page.fill('[data-testid="email"]', 'test@example.com');
await page.fill('[data-testid="password"]', 'password123');
await page.click('[data-testid="login-btn"]');
await page.waitForURL('**/dashboard');
```

### Console Log Capture
```javascript
page.on('console', msg => console.log('Browser:', msg.text()));
page.on('pageerror', err => console.error('Page error:', err.message));
```

### Assertion Examples
```javascript
await expect(page).toHaveURL(/dashboard/);
await expect(page.locator('h1')).toHaveText('Dashboard');
await expect(page.locator('[data-testid="sales-total"]')).toBeVisible();
```

## RAOS-Specific Test Flows

### Admin Panel Login
```javascript
await page.goto('http://localhost:3001/login');
await page.fill('[name="username"]', process.env.TEST_USER);
await page.fill('[name="password"]', process.env.TEST_PASS);
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard');
```

### Catalog Page Verification
```javascript
await page.goto('http://localhost:3001/catalog/products');
await page.waitForLoadState('networkidle');
await expect(page.locator('table')).toBeVisible();
await page.screenshot({ path: 'catalog.png' });
```

## Debugging Tips

- Always capture screenshots at key steps
- Use `page.pause()` for interactive debugging
- Check `page.content()` when selectors don't match
- Network requests: `page.on('request', ...)` / `page.on('response', ...)`
- Slow down: `await page.waitForTimeout(1000)` before actions
