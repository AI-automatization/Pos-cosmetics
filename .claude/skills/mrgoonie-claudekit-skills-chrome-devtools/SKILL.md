---
name: chrome-devtools
description: Browser automation, debugging, and performance analysis using Puppeteer CLI scripts. Use for automating browsers, taking screenshots, analyzing performance, monitoring network traffic, web scraping, form automation, and JavaScript debugging.
license: Apache-2.0
---

# Chrome DevTools Agent Skill

Browser automation via executable Puppeteer scripts. All scripts output JSON for easy parsing.

## Quick Start

**CRITICAL**: Always check `pwd` before running scripts.

### Installation

#### Step 1: Install System Dependencies (Linux/WSL only)

On Linux/WSL, Chrome requires system libraries. Install them first:

```bash
pwd  # Should show current working directory
cd .claude/skills/chrome-devtools/scripts
./install-deps.sh  # Auto-detects OS and installs required libs
```

Supports: Ubuntu, Debian, Fedora, RHEL, CentOS, Arch, Manjaro

**macOS/Windows**: Skip this step (dependencies bundled with Chrome)

#### Step 2: Install Node Dependencies

```bash
npm install  # Installs puppeteer, debug, yargs
```

#### Step 3: Install ImageMagick (Optional, Recommended)

ImageMagick enables automatic screenshot compression to keep files under 5MB:

**macOS:**
```bash
brew install imagemagick
```

**Ubuntu/Debian/WSL:**
```bash
sudo apt-get install imagemagick
```

**Verify:**
```bash
magick -version  # or: convert -version
```

Without ImageMagick, screenshots >5MB will not be compressed (may fail to load in Gemini/Claude).

### Test
```bash
node navigate.js --url https://example.com
# Output: {"success": true, "url": "https://example.com", "title": "Example Domain"}
```

## Available Scripts

All scripts are in `.claude/skills/chrome-devtools/scripts/`

**CRITICAL**: Always check `pwd` before running scripts.

### Script Usage
- `./scripts/README.md`

### Core Automation
- `navigate.js` - Navigate to URLs
- `screenshot.js` - Capture screenshots (full page or element)
- `click.js` - Click elements
- `fill.js` - Fill form fields
- `evaluate.js` - Execute JavaScript in page context

### Analysis & Monitoring
- `snapshot.js` - Extract interactive elements with metadata
- `console.js` - Monitor console messages/errors
- `network.js` - Track HTTP requests/responses
- `performance.js` - Measure Core Web Vitals + record traces

## Usage Patterns

### Single Command
```bash
pwd  # Should show current working directory
cd .claude/skills/chrome-devtools/scripts
node screenshot.js --url https://example.com --output ./docs/screenshots/page.png
```
**Important**: Always save screenshots to `./docs/screenshots` directory.

### Automatic Image Compression
Screenshots are **automatically compressed** if they exceed 5MB to ensure compatibility with Gemini API and Claude Code (which have 5MB limits). This uses ImageMagick internally:

```bash
# Default: auto-compress if >5MB
node screenshot.js --url https://example.com --output page.png

# Custom size threshold (e.g., 3MB)
node screenshot.js --url https://example.com --output page.png --max-size 3

# Disable compression
node screenshot.js --url https://example.com --output page.png --no-compress
```

**Compression behavior:**
- PNG: Resizes to 90% + quality 85 (or 75% + quality 70 if still too large)
- JPEG: Quality 80 + progressive encoding (or quality 60 if still too large)
- Other formats: Converted to JPEG with compression
- Requires ImageMagick installed (see imagemagick skill)

**Output includes compression info:**
```json
{
  "success": true,
  "output": "/path/to/page.png",
  "compressed": true,
  "originalSize": 8388608,
  "size": 3145728,
  "compressionRatio": "62.50%",
  "url": "https://example.com"
}
```

### Chain Commands (reuse browser)
```bash
# Keep browser open with --close false
node navigate.js --url https://example.com/login --close false
node fill.js --selector "#email" --value "user@example.com" --close false
node fill.js --selector "#password" --value "secret" --close false
node click.js --selector "button[type=submit]"
```

### Parse JSON Output
```bash
# Extract specific fields with jq
node performance.js --url https://example.com | jq '.vitals.LCP'

# Save to file
node network.js --url https://example.com --output /tmp/requests.json
```

## Execution Protocol

### Working Directory Verification

BEFORE executing any script:
1. Check current working directory with `pwd`
2. Verify in `.claude/skills/chrome-devtools/scripts/` directory
3. If wrong directory, `cd` to correct location
4. Use absolute paths for all output files

Example:
```bash
pwd  # Should show: .../chrome-devtools/scripts
# If wrong:
cd .claude/skills/chrome-devtools/scripts
```

### Output Validation

AFTER screenshot/capture operations:
1. Verify file created with `ls -lh <output-path>`
2. Read screenshot using Read tool to confirm content
3. Check JSON output for success:true
4. Report file size and compression status

Example:
```bash
node screenshot.js --url https://example.com --output ./docs/screenshots/page.png
ls -lh ./docs/screenshots/page.png  # Verify file exists
# Then use Read tool to visually inspect
```

5. Restart working directory to the project root.

### Error Recovery

If script fails:
1. Check error message for selector issues
2. Use snapshot.js to discover correct selectors
3. Try XPath selector if CSS selector fails
4. Verify element is visible and interactive

Example:
```bash
# CSS selector fails
node click.js --url https://example.com --selector ".btn-submit"
# Error: waiting for selector ".btn-submit" failed

# Discover correct selector
node snapshot.js --url https://example.com | jq '.elements[] | select(.tagName=="BUTTON")'

# Try XPath
node click.js --url https://example.com --selector "//button[contains(text(),'Submit')]"
```

### Common Mistakes

❌ Wrong working directory → output files go to wrong location
❌ Skipping output validation → silent failures
❌ Using complex CSS selectors without testing → selector errors
❌ Not checking element visibility → timeout errors

✅ Always verify `pwd` before running scripts
✅ Always validate output after screenshots
✅ Use snapshot.js to discover selectors
✅ Test selectors with simple commands first

## Common Workflows

### Web Scraping
```bash
node evaluate.js --url https://example.com --script "
  Array.from(document.querySelectorAll('.item')).map(el => ({
    title: el.querySelector('h2')?.textContent,
    link: el.querySelector('a')?.href
  }))
" | jq '.result'
```

### Performance Testing
```bash
PERF=$(node performance.js --url https://example.com)
LCP=$(echo $PERF | jq '.vitals.LCP')
if (( $(echo "$LCP < 2500" | bc -l) )); then
  echo "✓ LCP passed: ${LCP}ms"
else
  echo "✗ LCP failed: ${LCP}ms"
fi
```

### Form Automation
```bash
node fill.js --url https://example.com --selector "#search" --value "query" --close false
node click.js --selector "button[type=submit]"
```

### Error Monitoring
```bash
node console.js --url https://example.com --types error,warn --duration 5000 | jq '.messageCount'
```

## Script Options

All scripts support:
- `--headless false` - Show browser window
- `--close false` - Keep browser open for chaining
- `--timeout 30000` - Set timeout (milliseconds)
- `--wait-until networkidle2` - Wait strategy

See `./scripts/README.md` for complete options.

## Output Format

All scripts output JSON to stdout:
```json
{
  "success": true,
  "url": "https://example.com",
  ... // script-specific data
}
```

Errors go to stderr:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Finding Elements

Use `snapshot.js` to discover selectors:
```bash
node snapshot.js --url https://example.com | jq '.elements[] | {tagName, text, selector}'
```

## Troubleshooting

### Common Errors

**"Cannot find package 'puppeteer'"**
- Run: `npm install` in the scripts directory

**"error while loading shared libraries: libnss3.so"** (Linux/WSL)
- Missing system dependencies
- Fix: Run `./install-deps.sh` in scripts directory
- Manual install: `sudo apt-get install -y libnss3 libnspr4 libasound2t64 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1`

**"Failed to launch the browser process"**
- Check system dependencies installed (Linux/WSL)
- Verify Chrome downloaded: `ls ~/.cache/puppeteer`
- Try: `npm rebuild` then `npm install`

**Chrome not found**
- Puppeteer auto-downloads Chrome during `npm install`
- If failed, manually trigger: `npx puppeteer browsers install chrome`

### Script Issues

**Element not found**
- Get snapshot first to find correct selector: `node snapshot.js --url <url>`

**Script hangs**
- Increase timeout: `--timeout 60000`
- Change wait strategy: `--wait-until load` or `--wait-until domcontentloaded`

**Blank screenshot**
- Wait for page load: `--wait-until networkidle2`
- Increase timeout: `--timeout 30000`

**Permission denied on scripts**
- Make executable: `chmod +x *.sh`

**Screenshot too large (>5MB)**
- Install ImageMagick for automatic compression
- Manually set lower threshold: `--max-size 3`
- Use JPEG format instead of PNG: `--format jpeg --quality 80`
- Capture specific element instead of full page: `--selector .main-content`

