# Reddirect

Reddirect is a cross-browser extension setup that redirects Reddit subdomains like `nba.reddit.com` to canonical subreddit routes like `https://reddit.com/r/nba`.

## Behavior Contract

- Redirect only `http` and `https` URLs.
- Redirect only single-label hosts: `<subreddit>.reddit.com`.
- Do not redirect multi-label hosts (`foo.bar.reddit.com`).
- Exclude reserved hosts:
  - `www`, `old`, `new`, `i`, `m`, `np`, `mod`, `api`, `oauth`, `out`, `amp`, `gateway`, `pay`, `accounts`
- Always redirect to `https://reddit.com`.
- Preserve the original path, query string, and hash fragment.

## Project Layout

- `shared/redirect-core.js`: canonical redirect logic.
- `chrome/`: Chrome MV3 extension.
- `chrome/_locales/`: Chrome i18n message catalogs (`en`, `es`).
- `safari/`: native Safari App Extension project (`Reddirect.xcodeproj`).
- `tests/redirect-core.test.mjs`: unit + parity tests.
- `scripts/sync-targets.mjs`: sync shared logic and assets into browser targets.
- `scripts/release-chrome-check.mjs`: validates Chrome release readiness.
- `scripts/release-chrome-zip.mjs`: creates clean Chrome submission zip in `dist/`.
- `assets/logo/reddirect-logo.svg`: canonical color vector logo source.
- `scripts/generate-icons-from-svg.sh`: generates PNG icon sets from SVG sources.

Note: Safari source scripts live under `safari/ReddirectExtension/Scripts/`, and Xcode copies them into the extension bundle root as `redirect-core.js` and `content-redirect.js`.

## Local Development

### 1. Sync target copies

```bash
npm run sync:targets
```

### 2. Regenerate icon assets from vectors

```bash
npm run generate:icons
```

### 3. Run unit tests

```bash
npm test
```

### 4. Validate Chrome release readiness

```bash
npm run release:chrome:check
```

### 5. Build Chrome submission zip

```bash
npm run release:chrome:zip
```

This creates `dist/reddirect-chrome-v<version>.zip`.

### 6. Chrome (unpacked)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select `chrome/`.
4. Open `https://nba.reddit.com/top?t=week#now` and verify redirect to `https://reddit.com/r/nba/top?t=week#now`.

### 7. Safari (native app extension)

1. Open `safari/Reddirect.xcodeproj` in Xcode.
2. Select the `Reddirect` scheme and a macOS target.
3. Run the app from Xcode.
4. In Safari, enable the extension in **Settings > Extensions**.
5. Visit a matching subreddit subdomain and confirm redirect behavior.

## Store-Ready Baseline Checklist

### Chrome Web Store

1. Confirm account prerequisites (developer registration, 2-step verification, verified contact email).
2. Ensure `npm run sync:targets && npm test` passes.
3. Run `npm run release:chrome:check`.
4. Run `npm run release:chrome:zip`.
5. Upload `dist/reddirect-chrome-v<version>.zip` in Chrome Web Store Developer Dashboard.
6. Use the launch checklist in `docs/chrome-web-store-launch.md` for language, listing, and privacy disclosures.

### Safari / App Store Connect

1. In Xcode, update:
   - App target bundle identifier (default placeholder: `com.example.reddirect`)
   - Extension target bundle identifier (default placeholder: `com.example.reddirect.extension`)
   - Team, signing, version, and build numbers
2. Archive from Xcode (`Product > Archive`).
3. Validate and upload using Organizer to App Store Connect.
4. Complete listing metadata and submit for review.

## Release Workflow

1. Modify shared redirect logic in `shared/redirect-core.js`.
2. Run `npm run sync:targets`.
3. Bump version in both `package.json` and `chrome/manifest.json`.
4. Run `npm test`.
5. Run `npm run release:chrome:check`.
6. Run `npm run release:chrome:zip`.
7. Perform manual smoke checks in Chrome and Safari.
8. Submit per store checklist and add a short changelog note for the release.
