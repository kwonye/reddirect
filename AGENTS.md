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
- **`npm test`**: Runs the unit tests for the core redirect logic and Safari DNR configuration using the native Node.js test runner.
- **`npm run release:chrome:check`**: Validates the Chrome extension for release readiness (checks version sync, i18n, etc.).
- **`npm run release:chrome:zip`**: Packages the Chrome extension into a production-ready ZIP file in `dist/`.
- **`npm run generate:screenshots`**: Uses Playwright to generate marketing screenshots and promo images from HTML templates in `scripts/screenshots/`.
- **`xcodebuild -project safari/Reddirect.xcodeproj -scheme Reddirect -configuration Debug -destination 'platform=macOS' build`**: Builds the macOS Safari extension.
- **`xcodebuild -project safari/Reddirect.xcodeproj -scheme "Reddirect iOS" -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 15' build`**: Builds the iOS Safari extension (requires Xcode setup).

## Development Conventions

### Modifying Redirect Logic
1.  **Edit `shared/redirect-core.js`**: All redirect rules and logic should reside here.
2.  **Run `npm run sync:targets`**: This propagates your changes to the `chrome/` and `safari/` folders.
3.  **Update Tests**: Add or update test cases in `tests/redirect-core.test.mjs` to reflect your changes.
4.  **Verify**: Run `npm test` and perform manual smoke tests in the browsers.

### Platform-Specific Development
- **Chrome**: Load the `chrome/` directory as an "unpacked extension" in `chrome://extensions`.
- **Safari (macOS)**: Open `safari/Reddirect.xcodeproj` in Xcode. The shared scripts are copied into the extension bundle via the `sync:targets` script and Xcode's build process.
- **Safari (iOS)**: After adding iOS targets in Xcode (see `ios.md`), select the "Reddirect iOS" scheme and run on a simulator or device. Enable the extension in Settings > Safari > Extensions.

### Safari Extension Architecture
- Safari uses **Declarative Net Request (DNR)** for redirects (Safari 15.4+).
- DNR rules are defined in `safari/Reddirect Extension/Resources/rules/subdomain-redirects.json`.
- The Safari manifest (`safari/Reddirect Extension/Resources/manifest.json`) uses `declarativeNetRequestWithHostAccess` permission.
- No background or content scripts are needed for redirect logic (removed in favor of DNR).
- macOS and iOS share the same extension resources (manifest, rules, images).

### iOS Development
- iOS targets must be added to the Xcode project manually (see `ios.md` for detailed instructions).
- Bundle IDs:
  - iOS App: `co.dgits.Reddirect.iOS`
  - iOS Extension: `co.dgits.Reddirect.iOS.Extension`
- Deployment target: iOS 15.4+ (required for DNR redirect support).
- The iOS app includes a simple UI with instructions for enabling the extension.

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
  - `Reddirect/`: macOS app source.
  - `Reddirect Extension/`: Safari Web Extension with shared resources.
    - `Resources/`: Manifest, DNR rules, images, and locales.
      - `rules/`: Declarative Net Request rules files.
  - `Reddirect iOS/`: iOS app source (SwiftUI).
  - `Reddirect iOS Extension/`: iOS Safari Web Extension (symlinks to shared resources).
- `scripts/`: Build, sync, and automation scripts.
- `shared/`: Source of truth for shared JavaScript logic.
- `tests/`: Unit and integration tests for redirect logic and Safari DNR configuration.