**Compression not working**
- Verify ImageMagick installed: `magick -version` or `convert -version`
- Check file was actually compressed in output JSON: `"compressed": true`
- For very large pages, use `--selector` to capture only needed area

## Reference Documentation

Detailed guides available in `./references/`:
- [CDP Domains Reference](./references/cdp-domains.md) - 47 Chrome DevTools Protocol domains
- [Puppeteer Quick Reference](./references/puppeteer-reference.md) - Complete Puppeteer API patterns
- [Performance Analysis Guide](./references/performance-guide.md) - Core Web Vitals optimization

## Advanced Usage

### Custom Scripts
Create custom scripts using shared library:
```javascript
import { getBrowser, getPage, closeBrowser, outputJSON } from './lib/browser.js';
// Your automation logic
```

### Direct CDP Access
```javascript
const client = await page.createCDPSession();
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
```

See reference documentation for advanced patterns and complete API coverage.

## External Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Scripts README](./scripts/README.md)


---

## Referenced Files

> The following files are referenced in this skill and included for context.

### references/cdp-domains.md

```markdown
# Chrome DevTools Protocol (CDP) Domains Reference

Complete reference of CDP domains and their capabilities for browser automation and debugging.

## Overview

CDP is organized into **47 domains**, each providing specific browser capabilities. Domains are grouped by functionality:

- **Core** - Fundamental browser control
- **DOM & Styling** - Page structure and styling
- **Network & Fetch** - HTTP traffic management
- **Page & Navigation** - Page lifecycle control
- **Storage & Data** - Browser storage APIs
- **Performance & Profiling** - Metrics and analysis
- **Emulation & Simulation** - Device and network emulation
- **Worker & Service** - Background tasks
- **Developer Tools** - Debugging support

---

## Core Domains

### Runtime
**Purpose:** Execute JavaScript, manage objects, handle promises

**Key Commands:**
- `Runtime.evaluate(expression)` - Execute JavaScript
- `Runtime.callFunctionOn(functionDeclaration, objectId)` - Call function on object
- `Runtime.getProperties(objectId)` - Get object properties
- `Runtime.awaitPromise(promiseObjectId)` - Wait for promise resolution

**Key Events:**
- `Runtime.consoleAPICalled` - Console message logged
- `Runtime.exceptionThrown` - Uncaught exception

**Use Cases:**
- Execute custom JavaScript
- Access page data
- Monitor console output
- Handle exceptions

---

### Debugger
**Purpose:** JavaScript debugging, breakpoints, stack traces

**Key Commands:**
- `Debugger.enable()` - Enable debugger
- `Debugger.setBreakpoint(location)` - Set breakpoint
- `Debugger.pause()` - Pause execution
- `Debugger.resume()` - Resume execution
- `Debugger.stepOver/stepInto/stepOut()` - Step through code

**Key Events:**
- `Debugger.paused` - Execution paused
- `Debugger.resumed` - Execution resumed
- `Debugger.scriptParsed` - Script loaded

**Use Cases:**
- Debug JavaScript errors
- Inspect call stacks
- Set conditional breakpoints
- Source map support

---

### Console (Deprecated - Use Runtime/Log)
**Purpose:** Legacy console message access

**Note:** Use `Runtime.consoleAPICalled` event instead for new implementations.

---

## DOM & Styling Domains

### DOM
**Purpose:** Access and manipulate DOM tree

**Key Commands:**
- `DOM.getDocument()` - Get root document node
- `DOM.querySelector(nodeId, selector)` - Query selector
- `DOM.querySelectorAll(nodeId, selector)` - Query all
- `DOM.getAttributes(nodeId)` - Get element attributes
- `DOM.setOuterHTML(nodeId, outerHTML)` - Replace element
- `DOM.getBoxModel(nodeId)` - Get element layout box
- `DOM.focus(nodeId)` - Focus element

**Key Events:**
- `DOM.documentUpdated` - Document changed
- `DOM.setChildNodes` - Child nodes updated

**Use Cases:**
- Navigate DOM tree
- Query elements
- Modify DOM structure
- Get element positions

---

### CSS
**Purpose:** Inspect and modify CSS styles

**Key Commands:**
- `CSS.enable()` - Enable CSS domain
- `CSS.getComputedStyleForNode(nodeId)` - Get computed styles
- `CSS.getInlineStylesForNode(nodeId)` - Get inline styles
- `CSS.getMatchedStylesForNode(nodeId)` - Get matched CSS rules
- `CSS.setStyleTexts(edits)` - Modify styles

**Key Events:**
- `CSS.styleSheetAdded` - Stylesheet added
- `CSS.styleSheetChanged` - Stylesheet modified

**Use Cases:**
- Inspect element styles
- Debug CSS issues
- Modify styles dynamically
- Extract stylesheet data

---

### Accessibility
**Purpose:** Access accessibility tree

**Key Commands:**
- `Accessibility.enable()` - Enable accessibility
- `Accessibility.getFullAXTree()` - Get complete AX tree
- `Accessibility.getPartialAXTree(nodeId)` - Get node subtree
- `Accessibility.queryAXTree(nodeId, role, name)` - Query AX tree

**Use Cases:**
- Accessibility testing
- Screen reader simulation
- ARIA attribute inspection
- AX tree analysis

---

## Network & Fetch Domains

### Network
**Purpose:** Monitor and control HTTP traffic

**Key Commands:**
- `Network.enable()` - Enable network tracking
- `Network.setCacheDisabled(cacheDisabled)` - Disable cache
- `Network.setExtraHTTPHeaders(headers)` - Add custom headers
- `Network.getCookies(urls)` - Get cookies
- `Network.setCookie(name, value, domain)` - Set cookie
- `Network.getResponseBody(requestId)` - Get response body
- `Network.emulateNetworkConditions(offline, latency, downloadThroughput, uploadThroughput)` - Throttle network

**Key Events:**
- `Network.requestWillBeSent` - Request starting
- `Network.responseReceived` - Response received
- `Network.loadingFinished` - Request completed
- `Network.loadingFailed` - Request failed

**Use Cases:**
- Monitor API calls
- Intercept requests
- Analyze response data
- Simulate slow networks
- Manage cookies

---

### Fetch
**Purpose:** Intercept and modify network requests

**Key Commands:**
- `Fetch.enable(patterns)` - Enable request interception
- `Fetch.continueRequest(requestId, url, method, headers)` - Continue/modify request
- `Fetch.fulfillRequest(requestId, responseCode, headers, body)` - Mock response
- `Fetch.failRequest(requestId, errorReason)` - Fail request

**Key Events:**
- `Fetch.requestPaused` - Request intercepted

**Use Cases:**
- Mock API responses
- Block requests
- Modify request/response
- Test error scenarios

---

## Page & Navigation Domains

### Page
**Purpose:** Control page lifecycle and navigation

**Key Commands:**
- `Page.enable()` - Enable page domain
- `Page.navigate(url)` - Navigate to URL
- `Page.reload(ignoreCache)` - Reload page
- `Page.goBack()/goForward()` - Navigate history
- `Page.captureScreenshot(format, quality)` - Take screenshot
- `Page.printToPDF(landscape, displayHeaderFooter)` - Generate PDF
- `Page.getLayoutMetrics()` - Get page dimensions
- `Page.createIsolatedWorld(frameId)` - Create isolated context
- `Page.handleJavaScriptDialog(accept, promptText)` - Handle alerts/confirms

**Key Events:**
- `Page.loadEventFired` - Page loaded
- `Page.domContentEventFired` - DOM ready
- `Page.frameNavigated` - Frame navigated
- `Page.javascriptDialogOpening` - Alert/confirm shown

**Use Cases:**
- Navigate pages
- Capture screenshots
- Generate PDFs
- Handle popups
- Monitor page lifecycle

---

### Target
**Purpose:** Manage browser targets (tabs, workers, frames)

**Key Commands:**
- `Target.getTargets()` - List all targets
- `Target.createTarget(url)` - Open new tab
- `Target.closeTarget(targetId)` - Close tab
- `Target.attachToTarget(targetId)` - Attach debugger
- `Target.detachFromTarget(sessionId)` - Detach debugger
- `Target.setDiscoverTargets(discover)` - Auto-discover targets

**Key Events:**
- `Target.targetCreated` - New target created
- `Target.targetDestroyed` - Target closed
- `Target.targetInfoChanged` - Target updated

**Use Cases:**
- Multi-tab automation
- Service worker debugging
- Frame inspection
- Extension debugging

---

### Input
**Purpose:** Simulate user input

**Key Commands:**
- `Input.dispatchKeyEvent(type, key, code)` - Keyboard input
- `Input.dispatchMouseEvent(type, x, y, button)` - Mouse input
- `Input.dispatchTouchEvent(type, touchPoints)` - Touch input
- `Input.synthesizePinchGesture(x, y, scaleFactor)` - Pinch gesture
- `Input.synthesizeScrollGesture(x, y, xDistance, yDistance)` - Scroll

**Use Cases:**
- Simulate clicks
- Type text
- Drag and drop
- Touch gestures
- Scroll pages

---

## Storage & Data Domains

### Storage
**Purpose:** Manage browser storage

**Key Commands:**
- `Storage.getCookies(browserContextId)` - Get cookies
- `Storage.setCookies(cookies)` - Set cookies
- `Storage.clearCookies(browserContextId)` - Clear cookies
- `Storage.clearDataForOrigin(origin, storageTypes)` - Clear storage
- `Storage.getUsageAndQuota(origin)` - Get storage usage

**Storage Types:**
- appcache, cookies, file_systems, indexeddb, local_storage, shader_cache, websql, service_workers, cache_storage

**Use Cases:**
- Cookie management
- Clear browser data
- Inspect storage usage
- Test quota limits

---

### DOMStorage
**Purpose:** Access localStorage/sessionStorage

**Key Commands:**
- `DOMStorage.enable()` - Enable storage tracking
- `DOMStorage.getDOMStorageItems(storageId)` - Get items
- `DOMStorage.setDOMStorageItem(storageId, key, value)` - Set item
- `DOMStorage.removeDOMStorageItem(storageId, key)` - Remove item

**Key Events:**
- `DOMStorage.domStorageItemsCleared` - Storage cleared
- `DOMStorage.domStorageItemAdded/Updated/Removed` - Item changed

---

### IndexedDB
**Purpose:** Query IndexedDB databases

**Key Commands:**
- `IndexedDB.requestDatabaseNames(securityOrigin)` - List databases
- `IndexedDB.requestDatabase(securityOrigin, databaseName)` - Get DB structure
- `IndexedDB.requestData(securityOrigin, databaseName, objectStoreName)` - Query data

**Use Cases:**
- Inspect IndexedDB data
- Debug database issues
- Extract stored data

---

### CacheStorage
**Purpose:** Manage Cache API

**Key Commands:**
- `CacheStorage.requestCacheNames(securityOrigin)` - List caches
- `CacheStorage.requestCachedResponses(cacheId, securityOrigin)` - List cached responses
- `CacheStorage.deleteCache(cacheId)` - Delete cache

**Use Cases:**
- Service worker cache inspection
- Offline functionality testing

---

## Performance & Profiling Domains

### Performance
**Purpose:** Collect performance metrics

**Key Commands:**
- `Performance.enable()` - Enable performance tracking
- `Performance.disable()` - Disable tracking
- `Performance.getMetrics()` - Get current metrics

**Metrics:**
- Timestamp, Documents, Frames, JSEventListeners, Nodes, LayoutCount, RecalcStyleCount, LayoutDuration, RecalcStyleDuration, ScriptDuration, TaskDuration, JSHeapUsedSize, JSHeapTotalSize

**Use Cases:**
- Monitor page metrics
- Track memory usage
- Measure render times

---

### PerformanceTimeline
**Purpose:** Access Performance Timeline API

**Key Commands:**
- `PerformanceTimeline.enable(eventTypes)` - Subscribe to events

**Event Types:**
- mark, measure, navigation, resource, longtask, paint, layout-shift

**Key Events:**
- `PerformanceTimeline.timelineEventAdded` - New performance entry

---

### Tracing
**Purpose:** Record Chrome trace

**Key Commands:**
- `Tracing.start(categories, options)` - Start recording
- `Tracing.end()` - Stop recording
- `Tracing.requestMemoryDump()` - Capture memory snapshot

**Trace Categories:**
- blink, cc, devtools, gpu, loading, navigation, rendering, v8, disabled-by-default-*

**Key Events:**
- `Tracing.dataCollected` - Trace chunk received
- `Tracing.tracingComplete` - Recording finished

**Use Cases:**
- Deep performance analysis
- Frame rendering profiling
- CPU flame graphs
- Memory profiling

---

### Profiler
**Purpose:** CPU profiling

**Key Commands:**
- `Profiler.enable()` - Enable profiler
- `Profiler.start()` - Start CPU profiling
- `Profiler.stop()` - Stop and get profile

**Use Cases:**
- Find CPU bottlenecks
- Optimize JavaScript
- Generate flame graphs

---

### HeapProfiler (via Memory domain)
**Purpose:** Memory profiling

**Key Commands:**
- `Memory.getDOMCounters()` - Get DOM object counts
- `Memory.prepareForLeakDetection()` - Prepare leak detection
- `Memory.forciblyPurgeJavaScriptMemory()` - Force GC
- `Memory.setPressureNotificationsSuppressed(suppressed)` - Control memory warnings
- `Memory.simulatePressureNotification(level)` - Simulate memory pressure

**Use Cases:**
- Detect memory leaks
- Analyze heap snapshots
- Monitor object counts

---

## Emulation & Simulation Domains

### Emulation
**Purpose:** Emulate device conditions

**Key Commands:**
- `Emulation.setDeviceMetricsOverride(width, height, deviceScaleFactor, mobile)` - Emulate device
- `Emulation.setGeolocationOverride(latitude, longitude, accuracy)` - Fake location
- `Emulation.setEmulatedMedia(media, features)` - Emulate media type
- `Emulation.setTimezoneOverride(timezoneId)` - Override timezone
- `Emulation.setLocaleOverride(locale)` - Override language
- `Emulation.setUserAgentOverride(userAgent)` - Change user agent

**Use Cases:**
- Mobile device testing
- Geolocation testing
- Print media emulation
- Timezone/locale testing

---

### DeviceOrientation
**Purpose:** Simulate device orientation

**Key Commands:**
- `DeviceOrientation.setDeviceOrientationOverride(alpha, beta, gamma)` - Set orientation

**Use Cases:**
- Test accelerometer features
- Orientation-dependent layouts

---

## Worker & Service Domains

### ServiceWorker
**Purpose:** Manage service workers

**Key Commands:**
- `ServiceWorker.enable()` - Enable tracking
- `ServiceWorker.unregister(scopeURL)` - Unregister worker
- `ServiceWorker.startWorker(scopeURL)` - Start worker
- `ServiceWorker.stopWorker(versionId)` - Stop worker
- `ServiceWorker.inspectWorker(versionId)` - Debug worker

**Key Events:**
- `ServiceWorker.workerRegistrationUpdated` - Registration changed
- `ServiceWorker.workerVersionUpdated` - Version updated

---

### WebAuthn
**Purpose:** Simulate WebAuthn/FIDO2

**Key Commands:**
- `WebAuthn.enable()` - Enable virtual authenticators
- `WebAuthn.addVirtualAuthenticator(options)` - Add virtual device
- `WebAuthn.removeVirtualAuthenticator(authenticatorId)` - Remove device
- `WebAuthn.addCredential(authenticatorId, credential)` - Add credential

**Use Cases:**
- Test WebAuthn flows
- Simulate biometric auth
- Test security keys

---

## Developer Tools Support

### Inspector
**Purpose:** Protocol-level debugging

**Key Events:**
- `Inspector.detached` - Debugger disconnected
- `Inspector.targetCrashed` - Target crashed

---

### Log
**Purpose:** Collect browser logs

**Key Commands:**
- `Log.enable()` - Enable log collection
- `Log.clear()` - Clear logs

**Key Events:**
- `Log.entryAdded` - New log entry

**Use Cases:**
- Collect console logs
- Monitor violations
- Track deprecations

---

### DOMDebugger
**Purpose:** DOM-level debugging

**Key Commands:**
- `DOMDebugger.setDOMBreakpoint(nodeId, type)` - Break on DOM changes
- `DOMDebugger.setEventListenerBreakpoint(eventName)` - Break on event
- `DOMDebugger.setXHRBreakpoint(url)` - Break on XHR

**Breakpoint Types:**
- subtree-modified, attribute-modified, node-removed

---

### DOMSnapshot
**Purpose:** Capture complete DOM snapshot

**Key Commands:**
- `DOMSnapshot.captureSnapshot(computedStyles)` - Capture full DOM

**Use Cases:**
- Export page structure
- Offline analysis
- DOM diffing

---

### Audits (Lighthouse Integration)
**Purpose:** Run automated audits

**Key Commands:**
- `Audits.enable()` - Enable audits
- `Audits.getEncodingIssues()` - Check encoding issues

---

### LayerTree
**Purpose:** Inspect rendering layers

**Key Commands:**
- `LayerTree.enable()` - Enable layer tracking
- `LayerTree.compositingReasons(layerId)` - Get why layer created

**Key Events:**
- `LayerTree.layerTreeDidChange` - Layers changed

**Use Cases:**
- Debug rendering performance
- Identify layer creation
- Optimize compositing

---

## Other Domains

### Browser
**Purpose:** Browser-level control

**Key Commands:**
- `Browser.getVersion()` - Get browser info
- `Browser.getBrowserCommandLine()` - Get launch args
- `Browser.setPermission(permission, setting, origin)` - Set permissions
- `Browser.grantPermissions(permissions, origin)` - Grant permissions

**Permissions:**
- geolocation, midi, notifications, push, camera, microphone, background-sync, sensors, accessibility-events, clipboard-read, clipboard-write, payment-handler

---

### IO
**Purpose:** File I/O operations

**Key Commands:**
- `IO.read(handle, offset, size)` - Read stream
- `IO.close(handle)` - Close stream

**Use Cases:**
- Read large response bodies
- Process binary data

---

### Media
**Purpose:** Inspect media players

**Key Commands:**
- `Media.enable()` - Track media players

**Key Events:**
- `Media.playerPropertiesChanged` - Player state changed
- `Media.playerEventsAdded` - Player events

---

### BackgroundService
**Purpose:** Track background services

**Key Commands:**
- `BackgroundService.startObserving(service)` - Track service

**Services:**
- backgroundFetch, backgroundSync, pushMessaging, notifications, paymentHandler, periodicBackgroundSync

---

## Domain Dependencies

Some domains depend on others and must be enabled in order:

```
Runtime (no dependencies)
  ↓
