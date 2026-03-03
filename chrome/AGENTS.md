# Chrome Extension Guide

## Overview
This directory contains the Chrome Manifest V3 extension for Reddirect. It uses `declarativeNetRequest` with static rules for high-performance redirects and content scripts for additional dynamic redirection.

## Key Files
- `manifest.json`: The extension's entry point, defining permissions, content scripts, and rules.
- `redirect-core.js`: The shared redirect logic that computes redirect URLs.
- `content-redirect.js`: The script that executes the redirection logic when a page is loaded.
- `rules/subdomain-redirects.json`: Static declarative rules for high-efficiency redirects on the browser level.
- `_locales/`: Contains internationalization strings for various languages.
- `icons/`: Extension icons (generated via `npm run generate:icons`).

## Development
1.  **Load Unpacked**: In Chrome, go to `chrome://extensions`, enable "Developer mode", and "Load unpacked" from this folder.
2.  **Local Testing**: Changes to `manifest.json`, `rules/`, or content scripts require a manual reload of the extension in the Chrome extensions manager.
