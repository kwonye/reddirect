# Safari Extension Guide

## Overview
This directory contains the Safari Web Extension project for Reddirect. It is structured as a macOS App containing the extension.

## Directory Structure
- `Reddirect.xcodeproj`: The Xcode project file for building and archiving the app and extension.
- `ReddirectApp/`: The container macOS application source.
- `ReddirectExtension/`: The Safari Web Extension source.
    - `Resources/manifest.json`: The Web Extension manifest for Safari.
    - `Scripts/`: Contains the JavaScript logic.
        - `redirect-core.js`: The redirect URL computation logic.
        - `content-redirect.js`: The content script that triggers redirects on page load.

## Development
1.  **Open in Xcode**: Open `Reddirect.xcodeproj`.
2.  **Run**: Build and run the `Reddirect` scheme.
3.  **Enable Extension**: Open Safari > Settings > Extensions and check "Reddirect" to enable it for testing.
4.  **Debugging**: Use the Safari Web Inspector on the extension's content scripts to debug logic.

## Architecture
Safari Web Extensions use content scripts for redirects. The `redirect-core.js` contains the core redirect logic, and `content-redirect.js` is the content script that runs on Reddit pages to perform the actual redirect via `window.location.replace()`.