DOM (depends on Runtime)
  ↓
CSS (depends on DOM)

Network (no dependencies)

Page (depends on Runtime)
  ↓
Target (depends on Page)

Debugger (depends on Runtime)
```

## Quick Command Reference

### Most Common Commands

```javascript
// Navigation
Page.navigate(url)
Page.reload()

// JavaScript Execution
Runtime.evaluate(expression)

// DOM Access
DOM.getDocument()
DOM.querySelector(nodeId, selector)

// Screenshots
Page.captureScreenshot(format, quality)

// Network Monitoring
Network.enable()
// Listen for Network.requestWillBeSent events

// Console Messages
// Listen for Runtime.consoleAPICalled events

// Cookies
Network.getCookies(urls)
Network.setCookie(...)

// Device Emulation
Emulation.setDeviceMetricsOverride(width, height, ...)

// Performance
Performance.getMetrics()
Tracing.start(categories)
Tracing.end()
```

---

## Best Practices

1. **Enable domains before use:** Always call `.enable()` for stateful domains
2. **Handle events:** Subscribe to events for real-time updates
3. **Clean up:** Disable domains when done to reduce overhead
4. **Use sessions:** Attach to specific targets for isolated debugging
5. **Handle errors:** Implement proper error handling for command failures
6. **Version awareness:** Check browser version for experimental API support

---

## Additional Resources

- [Protocol Viewer](https://chromedevtools.github.io/devtools-protocol/) - Interactive domain browser
- [Protocol JSON](https://chromedevtools.github.io/devtools-protocol/tot/json) - Machine-readable specification
- [Getting Started with CDP](https://github.com/aslushnikov/getting-started-with-cdp)
- [devtools-protocol NPM](https://www.npmjs.com/package/devtools-protocol) - TypeScript definitions

```

