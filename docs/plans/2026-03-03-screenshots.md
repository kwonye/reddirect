# Screenshot Generation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate all 5 Chrome Web Store promotional images (3 screenshots + 2 promo tiles) from HTML/CSS templates using a headless Playwright renderer.

**Architecture:** Each image is a standalone HTML file in `scripts/screenshots/`. A single Node.js runner (`scripts/generate-screenshots.mjs`) opens each template in headless Chromium, screenshots it at the exact target dimensions, and writes a 24-bit opaque PNG to `assets/store/`. No alpha channel — `omitBackground: false` ensures a solid white background.

**Tech Stack:** Node.js (ESM), Playwright (headless Chromium), HTML/CSS (system font stack, inline SVG lock icons)

---

### Task 1: Install Playwright and scaffold directories

**Files:**
- Modify: `package.json`
- Create: `assets/store/.gitkeep`
- Create: `scripts/screenshots/` (directory)

**Step 1: Install Playwright**

```bash
npm install --save-dev playwright
npx playwright install chromium
```

Expected: Playwright installs and Chromium binary downloads to its local cache. You will see a progress line like `Downloading Chromium...`.

**Step 2: Create output directory**

```bash
mkdir -p assets/store
touch assets/store/.gitkeep
mkdir -p scripts/screenshots
```

**Step 3: Add npm script placeholder to package.json**

Open `package.json`. In the `"scripts"` object add:

```json
"generate:screenshots": "node ./scripts/generate-screenshots.mjs"
```

**Step 4: Commit**

```bash
git add package.json package-lock.json assets/store/.gitkeep
git commit -m "chore: install Playwright and scaffold screenshot directories"
```

---

### Task 2: Create shared.css

**Files:**
- Create: `scripts/screenshots/shared.css`

**Step 1: Write the file**

```css
/* scripts/screenshots/shared.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  background: #ffffff;
  color: #0f0f0f;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* ── Header: icon + wordmark ── */
.header {
  position: absolute;
  top: 40px;
  left: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.header .wordmark {
  font-size: 18px;
  font-weight: 600;
  color: #0f0f0f;
  letter-spacing: -0.3px;
}

/* ── Address bar ── */
.bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f1f3f4;
  border: 1.5px solid #e0e0e0;
  border-radius: 100px;
  padding: 14px 22px;
}

.bar .lock {
  flex-shrink: 0;
  color: #70757a;
}

.bar .url {
  font-size: 17px;
  font-weight: 400;
  white-space: nowrap;
}

.bar .url-before { color: #9aa0a6; }
.bar .url-after  { color: #0f0f0f; font-weight: 500; }

/* ── Arrow ── */
.arrow {
  color: #ff4500;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
}

/* ── Badge pill ── */
.badge {
  display: inline-flex;
  align-items: center;
  background: #f1f3f4;
  border-radius: 100px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 500;
  color: #0f0f0f;
  white-space: nowrap;
}

/* ── Footer tagline ── */
.footer {
  position: absolute;
  bottom: 36px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 15px;
  color: #70757a;
}
```

**Step 2: Commit**

```bash
git add scripts/screenshots/shared.css
git commit -m "feat(screenshots): add shared CSS design tokens"
```

---

### Task 3: Create screenshot-1.html — core concept (1280×800)

**Files:**
- Create: `scripts/screenshots/screenshot-1.html`

**Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1280">
  <link rel="stylesheet" href="shared.css">
  <style>
    body {
      width: 1280px;
      height: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    h1 {
      font-size: 52px;
      font-weight: 700;
      letter-spacing: -1.5px;
      line-height: 1.15;
      text-align: center;
      margin-bottom: 56px;
    }

    .transform {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      width: 680px;
    }

    .bar { width: 100%; }
  </style>
</head>
<body>
  <div class="header">
    <img src="../../assets/logo/reddirect-logo.svg" alt="">
    <span class="wordmark">Reddirect</span>
  </div>

  <h1>Clean Reddit links,<br>automatically.</h1>

  <div class="transform">
    <div class="bar">
      <svg class="lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span class="url url-before">nba.reddit.com</span>
    </div>

    <div class="arrow">↓</div>

    <div class="bar">
      <svg class="lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span class="url url-after">reddit.com/r/nba</span>
    </div>
  </div>

  <p class="footer">Installed and forgotten. Works on every subreddit subdomain.</p>
</body>
</html>
```

**Step 2: Preview in browser**

Open `scripts/screenshots/screenshot-1.html` directly in Chrome to check layout before running Playwright. The SVG path `../../assets/logo/reddirect-logo.svg` resolves correctly from a `file://` URL.

**Step 3: Commit**

```bash
git add scripts/screenshots/screenshot-1.html
git commit -m "feat(screenshots): add screenshot-1 template (core concept)"
```

---

### Task 4: Create screenshot-2.html — universal (1280×800)

**Files:**
- Create: `scripts/screenshots/screenshot-2.html`

**Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1280">
  <link rel="stylesheet" href="shared.css">
  <style>
    body {
      width: 1280px;
      height: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    h1 {
      font-size: 52px;
      font-weight: 700;
      letter-spacing: -1.5px;
      line-height: 1.15;
      text-align: center;
      margin-bottom: 52px;
    }

    .examples {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 820px;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .row .bar {
      flex: 1;
    }

    .row .bar .url { font-size: 15px; }

    .row .arrow {
      font-size: 18px;
      flex-shrink: 0;
      width: 28px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="../../assets/logo/reddirect-logo.svg" alt="">
    <span class="wordmark">Reddirect</span>
  </div>

  <h1>Works with any subreddit.</h1>

  <div class="examples">
    <div class="row">
      <div class="bar">
        <svg class="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="url url-before">worldnews.reddit.com</span>
      </div>
      <div class="arrow">→</div>
      <div class="bar">
        <svg class="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="url url-after">reddit.com/r/worldnews</span>
      </div>
    </div>

    <div class="row">
      <div class="bar">
        <svg class="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="url url-before">soccer.reddit.com</span>
      </div>
      <div class="arrow">→</div>
      <div class="bar">
        <svg class="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="url url-after">reddit.com/r/soccer</span>
      </div>
    </div>

    <div class="row">
      <div class="bar">
        <svg class="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="url url-before">programming.reddit.com</span>
      </div>
      <div class="arrow">→</div>
      <div class="bar">
        <svg class="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="url url-after">reddit.com/r/programming</span>
      </div>
    </div>
  </div>

  <p class="footer">Every subreddit subdomain, every time.</p>
</body>
</html>
```

**Step 2: Preview in browser, then commit**

```bash
git add scripts/screenshots/screenshot-2.html
git commit -m "feat(screenshots): add screenshot-2 template (universal)"
```

---

### Task 5: Create screenshot-3.html — trust/simplicity (1280×800)

**Files:**
- Create: `scripts/screenshots/screenshot-3.html`

**Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1280">
  <link rel="stylesheet" href="shared.css">
  <style>
    body {
      width: 1280px;
      height: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    h1 {
      font-size: 52px;
      font-weight: 700;
      letter-spacing: -1.5px;
      line-height: 1.15;
      text-align: center;
      margin-bottom: 48px;
    }

    .bar-wrap {
      width: 560px;
      margin-bottom: 36px;
    }

    .badges {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="../../assets/logo/reddirect-logo.svg" alt="">
    <span class="wordmark">Reddirect</span>
  </div>

  <h1>No tracking. No data.<br>No nonsense.</h1>

  <div class="bar-wrap">
    <div class="bar">
      <svg class="lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span class="url url-after">reddit.com/r/nba</span>
    </div>
  </div>

  <div class="badges">
    <span class="badge">No analytics</span>
    <span class="badge">No remote code</span>
    <span class="badge">No unnecessary permissions</span>
  </div>

  <p class="footer">Open source. Nothing hidden.</p>
</body>
</html>
```

**Step 2: Preview in browser, then commit**

```bash
git add scripts/screenshots/screenshot-3.html
git commit -m "feat(screenshots): add screenshot-3 template (trust/simplicity)"
```

---

### Task 6: Create promo-small.html (440×280)

**Files:**
- Create: `scripts/screenshots/promo-small.html`

**Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="shared.css">
  <style>
    body {
      width: 440px;
      height: 280px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }

    img.icon {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }

    .name {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .tagline {
      font-size: 14px;
      color: #70757a;
      text-align: center;
    }

    .tagline .accent {
      color: #ff4500;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <img class="icon" src="../../assets/logo/reddirect-logo.svg" alt="">
  <div class="name">Reddirect</div>
  <div class="tagline">Subreddit subdomains <span class="accent">→</span> clean links.</div>
</body>
</html>
```

**Step 2: Preview in browser, then commit**

```bash
git add scripts/screenshots/promo-small.html
git commit -m "feat(screenshots): add promo-small template (440x280)"
```

---

### Task 7: Create promo-marquee.html (1400×560)

**Files:**
- Create: `scripts/screenshots/promo-marquee.html`

**Step 1: Write the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="shared.css">
  <style>
    body {
      width: 1400px;
      height: 560px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      padding: 72px 80px;
      gap: 80px;
    }

    .left {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand img {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }

    .brand .wordmark {
      font-size: 24px;
      font-weight: 600;
    }

    h1 {
      font-size: 52px;
      font-weight: 700;
      letter-spacing: -1.5px;
      line-height: 1.15;
    }

    .sub {
      font-size: 17px;
      color: #70757a;
      line-height: 1.5;
    }

    .right {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bar { width: 100%; }
    .bar .url { font-size: 16px; }
  </style>
</head>
<body>
  <div class="left">
    <div class="brand">
      <img src="../../assets/logo/reddirect-logo.svg" alt="">
      <span class="wordmark">Reddirect</span>
    </div>
    <h1>Clean Reddit<br>links,<br>automatically.</h1>
    <p class="sub">Subreddit subdomain links redirect<br>to canonical reddit.com/r/… paths.</p>
  </div>

  <div class="right">
    <div class="bar">
      <svg class="lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span class="url url-before">nba.reddit.com</span>
    </div>

    <div class="arrow">↓</div>

    <div class="bar">
      <svg class="lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span class="url url-after">reddit.com/r/nba</span>
    </div>
  </div>
</body>
</html>
```

**Step 2: Preview in browser, then commit**

```bash
git add scripts/screenshots/promo-marquee.html
git commit -m "feat(screenshots): add promo-marquee template (1400x560)"
```

---

### Task 8: Create generate-screenshots.mjs

**Files:**
- Create: `scripts/generate-screenshots.mjs`

**Step 1: Write the file**

```javascript
// scripts/generate-screenshots.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, 'assets', 'store');

mkdirSync(OUTPUT, { recursive: true });

const IMAGES = [
  { template: 'screenshot-1.html',  output: 'screenshot-1.png',  width: 1280, height: 800 },
  { template: 'screenshot-2.html',  output: 'screenshot-2.png',  width: 1280, height: 800 },
  { template: 'screenshot-3.html',  output: 'screenshot-3.png',  width: 1280, height: 800 },
  { template: 'promo-small.html',   output: 'promo-small.png',   width: 440,  height: 280 },
  { template: 'promo-marquee.html', output: 'promo-marquee.png', width: 1400, height: 560 },
];

const browser = await chromium.launch();

for (const { template, output, width, height } of IMAGES) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  const templatePath = join(ROOT, 'scripts', 'screenshots', template);
  await page.goto(`file://${templatePath}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: join(OUTPUT, output),
    type: 'png',
    clip: { x: 0, y: 0, width, height },
    omitBackground: false,
  });
  await page.close();
  console.log(`✓  ${output} (${width}×${height})`);
}

await browser.close();
console.log('\nAll images written to assets/store/');
```

**Step 2: Commit**

```bash
git add scripts/generate-screenshots.mjs
git commit -m "feat(screenshots): add Playwright generator script"
```

---

### Task 9: Run and verify

**Step 1: Run the generator**

```bash
npm run generate:screenshots
```

Expected output:
```
✓  screenshot-1.png (1280×800)
✓  screenshot-2.png (1280×800)
✓  screenshot-3.png (1280×800)
✓  promo-small.png (440×280)
✓  promo-marquee.png (1400×560)

All images written to assets/store/
```

**Step 2: Check file sizes**

```bash
ls -lh assets/store/
```

All 5 files should be present and > 10 KB (a blank white PNG at 1280×800 is ~2 KB, so real content means significantly larger).

**Step 3: Open for visual inspection**

```bash
open assets/store/
```

Check each image in Preview:
- White (opaque) background — no alpha checkerboard
- Logo and wordmark visible in the header
- Address bar mockups legible and correctly styled
- "Before" URL is gray, "after" URL is black
- Arrow is Reddit orange (#ff4500)

**Step 4: Iterate on any layout issues**

If any image needs tweaks, edit the corresponding HTML file and re-run `npm run generate:screenshots`. Playwright re-renders from scratch each time.

**Step 5: Commit the generated images**

```bash
git add assets/store/
git commit -m "chore: add initial store promotional images"
```

> **Note:** Generated PNGs are committed so they can be attached to store submissions without re-running the build. If you prefer to treat them as build artifacts, add `assets/store/*.png` to `.gitignore` instead.
