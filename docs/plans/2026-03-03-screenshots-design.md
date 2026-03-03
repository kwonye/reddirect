# Store Screenshot Generation — Design

**Date:** 2026-03-03

## Overview

A script-driven pipeline that generates all Chrome Web Store (and eventually Safari App Store) promotional images from HTML/CSS templates rendered by a headless browser. No manual screenshotting required.

## Toolchain

- **Renderer:** Playwright (Node.js, dev dependency) — headless Chromium renders HTML templates to PNG
- **Templates:** One HTML file per image, a shared `shared.css` for design tokens
- **Runner:** `scripts/generate-screenshots.mjs` — matches existing `scripts/` conventions
- **npm script:** `npm run generate:screenshots`
- **Output:** `assets/store/` — all output PNGs land here

## Output Images

| File | Dimensions | Format |
|------|-----------|--------|
| `screenshot-1.png` | 1280×800 | 24-bit PNG, no alpha |
| `screenshot-2.png` | 1280×800 | 24-bit PNG, no alpha |
| `screenshot-3.png` | 1280×800 | 24-bit PNG, no alpha |
| `promo-small.png` | 440×280 | 24-bit PNG, no alpha |
| `promo-marquee.png` | 1400×560 | 24-bit PNG, no alpha |

## File Structure

```
scripts/
  screenshots/
    screenshot-1.html     # core concept
    screenshot-2.html     # universal / any subreddit
    screenshot-3.html     # no tracking / simplicity
    promo-small.html      # 440×280
    promo-marquee.html    # 1400×560
    shared.css            # design tokens
  generate-screenshots.mjs
assets/
  store/                  # output PNGs
```

## Visual Design

### Shared layout (screenshots)

- Background: `#ffffff`
- Extension icon (128px from SVG) + "Reddirect" wordmark in upper-left
- Large centered headline
- Browser address bar mockup as hero — rounded pill, light gray fill, lock icon, URL text
- Muted footer tagline

### Screenshot 1 — Core concept (1280×800)

**Headline:** "Clean Reddit links, automatically."

Two address bars stacked with a Reddit-orange `→` between them:
- Top bar: `nba.reddit.com` in muted gray (the unresolved state)
- Bottom bar: `reddit.com/r/nba` in full black (the clean result)

### Screenshot 2 — Universal (1280×800)

**Headline:** "Works with any subreddit."

Three address bar pairs at smaller scale:
- `worldnews.reddit.com` → `reddit.com/r/worldnews`
- `soccer.reddit.com` → `reddit.com/r/soccer`
- `programming.reddit.com` → `reddit.com/r/programming`

### Screenshot 3 — Trust / simplicity (1280×800)

**Headline:** "No tracking. No data. No nonsense."

Single clean address bar, plus three pill badges below:
- `No analytics` · `No remote code` · `No permissions you don't need`

### Small promo tile (440×280)

Logo icon centered, "Reddirect" wordmark, one-line tagline:
*"Subreddit subdomains → clean links."*

### Marquee promo tile (1400×560)

Logo + wordmark on the left third, the core before→after address bar pair on the right two-thirds, headline across the top.

## Color Palette

| Token | Value | Use |
|-------|-------|-----|
| Background | `#ffffff` | All image backgrounds |
| Headline | `#0f0f0f` | Primary text |
| Address bar fill | `#f1f3f4` | Bar background |
| Address bar border | `#e0e0e0` | Bar stroke |
| "Before" URL | `#9aa0a6` | Muted/unresolved state |
| "After" URL | `#0f0f0f` | Clean/resolved state |
| Accent / arrow | `#ff4500` | Reddit orange, directional arrow |
| Muted text | `#70757a` | Footer tagline, labels |
| Badge fill | `#f1f3f4` | Pill badge background |

## Typography

- **Font:** Inter (Google Fonts)
- Logo SVG inlined directly — no raster scaling artifacts

## Rendering

Playwright renders each template at `deviceScaleFactor: 2` then clips to exact logical pixel dimensions. Output is 24-bit PNG with no alpha channel (opaque white background).