### references/puppeteer-reference.md

```markdown
# Puppeteer Quick Reference

Complete guide to browser automation with Puppeteer - a high-level API over Chrome DevTools Protocol.

## Table of Contents

- [Setup](#setup)
- [Browser & Page Management](#browser--page-management)
- [Navigation](#navigation)
- [Element Interaction](#element-interaction)
- [JavaScript Execution](#javascript-execution)
- [Screenshots & PDFs](#screenshots--pdfs)
- [Network Interception](#network-interception)
- [Device Emulation](#device-emulation)
- [Performance](#performance)
- [Common Patterns](#common-patterns)

---

## Setup

### Installation

```bash
# Install Puppeteer
npm install puppeteer

# Install core only (bring your own Chrome)
npm install puppeteer-core
```

### Basic Usage

```javascript
import puppeteer from 'puppeteer';

// Launch browser
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox']
});

// Open page
const page = await browser.newPage();

// Navigate
await page.goto('https://example.com');

// Do work...

// Cleanup
await browser.close();
```

---

## Browser & Page Management

### Launch Browser

```javascript
const browser = await puppeteer.launch({
  // Visibility
  headless: false,              // Show browser UI
  headless: 'new',              // New headless mode (Chrome 112+)

  // Chrome location
  executablePath: '/path/to/chrome',
  channel: 'chrome',            // or 'chrome-canary', 'chrome-beta'

  // Browser context
  userDataDir: './user-data',   // Persistent profile

  // Window size
  defaultViewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false
  },

  // Advanced options
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials',
    '--start-maximized'
  ],

  // Debugging
  devtools: true,               // Open DevTools automatically
  slowMo: 250,                  // Slow down by 250ms per action

  // Network
  proxy: {
    server: 'http://proxy.com:8080'
  }
});
```

### Connect to Running Browser

```javascript
// Launch Chrome with debugging
// google-chrome --remote-debugging-port=9222

const browser = await puppeteer.connect({
  browserURL: 'http://localhost:9222',
  // or browserWSEndpoint: 'ws://localhost:9222/devtools/browser/...'
});
```

### Page Management

```javascript
// Create new page
const page = await browser.newPage();

// Get all pages
const pages = await browser.pages();

// Close page
await page.close();

// Multiple pages
const page1 = await browser.newPage();
const page2 = await browser.newPage();

// Switch between pages
await page1.bringToFront();
```

### Browser Context (Incognito)

```javascript
// Create isolated context
const context = await browser.createBrowserContext();
const page = await context.newPage();

// Cleanup context
await context.close();
```

---

## Navigation

### Basic Navigation

```javascript
// Navigate to URL
await page.goto('https://example.com');

// Navigate with options
await page.goto('https://example.com', {
  waitUntil: 'networkidle2',    // or 'load', 'domcontentloaded', 'networkidle0'
  timeout: 30000                 // Max wait time (ms)
});

// Reload page
await page.reload({ waitUntil: 'networkidle2' });

// Navigation history
await page.goBack();
await page.goForward();

// Wait for navigation
await page.waitForNavigation({
  waitUntil: 'networkidle2'
});
```

### Wait Until Options

- `load` - Wait for load event
- `domcontentloaded` - Wait for DOMContentLoaded event
- `networkidle0` - Wait until no network connections for 500ms
- `networkidle2` - Wait until max 2 network connections for 500ms

---

## Element Interaction

### Selectors

```javascript
// CSS selectors
await page.$('#id');
await page.$('.class');
await page.$('div > p');

// XPath
await page.$x('//button[text()="Submit"]');

// Get all matching elements
await page.$$('.item');
await page.$$x('//div[@class="item"]');
```

### Click Elements

```javascript
// Click by selector
await page.click('.button');

// Click with options
await page.click('.button', {
  button: 'left',           // or 'right', 'middle'
  clickCount: 1,            // 2 for double-click
  delay: 100                // Delay between mousedown and mouseup
});

// ElementHandle click
const button = await page.$('.button');
await button.click();
```

### Type Text

```javascript
// Type into input
await page.type('#search', 'query text');

// Type with delay
await page.type('#search', 'slow typing', { delay: 100 });

// Clear and type
await page.$eval('#search', el => el.value = '');
await page.type('#search', 'new text');
```

### Form Interaction

```javascript
// Fill input
await page.type('#username', 'john@example.com');
await page.type('#password', 'secret123');

// Select dropdown option
await page.select('#country', 'US');           // By value
await page.select('#country', 'USA', 'UK');    // Multiple

// Check/uncheck checkbox
await page.click('input[type="checkbox"]');

// Choose radio button
await page.click('input[value="option2"]');

// Upload file
const input = await page.$('input[type="file"]');
await input.uploadFile('/path/to/file.pdf');

// Submit form
await page.click('button[type="submit"]');
await page.waitForNavigation();
```

### Hover & Focus

```javascript
// Hover over element
await page.hover('.menu-item');

// Focus element
await page.focus('#input');

// Blur
await page.$eval('#input', el => el.blur());
```

### Drag & Drop

```javascript
const source = await page.$('.draggable');
const target = await page.$('.drop-zone');

await source.drag(target);
await source.drop(target);
```

---

## JavaScript Execution

### Evaluate in Page Context

```javascript
// Execute JavaScript
const title = await page.evaluate(() => document.title);

// With arguments
const text = await page.evaluate(
  (selector) => document.querySelector(selector).textContent,
  '.heading'
);

// Return complex data
const data = await page.evaluate(() => ({
  title: document.title,
  url: location.href,
  cookies: document.cookie
}));

// With ElementHandle
const element = await page.$('.button');
const text = await page.evaluate(el => el.textContent, element);
```

### Query & Modify DOM

```javascript
// Get element property
const value = await page.$eval('#input', el => el.value);

// Get multiple elements
const items = await page.$$eval('.item', elements =>
  elements.map(el => el.textContent)
);

// Modify element
await page.$eval('#input', (el, value) => {
  el.value = value;
}, 'new value');

