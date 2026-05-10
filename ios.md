# Add iOS Safari Redirect Support

## Summary
- Add iOS Safari support using Apple’s documented Safari Web Extension path, packaged inside an iOS containing app.
- Replace Safari’s current JS navigation redirect implementation with Declarative Net Request (DNR), since Apple documents DNR `redirect` support in Safari 15.4+ and requires `declarativeNetRequestWithHostAccess` for redirects.
- Use one shared Safari Web Extension resource set for macOS and iOS, with separate platform app/extension targets only where Xcode requires them.

## Key Changes
- Update the Safari extension manifest to use DNR:
  - `permissions`: `["declarativeNetRequestWithHostAccess"]`
  - `host_permissions`: `["*://*.reddit.com/*", "*://reddit.com/*"]`
  - `declarative_net_request.rule_resources`: point to a shared static rules file.
  - Keep no toolbar `action`, so Safari does not show site-access prompts when tapping/clicking an icon.
- Add a Safari DNR rules file based on the Chrome rules:
  - Allow reserved Reddit hosts such as `www`, `old`, `new`, `api`, etc.
  - Redirect `http(s)://<subreddit>.reddit.com/<path>?<query>` to `https://reddit.com/r/<subreddit>/<path>?<query>`.
  - Treat URL hash fragments as best effort: include them if Safari DNR exposes them, but do not add a JS fallback solely for fragments.
- Remove Safari runtime redirect dependency:
  - Stop relying on `webNavigation.onBeforeNavigate` and `tabs.update`.
  - Keep `background.js` only if Safari requires a background file for packaging; otherwise remove it from the Safari manifest.
- Add iOS packaging:
  - Add an iOS containing app target, e.g. `Reddirect iOS`, with bundle id `co.dgits.Reddirect.iOS`.
  - Add an iOS Safari Web Extension target, e.g. `Reddirect iOS Extension`, with bundle id `co.dgits.Reddirect.iOS.Extension`.
  - Share `safari/Reddirect Extension/Resources` between macOS and iOS extension targets.
  - Set iOS deployment target to `15.4` or newer because Safari DNR redirect support starts there.
  - Add a minimal iOS SwiftUI containing app screen explaining how to enable Reddirect in Settings > Safari > Extensions.

## Tests And Verification
- Add/extend Node tests to validate the Safari DNR manifest:
  - Uses `manifest_version: 3`.
  - Has `declarativeNetRequestWithHostAccess`.
  - Has both Reddit origin and destination host permissions.
  - Has no `action`.
  - References an existing DNR rules file.
- Add/extend DNR rules tests:
  - Redirects `https://nba.reddit.com` to `https://reddit.com/r/nba/`.
  - Preserves path and query.
  - Does not redirect reserved hosts.
  - Does not redirect multi-label hosts like `foo.bar.reddit.com`.
- Build checks:
  - `npm test`
  - `xcodebuild -project safari/Reddirect.xcodeproj -scheme Reddirect -configuration Debug -destination 'platform=macOS' build`
  - `xcodebuild` for the new iOS app scheme against an available iOS Simulator.
- Manual iOS smoke test:
  - Install the iOS app on Simulator or device.
  - Enable the extension in Settings > Safari > Extensions.
  - Visit `https://nba.reddit.com/top?t=week`.
  - Confirm redirect to `https://reddit.com/r/nba/top?t=week`.
  - Confirm non-Reddit sites do not prompt for access and reserved Reddit hosts are not redirected.

## Assumptions
- iOS support is implemented as shared web-extension resources plus platform-specific Xcode app/extension targets, not as a wholly separate codebase.
- Safari uses DNR everywhere after this change, including macOS Safari.
- Hash fragment preservation is best effort under DNR; no content-script fallback is added unless a future requirement demands exact fragment parity.
- Chrome behavior remains unchanged unless tests reveal a safe opportunity to share the same generated DNR rules file across Chrome and Safari.
