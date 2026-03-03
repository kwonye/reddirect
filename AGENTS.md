# Reddirect Project Guide

## Project Overview
Reddirect is a cross-browser extension (Chrome and Safari) designed to redirect Reddit subdomains (e.g., `nba.reddit.com`) to their canonical subreddit routes (e.g., `https://reddit.com/r/nba`). It ensures a consistent user experience by preserving paths, query strings, and hash fragments while normalizing URLs to HTTPS.

### Core Architecture
- **Shared Logic:** `shared/redirect-core.js` contains the canonical redirect logic. It's written in a way that can be used in both browser environments and Node.js for testing.
- **Chrome Extension:** Located in `chrome/`, it uses Manifest V3. It employs both `declarativeNetRequest` for rule-based redirects and `content_scripts` for more complex or fallback redirection.
- **Safari Extension:** Located in `safari/`, it's a native Safari App Extension built with Swift and Xcode.
- **Tooling:** A set of Node.js scripts in `scripts/` handles icon generation, synchronization of shared logic, release validation, and automated screenshot generation.

## Building and Running

### Prerequisites
- Node.js (latest LTS recommended)
- Xcode (for Safari extension development)

### Key Commands
- **`npm run sync:targets`**: Synchronizes the shared redirect logic and content scripts into the platform-specific `chrome/` and `safari/` directories. **Run this after any change to `shared/` files.**
- **`npm run generate:icons`**: Generates a full set of PNG icons from the source SVG (`assets/logo/reddirect-logo.svg`).
- **`npm test`**: Runs the unit tests for the core redirect logic using the native Node.js test runner.
- **`npm run release:chrome:check`**: Validates the Chrome extension for release readiness (checks version sync, i18n, etc.).
- **`npm run release:chrome:zip`**: Packages the Chrome extension into a production-ready ZIP file in `dist/`.
- **`npm run generate:screenshots`**: Uses Playwright to generate marketing screenshots and promo images from HTML templates in `scripts/screenshots/`.

## Development Conventions

### Modifying Redirect Logic
1.  **Edit `shared/redirect-core.js`**: All redirect rules and logic should reside here.
2.  **Run `npm run sync:targets`**: This propagates your changes to the `chrome/` and `safari/` folders.
3.  **Update Tests**: Add or update test cases in `tests/redirect-core.test.mjs` to reflect your changes.
4.  **Verify**: Run `npm test` and perform manual smoke tests in the browsers.

### Platform-Specific Development
- **Chrome**: Load the `chrome/` directory as an "unpacked extension" in `chrome://extensions`.
- **Safari**: Open `safari/Reddirect.xcodeproj` in Xcode. The shared scripts are copied into the extension bundle via the `sync:targets` script and Xcode's build process.

### Versioning
Versions must be manually kept in sync across:
- `package.json`
- `chrome/manifest.json`
- Safari project settings (Xcode)

### Testing
- Prioritize unit tests for any logic changes.
- Parity tests are included to ensure `shared/`, `chrome/`, and `safari/` versions of the core logic are identical.

## Directory Structure
- `assets/`: Logos and generated store assets.
- `chrome/`: Chrome extension source code.
- `docs/`: Documentation and project plans.
- `safari/`: Safari App Extension Xcode project.
- `scripts/`: Build, sync, and automation scripts.
- `shared/`: Source of truth for shared JavaScript logic.
- `tests/`: Unit and integration tests.