// Add class
await page.$eval('.element', el => el.classList.add('active'));
```

### Expose Functions

```javascript
// Expose Node.js function to page
await page.exposeFunction('md5', (text) =>
  crypto.createHash('md5').update(text).digest('hex')
);

// Call from page context
const hash = await page.evaluate(async () => {
  return await window.md5('hello world');
});
```

---

## Screenshots & PDFs

### Screenshots

```javascript
// Full page screenshot
await page.screenshot({
  path: 'screenshot.png',
  fullPage: true
});

// Viewport screenshot
await page.screenshot({
  path: 'viewport.png',
  fullPage: false
});

// Element screenshot
const element = await page.$('.chart');
await element.screenshot({
  path: 'chart.png'
});

// Screenshot options
await page.screenshot({
  path: 'page.png',
  type: 'png',              // or 'jpeg', 'webp'
  quality: 80,              // JPEG quality (0-100)
  clip: {                   // Crop region
    x: 0,
    y: 0,
    width: 500,
    height: 500
  },
  omitBackground: true      // Transparent background
});

// Screenshot to buffer
const buffer = await page.screenshot();
```

### PDF Generation

```javascript
// Generate PDF
await page.pdf({
  path: 'page.pdf',
  format: 'A4',             // or 'Letter', 'Legal', etc.
  printBackground: true,
  margin: {
    top: '1cm',
    right: '1cm',
    bottom: '1cm',
    left: '1cm'
  }
});

// Custom page size
await page.pdf({
  path: 'custom.pdf',
  width: '8.5in',
  height: '11in',
  landscape: true
});

// Header and footer
await page.pdf({
  path: 'report.pdf',
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:10px;">Header</div>',
  footerTemplate: '<div style="font-size:10px;">Page <span class="pageNumber"></span></div>'
});
```

---

## Network Interception

### Request Interception

```javascript
// Enable request interception
await page.setRequestInterception(true);

// Intercept requests
page.on('request', (request) => {
  // Block specific resource types
  if (request.resourceType() === 'image') {
    request.abort();
  }
  // Block URLs
  else if (request.url().includes('ads')) {
    request.abort();
  }
  // Modify request
  else if (request.url().includes('api')) {
    request.continue({
      headers: {
        ...request.headers(),
        'Authorization': 'Bearer token'
      }
    });
  }
  // Continue normally
  else {
    request.continue();
  }
});
```

### Mock Responses

```javascript
await page.setRequestInterception(true);

page.on('request', (request) => {
  if (request.url().includes('/api/user')) {
    request.respond({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        name: 'Mock User'
      })
    });
  } else {
    request.continue();
  }
});
```

### Monitor Network

```javascript
// Track requests
page.on('request', (request) => {
  console.log('Request:', request.method(), request.url());
});

// Track responses
page.on('response', (response) => {
  console.log('Response:', response.status(), response.url());
});

// Track failed requests
page.on('requestfailed', (request) => {
  console.log('Failed:', request.failure().errorText, request.url());
});

// Get response body
page.on('response', async (response) => {
  if (response.url().includes('/api/data')) {
    const json = await response.json();
    console.log('API Data:', json);
  }
});
```

---

## Device Emulation

### Predefined Devices

```javascript
import { devices } from 'puppeteer';

// Emulate iPhone
const iPhone = devices['iPhone 13 Pro'];
await page.emulate(iPhone);

// Common devices
const iPad = devices['iPad Pro'];
const pixel = devices['Pixel 5'];
const galaxy = devices['Galaxy S9+'];

// Navigate after emulation
await page.goto('https://example.com');
```

### Custom Device

```javascript
await page.emulate({
  viewport: {
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    isLandscape: false
  },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)...'
});
```

### Viewport Only

```javascript
await page.setViewport({
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1
});
```

### Geolocation

```javascript
// Set geolocation
await page.setGeolocation({
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 100
});

// Grant permissions
const context = browser.defaultBrowserContext();
await context.overridePermissions('https://example.com', ['geolocation']);
```

### Timezone & Locale

```javascript
// Set timezone
await page.emulateTimezone('America/New_York');

// Set locale
await page.emulateMediaType('screen');
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, 'language', {
    get: () => 'en-US'
  });
});
```

---

## Performance

### CPU & Network Throttling

```javascript
// CPU throttling
const client = await page.createCDPSession();
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

// Network throttling
await page.emulateNetworkConditions({
  offline: false,
  downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
  uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
  latency: 40                                  // 40ms RTT
});

// Predefined profiles
await page.emulateNetworkConditions(
  puppeteer.networkConditions['Fast 3G']
);

// Disable throttling
await page.emulateNetworkConditions({
  offline: false,
  downloadThroughput: -1,
  uploadThroughput: -1,
  latency: 0
});
```

### Performance Metrics

```javascript
// Get metrics
const metrics = await page.metrics();
console.log(metrics);
// {
//   Timestamp, Documents, Frames, JSEventListeners,
//   Nodes, LayoutCount, RecalcStyleCount,
//   LayoutDuration, RecalcStyleDuration,
//   ScriptDuration, TaskDuration,
//   JSHeapUsedSize, JSHeapTotalSize
// }
```

### Performance Tracing

```javascript
// Start tracing
await page.tracing.start({
  path: 'trace.json',
  categories: [
    'devtools.timeline',
    'disabled-by-default-devtools.timeline'
  ]
});

// Navigate
await page.goto('https://example.com');

// Stop tracing
await page.tracing.stop();

// Analyze trace in chrome://tracing
```

### Coverage (Code Usage)

```javascript
// Start JS coverage
await page.coverage.startJSCoverage();

// Start CSS coverage
await page.coverage.startCSSCoverage();

// Navigate
await page.goto('https://example.com');

// Stop and get coverage
const jsCoverage = await page.coverage.stopJSCoverage();
const cssCoverage = await page.coverage.stopCSSCoverage();

// Calculate unused bytes
let totalBytes = 0;
let usedBytes = 0;
for (const entry of [...jsCoverage, ...cssCoverage]) {
  totalBytes += entry.text.length;
  for (const range of entry.ranges) {
    usedBytes += range.end - range.start - 1;
  }
}

console.log(`Used: ${usedBytes / totalBytes * 100}%`);
```

---

## Common Patterns

### Wait for Elements

```javascript
// Wait for selector
await page.waitForSelector('.element', {
  visible: true,
  timeout: 5000
});

// Wait for XPath
await page.waitForXPath('//button[text()="Submit"]');

// Wait for function
await page.waitForFunction(
  () => document.querySelector('.loading') === null,
  { timeout: 10000 }
);

// Wait for timeout
await page.waitForTimeout(2000);
```

### Handle Dialogs

```javascript
// Alert, confirm, prompt
page.on('dialog', async (dialog) => {
  console.log(dialog.type(), dialog.message());

  // Accept
  await dialog.accept();
  // or reject
  // await dialog.dismiss();
  // or provide input for prompt
  // await dialog.accept('input text');
});
```

### Handle Downloads

```javascript
// Set download path
const client = await page.createCDPSession();
await client.send('Page.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: '/path/to/downloads'
});

// Trigger download
await page.click('a[download]');
```

### Multiple Pages (Tabs)

```javascript
// Listen for new pages
browser.on('targetcreated', async (target) => {
  if (target.type() === 'page') {
    const newPage = await target.page();
    console.log('New page opened:', newPage.url());
  }
});

// Click link that opens new tab
const [newPage] = await Promise.all([
  new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
  page.click('a[target="_blank"]')
]);

console.log('New page URL:', newPage.url());
```

### Frames (iframes)

```javascript
// Get all frames
const frames = page.frames();

// Find frame by name
const frame = page.frames().find(f => f.name() === 'myframe');

// Find frame by URL
const frame = page.frames().find(f => f.url().includes('example.com'));

// Main frame
const mainFrame = page.mainFrame();

// Interact with frame
await frame.click('.button');
await frame.type('#input', 'text');
```

### Infinite Scroll

```javascript
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

await autoScroll(page);
```

### Cookies

```javascript
// Get cookies
const cookies = await page.cookies();

// Set cookies
await page.setCookie({
  name: 'session',
  value: 'abc123',
  domain: 'example.com',
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'Strict'
});

// Delete cookies
await page.deleteCookie({ name: 'session' });
```

### Local Storage

```javascript
// Set localStorage
await page.evaluate(() => {
  localStorage.setItem('key', 'value');
});

// Get localStorage
const value = await page.evaluate(() => {
  return localStorage.getItem('key');
});

// Clear localStorage
await page.evaluate(() => localStorage.clear());
```

### Error Handling

```javascript
try {
  await page.goto('https://example.com', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.error('Page load timeout');
  } else {
    console.error('Navigation failed:', error);
  }

  // Take screenshot on error
  await page.screenshot({ path: 'error.png' });
}
```

### Stealth Mode (Avoid Detection)

```javascript
// Hide automation indicators
await page.evaluateOnNewDocument(() => {
  // Override navigator.webdriver
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false
  });

  // Mock chrome object
  window.chrome = {
    runtime: {}
  };

  // Mock permissions
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ?
      Promise.resolve({ state: 'granted' }) :
      originalQuery(parameters)
  );
});

// Set realistic user agent
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);
```

---

## Debugging Tips

### Take Screenshots on Error

```javascript
page.on('pageerror', async (error) => {
  console.error('Page error:', error);
  await page.screenshot({ path: `error-${Date.now()}.png` });
});
```

### Console Logging

```javascript
// Forward console to Node
page.on('console', (msg) => {
  console.log('PAGE LOG:', msg.text());
});
```

### Slow Down Execution

```javascript
const browser = await puppeteer.launch({
  slowMo: 250  // 250ms delay between actions
});
```

### Keep Browser Open

```javascript
const browser = await puppeteer.launch({
  headless: false,
  devtools: true
});

// Prevent auto-close
await page.evaluate(() => debugger);
```

---

## Best Practices

1. **Always close browser:** Use try/finally or process cleanup
2. **Wait appropriately:** Use waitForSelector, not setTimeout
3. **Handle errors:** Wrap navigation in try/catch
4. **Optimize selectors:** Use specific selectors for reliability
5. **Avoid race conditions:** Wait for navigation after clicks
6. **Reuse pages:** Don't create new pages unnecessarily
7. **Set timeouts:** Always specify reasonable timeouts
8. **Clean up:** Close unused pages and contexts

---

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Puppeteer API](https://pptr.dev/api)
- [Puppeteer Examples](https://github.com/puppeteer/puppeteer/tree/main/examples)
- [Awesome Puppeteer](https://github.com/transitive-bullshit/awesome-puppeteer)

```

### references/performance-guide.md

```markdown
# Performance Analysis Guide

Comprehensive guide to analyzing web performance using Chrome DevTools Protocol, Puppeteer, and chrome-devtools skill.

## Table of Contents

- [Core Web Vitals](#core-web-vitals)
- [Performance Tracing](#performance-tracing)
- [Network Analysis](#network-analysis)
- [JavaScript Performance](#javascript-performance)
- [Rendering Performance](#rendering-performance)
- [Memory Analysis](#memory-analysis)
- [Optimization Strategies](#optimization-strategies)

---

## Core Web Vitals

### Overview

Core Web Vitals are Google's standardized metrics for measuring user experience:

- **LCP (Largest Contentful Paint)** - Loading performance (< 2.5s good)
- **FID (First Input Delay)** - Interactivity (< 100ms good)
- **CLS (Cumulative Layout Shift)** - Visual stability (< 0.1 good)

### Measuring with chrome-devtools-mcp

```javascript
// Start performance trace
await useTool('performance_start_trace', {
  categories: ['loading', 'rendering', 'scripting']
});

// Navigate to page
await useTool('navigate_page', {
  url: 'https://example.com'
});

// Wait for complete load
await useTool('wait_for', {
  waitUntil: 'networkidle'
});

// Stop trace and get data
await useTool('performance_stop_trace');

// Get AI-powered insights
const insights = await useTool('performance_analyze_insight');

// insights will include:
// - LCP timing
// - FID analysis
// - CLS score
// - Performance recommendations
```

### Measuring with Puppeteer

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();

// Measure Core Web Vitals
await page.goto('https://example.com', {
  waitUntil: 'networkidle2'
});

const vitals = await page.evaluate(() => {
  return new Promise((resolve) => {
    const vitals = {
      LCP: null,
      FID: null,
      CLS: 0
    };

    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      vitals.LCP = entries[entries.length - 1].renderTime ||
                   entries[entries.length - 1].loadTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID
    new PerformanceObserver((list) => {
      vitals.FID = list.getEntries()[0].processingStart -
                   list.getEntries()[0].startTime;
    }).observe({ entryTypes: ['first-input'] });

    // CLS
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          vitals.CLS += entry.value;
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });

    // Wait 5 seconds for metrics
    setTimeout(() => resolve(vitals), 5000);
  });
});

console.log('Core Web Vitals:', vitals);
```

### Other Important Metrics

**TTFB (Time to First Byte)**
```javascript
const ttfb = await page.evaluate(() => {
  const [navigationEntry] = performance.getEntriesByType('navigation');
  return navigationEntry.responseStart - navigationEntry.requestStart;
});
```

**FCP (First Contentful Paint)**
```javascript
const fcp = await page.evaluate(() => {
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
  return fcpEntry ? fcpEntry.startTime : null;
});
```

**TTI (Time to Interactive)**
```javascript
// Requires lighthouse or manual calculation
const tti = await page.evaluate(() => {
  // Complex calculation based on network idle and long tasks
  // Best to use Lighthouse for accurate TTI
});
```

---

## Performance Tracing

### Chrome Trace Categories

**Loading:**
- Page load events
- Resource loading
- Parser activity

**Rendering:**
- Layout calculations
- Paint operations
- Compositing

**Scripting:**
- JavaScript execution
- V8 compilation
- Garbage collection

**Network:**
- HTTP requests
- WebSocket traffic
- Resource fetching

**Input:**
- User input processing
- Touch/scroll events

**GPU:**
- GPU operations
- Compositing work

### Record Performance Trace

**Using chrome-devtools-mcp:**
```javascript
// Start trace with specific categories
await useTool('performance_start_trace', {
  categories: ['loading', 'rendering', 'scripting', 'network']
});

// Perform actions
await useTool('navigate_page', { url: 'https://example.com' });
await useTool('wait_for', { waitUntil: 'networkidle' });

// Optional: Interact with page
await useTool('click', { uid: 'button-uid' });

// Stop trace
const traceData = await useTool('performance_stop_trace');

// Analyze trace
const insights = await useTool('performance_analyze_insight');
```

**Using Puppeteer:**
```javascript
// Start tracing
await page.tracing.start({
  path: 'trace.json',
  categories: [
    'devtools.timeline',
    'disabled-by-default-devtools.timeline',
    'disabled-by-default-v8.cpu_profiler'
  ]
});

// Navigate
await page.goto('https://example.com', {
  waitUntil: 'networkidle2'
});

// Stop tracing
await page.tracing.stop();

// Analyze in Chrome DevTools (chrome://tracing)
```

### Analyze Trace Data

**Key Metrics from Trace:**

1. **Main Thread Activity**
   - JavaScript execution time
   - Layout/reflow time
   - Paint time
   - Long tasks (> 50ms)

2. **Network Waterfall**
   - Request start times
   - DNS lookup
   - Connection time
   - Download time

3. **Rendering Pipeline**
   - DOM construction
   - Style calculation
   - Layout
   - Paint
   - Composite

**Common Issues to Look For:**
- Long tasks blocking main thread
- Excessive JavaScript execution
- Layout thrashing
- Unnecessary repaints
- Slow network requests
- Large bundle sizes

---

## Network Analysis

### Monitor Network Requests

**Using chrome-devtools-mcp:**
```javascript
// Navigate to page
await useTool('navigate_page', { url: 'https://example.com' });

// Wait for all requests
await useTool('wait_for', { waitUntil: 'networkidle' });

// List all requests
const requests = await useTool('list_network_requests', {
  resourceTypes: ['Document', 'Script', 'Stylesheet', 'Image', 'XHR', 'Fetch'],
  pageSize: 100
});

// Analyze specific request
for (const req of requests.requests) {
  const details = await useTool('get_network_request', {
    requestId: req.id
  });

  console.log({
    url: details.url,
    method: details.method,
    status: details.status,
    size: details.encodedDataLength,
    time: details.timing.receiveHeadersEnd - details.timing.requestTime,
    cached: details.fromCache
  });
}
```

**Using Puppeteer:**
```javascript
const requests = [];

// Capture all requests
page.on('request', (request) => {
  requests.push({
    url: request.url(),
    method: request.method(),
    resourceType: request.resourceType(),
    headers: request.headers()
  });
});

// Capture responses
page.on('response', (response) => {
  const request = response.request();
  console.log({
    url: response.url(),
    status: response.status(),
    size: response.headers()['content-length'],
    cached: response.fromCache(),
    timing: response.timing()
  });
});

await page.goto('https://example.com');
```

### Network Performance Metrics

**Calculate Total Page Weight:**
```javascript
let totalBytes = 0;
let resourceCounts = {};

page.on('response', async (response) => {
  const type = response.request().resourceType();
  const buffer = await response.buffer();

  totalBytes += buffer.length;
  resourceCounts[type] = (resourceCounts[type] || 0) + 1;
});

await page.goto('https://example.com');

console.log('Total size:', (totalBytes / 1024 / 1024).toFixed(2), 'MB');
console.log('Resources:', resourceCounts);
```

**Identify Slow Requests:**
```javascript
page.on('response', (response) => {
  const timing = response.timing();
  const totalTime = timing.receiveHeadersEnd - timing.requestTime;

  if (totalTime > 1000) { // Slower than 1 second
    console.log('Slow request:', {
      url: response.url(),
      time: totalTime.toFixed(2) + 'ms',
      size: response.headers()['content-length']
    });
  }
});
```

### Network Throttling

**Simulate Slow Connection:**
```javascript
// Using chrome-devtools-mcp
await useTool('emulate_network', {
  throttlingOption: 'Slow 3G'  // or 'Fast 3G', 'Slow 4G'
});

// Using Puppeteer
const client = await page.createCDPSession();
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 400 * 1024 / 8,  // 400 Kbps
  uploadThroughput: 400 * 1024 / 8,
  latency: 2000  // 2000ms RTT
});
```

---

## JavaScript Performance

### Identify Long Tasks

**Using Performance Observer:**
```javascript
await page.evaluate(() => {
  return new Promise((resolve) => {
    const longTasks = [];

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        longTasks.push({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
      });
    });

    observer.observe({ entryTypes: ['longtask'] });

    // Collect for 10 seconds
    setTimeout(() => {
      observer.disconnect();
      resolve(longTasks);
    }, 10000);
  });
});
```

### CPU Profiling

**Using Puppeteer:**
```javascript
// Start CPU profiling
const client = await page.createCDPSession();
await client.send('Profiler.enable');
await client.send('Profiler.start');

// Navigate and interact
await page.goto('https://example.com');
await page.click('.button');

// Stop profiling
const { profile } = await client.send('Profiler.stop');

// Analyze profile (flame graph data)
// Import into Chrome DevTools for visualization
```

### JavaScript Coverage

**Identify Unused Code:**
```javascript
// Start coverage
await Promise.all([
  page.coverage.startJSCoverage(),
  page.coverage.startCSSCoverage()
]);

// Navigate
await page.goto('https://example.com');

// Stop coverage
const [jsCoverage, cssCoverage] = await Promise.all([
  page.coverage.stopJSCoverage(),
  page.coverage.stopCSSCoverage()
]);

// Calculate unused bytes
function calculateUnusedBytes(coverage) {
  let usedBytes = 0;
  let totalBytes = 0;

  for (const entry of coverage) {
    totalBytes += entry.text.length;
    for (const range of entry.ranges) {
      usedBytes += range.end - range.start - 1;
    }
  }

  return {
    usedBytes,
    totalBytes,
    unusedBytes: totalBytes - usedBytes,
    unusedPercentage: ((totalBytes - usedBytes) / totalBytes * 100).toFixed(2)
  };
}

console.log('JS Coverage:', calculateUnusedBytes(jsCoverage));
console.log('CSS Coverage:', calculateUnusedBytes(cssCoverage));
```

### Bundle Size Analysis

**Analyze JavaScript Bundles:**
```javascript
page.on('response', async (response) => {
  const url = response.url();
  const type = response.request().resourceType();

  if (type === 'script') {
    const buffer = await response.buffer();
    const size = buffer.length;

    console.log({
      url: url.split('/').pop(),
      size: (size / 1024).toFixed(2) + ' KB',
      gzipped: response.headers()['content-encoding'] === 'gzip'
    });
  }
});
```

---

## Rendering Performance

### Layout Thrashing Detection

**Monitor Layout Recalculations:**
```javascript
// Using Performance Observer
await page.evaluate(() => {
  return new Promise((resolve) => {
    const measurements = [];

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure' &&
            entry.name.includes('layout')) {
          measurements.push({
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    setTimeout(() => {
      observer.disconnect();
      resolve(measurements);
    }, 5000);
  });
});
```

### Paint and Composite Metrics

**Get Paint Metrics:**
```javascript
const paintMetrics = await page.evaluate(() => {
  const paints = performance.getEntriesByType('paint');
  return {
    firstPaint: paints.find(p => p.name === 'first-paint')?.startTime,
    firstContentfulPaint: paints.find(p => p.name === 'first-contentful-paint')?.startTime
  };
});
```

### Frame Rate Analysis

**Monitor FPS:**
```javascript
await page.evaluate(() => {
  return new Promise((resolve) => {
    let frames = 0;
    let lastTime = performance.now();

    function countFrames() {
      frames++;
      requestAnimationFrame(countFrames);
    }

    countFrames();

    setTimeout(() => {
      const now = performance.now();
      const elapsed = (now - lastTime) / 1000;
      const fps = frames / elapsed;
      resolve(fps);
    }, 5000);
  });
});
```

### Layout Shifts (CLS)

**Track Individual Shifts:**
```javascript
await page.evaluate(() => {
  return new Promise((resolve) => {
    const shifts = [];
    let totalCLS = 0;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          totalCLS += entry.value;
          shifts.push({
            value: entry.value,
            time: entry.startTime,
            elements: entry.sources?.map(s => s.node)
          });
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });

    setTimeout(() => {
      observer.disconnect();
      resolve({ totalCLS, shifts });
    }, 10000);
  });
});
```

---

## Memory Analysis

### Memory Metrics

**Get Memory Usage:**
```javascript
// Using chrome-devtools-mcp
await useTool('evaluate_script', {
  expression: `
    ({
      usedJSHeapSize: performance.memory?.usedJSHeapSize,
      totalJSHeapSize: performance.memory?.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory?.jsHeapSizeLimit
    })
  `,
  returnByValue: true
});

// Using Puppeteer
const metrics = await page.metrics();
console.log({
  jsHeapUsed: (metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2) + ' MB',
  jsHeapTotal: (metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2) + ' MB',
  domNodes: metrics.Nodes,
  documents: metrics.Documents,
  jsEventListeners: metrics.JSEventListeners
});
```

### Memory Leak Detection

**Monitor Memory Over Time:**
```javascript
async function detectMemoryLeak(page, duration = 30000) {
  const samples = [];
  const interval = 1000; // Sample every second
  const samples_count = duration / interval;

  for (let i = 0; i < samples_count; i++) {
    const metrics = await page.metrics();
    samples.push({
      time: i,
      heapUsed: metrics.JSHeapUsedSize
    });

    await page.waitForTimeout(interval);
  }

  // Analyze trend
  const firstSample = samples[0].heapUsed;
  const lastSample = samples[samples.length - 1].heapUsed;
  const increase = ((lastSample - firstSample) / firstSample * 100).toFixed(2);

  return {
    samples,
    memoryIncrease: increase + '%',
    possibleLeak: increase > 50 // > 50% increase indicates possible leak
  };
}

const leakAnalysis = await detectMemoryLeak(page, 30000);
console.log('Memory Analysis:', leakAnalysis);
```

### Heap Snapshot

**Capture Heap Snapshot:**
```javascript
const client = await page.createCDPSession();

// Take snapshot
await client.send('HeapProfiler.enable');
const { result } = await client.send('HeapProfiler.takeHeapSnapshot');

// Snapshot is streamed in chunks
// Save to file or analyze programmatically
```

---

## Optimization Strategies

### Image Optimization

**Detect Unoptimized Images:**
```javascript
const images = await page.evaluate(() => {
  const images = Array.from(document.querySelectorAll('img'));
  return images.map(img => ({
    src: img.src,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    displayWidth: img.width,
    displayHeight: img.height,
    oversized: img.naturalWidth > img.width * 1.5 ||
               img.naturalHeight > img.height * 1.5
  }));
});

const oversizedImages = images.filter(img => img.oversized);
console.log('Oversized images:', oversizedImages);
```

### Font Loading

**Detect Render-Blocking Fonts:**
```javascript
const fonts = await page.evaluate(() => {
  return Array.from(document.fonts).map(font => ({
    family: font.family,
    weight: font.weight,
    style: font.style,
    status: font.status,
    loaded: font.status === 'loaded'
  }));
});

console.log('Fonts:', fonts);
```

### Third-Party Scripts

**Measure Third-Party Impact:**
```javascript
const thirdPartyDomains = ['googletagmanager.com', 'facebook.net', 'doubleclick.net'];

page.on('response', async (response) => {
  const url = response.url();
  const isThirdParty = thirdPartyDomains.some(domain => url.includes(domain));

  if (isThirdParty) {
    const buffer = await response.buffer();
    console.log({
      url: url,
      size: (buffer.length / 1024).toFixed(2) + ' KB',
      type: response.request().resourceType()
    });
  }
});
```

### Critical Rendering Path

**Identify Render-Blocking Resources:**
```javascript
await page.goto('https://example.com');

const renderBlockingResources = await page.evaluate(() => {
  const resources = performance.getEntriesByType('resource');
  return resources.filter(resource => {
    return (resource.initiatorType === 'link' &&
            resource.name.includes('.css')) ||
           (resource.initiatorType === 'script' &&
            !resource.name.includes('async'));
  }).map(r => ({
    url: r.name,
    duration: r.duration,
    startTime: r.startTime
  }));
});

console.log('Render-blocking resources:', renderBlockingResources);
```

### Lighthouse Integration

**Run Lighthouse Audit:**
```javascript
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

// Launch Chrome
const chrome = await launch({ chromeFlags: ['--headless'] });

// Run Lighthouse
const { lhr } = await lighthouse('https://example.com', {
  port: chrome.port,
  onlyCategories: ['performance']
});

// Get scores
console.log({
  performanceScore: lhr.categories.performance.score * 100,
  metrics: {
    FCP: lhr.audits['first-contentful-paint'].displayValue,
    LCP: lhr.audits['largest-contentful-paint'].displayValue,
    TBT: lhr.audits['total-blocking-time'].displayValue,
    CLS: lhr.audits['cumulative-layout-shift'].displayValue,
    SI: lhr.audits['speed-index'].displayValue
  },
  opportunities: lhr.audits['opportunities']
});

await chrome.kill();
```

---

## Performance Budgets

### Set Performance Budgets

```javascript
const budgets = {
  // Core Web Vitals
  LCP: 2500,        // ms
  FID: 100,         // ms
  CLS: 0.1,         // score

  // Other metrics
  FCP: 1800,        // ms
  TTI: 3800,        // ms
  TBT: 300,         // ms

  // Resource budgets
  totalPageSize: 2 * 1024 * 1024,  // 2 MB
  jsSize: 500 * 1024,               // 500 KB
  cssSize: 100 * 1024,              // 100 KB
  imageSize: 1 * 1024 * 1024,       // 1 MB

  // Request counts
  totalRequests: 50,
  jsRequests: 10,
  cssRequests: 5
};

async function checkBudgets(page, budgets) {
  // Measure actual values
  const vitals = await measureCoreWebVitals(page);
  const resources = await analyzeResources(page);

  // Compare against budgets
  const violations = [];

  if (vitals.LCP > budgets.LCP) {
    violations.push(`LCP: ${vitals.LCP}ms exceeds budget of ${budgets.LCP}ms`);
  }

  if (resources.totalSize > budgets.totalPageSize) {
    violations.push(`Page size: ${resources.totalSize} exceeds budget of ${budgets.totalPageSize}`);
  }

  // ... check other budgets

  return {
    passed: violations.length === 0,
    violations
  };
}
```

---

## Automated Performance Testing

### CI/CD Integration

```javascript
// performance-test.js
import puppeteer from 'puppeteer';

async function performanceTest(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Measure metrics
  await page.goto(url, { waitUntil: 'networkidle2' });
  const metrics = await page.metrics();
  const vitals = await measureCoreWebVitals(page);

  await browser.close();

  // Check against thresholds
  const thresholds = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    jsHeapSize: 50 * 1024 * 1024  // 50 MB
  };

  const failed = [];
  if (vitals.LCP > thresholds.LCP) failed.push('LCP');
  if (vitals.FID > thresholds.FID) failed.push('FID');
  if (vitals.CLS > thresholds.CLS) failed.push('CLS');
  if (metrics.JSHeapUsedSize > thresholds.jsHeapSize) failed.push('Memory');

  if (failed.length > 0) {
    console.error('Performance test failed:', failed);
    process.exit(1);
  }

  console.log('Performance test passed');
}

performanceTest(process.env.TEST_URL);
```

---

## Best Practices

### Performance Testing Checklist

1. **Measure Multiple Times**
   - Run tests 3-5 times
   - Use median values
   - Account for variance

2. **Test Different Conditions**
   - Fast 3G
   - Slow 3G
   - Offline
   - CPU throttling

3. **Test Different Devices**
   - Mobile (low-end)
   - Mobile (high-end)
   - Desktop
   - Tablet

4. **Monitor Over Time**
   - Track metrics in CI/CD
   - Set up alerts for regressions
   - Create performance dashboards

5. **Focus on User Experience**
   - Prioritize Core Web Vitals
   - Test real user journeys
   - Consider perceived performance

6. **Optimize Critical Path**
   - Minimize render-blocking resources
   - Defer non-critical JavaScript
   - Optimize font loading
   - Lazy load images

---

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [WebPageTest](https://www.webpagetest.org/)

```

### scripts/README.md

```markdown
# Chrome DevTools Scripts

CLI scripts for browser automation using Puppeteer.

**CRITICAL**: Always check `pwd` before running scripts.

## Installation

### Quick Install

```bash
pwd  # Should show current working directory
cd .claude/skills/chrome-devtools/scripts
./install.sh  # Auto-checks dependencies and installs
```

### Manual Installation

**Linux/WSL** - Install system dependencies first:
```bash
./install-deps.sh  # Auto-detects OS (Ubuntu, Debian, Fedora, etc.)
```

Or manually:
```bash
sudo apt-get install -y libnss3 libnspr4 libasound2t64 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1
```

**All platforms** - Install Node dependencies:
```bash
npm install
```

## Scripts

**CRITICAL**: Always check `pwd` before running scripts.

### navigate.js
Navigate to a URL.

```bash
node navigate.js --url https://example.com [--wait-until networkidle2] [--timeout 30000]
```

### screenshot.js
Take a screenshot with automatic compression.

**Important**: Always save screenshots to `./docs/screenshots` directory.

```bash
node screenshot.js --output screenshot.png [--url https://example.com] [--full-page true] [--selector .element] [--max-size 5] [--no-compress]
```

**Automatic Compression**: Screenshots >5MB are automatically compressed using ImageMagick to ensure compatibility with Gemini API and Claude Code. Install ImageMagick for this feature:
- macOS: `brew install imagemagick`
- Linux: `sudo apt-get install imagemagick`

Options:
- `--max-size N` - Custom size threshold in MB (default: 5)
- `--no-compress` - Disable automatic compression
- `--format png|jpeg` - Output format (default: png)
- `--quality N` - JPEG quality 0-100 (default: auto)

### click.js
Click an element.

```bash
node click.js --selector ".button" [--url https://example.com] [--wait-for ".result"]
```

### fill.js
Fill form fields.

```bash
node fill.js --selector "#input" --value "text" [--url https://example.com] [--clear true]
```

### evaluate.js
Execute JavaScript in page context.

```bash
node evaluate.js --script "document.title" [--url https://example.com]
```

### snapshot.js
Get DOM snapshot with interactive elements.

```bash
node snapshot.js [--url https://example.com] [--output snapshot.json]
```

### console.js
Monitor console messages.

```bash
node console.js --url https://example.com [--types error,warn] [--duration 5000]
```

### network.js
Monitor network requests.

```bash
node network.js --url https://example.com [--types xhr,fetch] [--output requests.json]
```

### performance.js
Measure performance metrics and record trace.

```bash
node performance.js --url https://example.com [--trace trace.json] [--metrics] [--resources true]
```

## Common Options

- `--headless false` - Show browser window
- `--close false` - Keep browser open
- `--timeout 30000` - Set timeout in milliseconds
- `--wait-until networkidle2` - Wait strategy (load, domcontentloaded, networkidle0, networkidle2)

## Selector Support

Scripts that accept `--selector` (click.js, fill.js, screenshot.js) support both **CSS** and **XPath** selectors.

### CSS Selectors (Default)

```bash
# Element tag
node click.js --selector "button" --url https://example.com

# Class selector
node click.js --selector ".btn-submit" --url https://example.com

# ID selector
node fill.js --selector "#email" --value "user@example.com" --url https://example.com

# Attribute selector
node click.js --selector 'button[type="submit"]' --url https://example.com

# Complex selector
node screenshot.js --selector "div.container > button.btn-primary" --output btn.png
```

### XPath Selectors

XPath selectors start with `/` or `(//` and are automatically detected:

```bash
# Text matching - exact
node click.js --selector '//button[text()="Submit"]' --url https://example.com

# Text matching - contains
node click.js --selector '//button[contains(text(),"Submit")]' --url https://example.com

# Attribute matching
node fill.js --selector '//input[@type="email"]' --value "user@example.com"

# Multiple conditions
node click.js --selector '//button[@type="submit" and contains(text(),"Save")]'

# Descendant selection
node screenshot.js --selector '//div[@class="modal"]//button[@class="close"]' --output modal.png

# Nth element
node click.js --selector '(//button)[2]'  # Second button on page
```

### Discovering Selectors

Use `snapshot.js` to discover correct selectors:

```bash
# Get all interactive elements
node snapshot.js --url https://example.com | jq '.elements[]'

# Find buttons
node snapshot.js --url https://example.com | jq '.elements[] | select(.tagName=="BUTTON")'

# Find inputs
node snapshot.js --url https://example.com | jq '.elements[] | select(.tagName=="INPUT")'
```

### Security

XPath selectors are validated to prevent injection attacks. The following patterns are blocked:
- `javascript:`
- `<script`
- `onerror=`, `onload=`, `onclick=`
- `eval(`, `Function(`, `constructor(`

Selectors exceeding 1000 characters are rejected (DoS prevention).

## Output Format

All scripts output JSON to stdout:

```json
{
  "success": true,
  "url": "https://example.com",
  "title": "Example Domain",
  ...
}
```

Errors are output to stderr:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "..."
}
```

```

