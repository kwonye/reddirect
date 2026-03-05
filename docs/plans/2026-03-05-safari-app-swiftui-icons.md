# Safari App: SwiftUI + Icon Updates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the Safari host app from AppKit+WKWebView to SwiftUI, fix the app icon, update the toolbar icon, and remove the extension popup.

**Architecture:** The Safari host app (`safari/Reddirect/`) is rebuilt as a minimal SwiftUI app. It uses `SFSafariExtensionManager` to check extension state and `SFSafariApplication.showPreferencesForExtension` to open Safari settings. The extension target (`safari/Reddirect Extension/`) is largely untouched except for manifest changes.

**Tech Stack:** SwiftUI, SafariServices, macOS 26.2+, Xcode 26. The `Reddirect` target uses `PBXFileSystemSynchronizedRootGroup`, so adding/deleting files in `safari/Reddirect/` on disk is automatically picked up by Xcode — no `.pbxproj` group edits needed for source files.

---

### Task 1: Fix App Icon Build Setting

The `App Icon.icon` (Icon Composer) file is already in the project's Resources phase, but `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon` makes Xcode look for the icon in the empty `AppIcon.appiconset` instead. Remove that setting so Xcode uses the `.icon` file.

**Files:**
- Modify: `safari/Reddirect.xcodeproj/project.pbxproj`

**Step 1: Remove ASSETCATALOG_COMPILER_APPICON_NAME from Debug config (BEAA09B72F59E4E300F08DFB)**

Find this block (around line 575):
```
BEAA09B72F59E4E300F08DFB /* Debug */ = {
    isa = XCBuildConfiguration;
    buildSettings = {
        ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
        ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
```

Remove only the `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;` line.

**Step 2: Remove ASSETCATALOG_COMPILER_APPICON_NAME from Release config (BEAA09B82F59E4E300F08DFB)**

Find the same line in the Release block (around line 616) and remove it.

**Step 3: Verify `App Icon.icon` is in the Resources build phase**

In `project.pbxproj`, confirm this line exists in `BEAA09642F59E4E100F08DFB /* Resources */`:
```
BE7932F42F5A21DE00018A22 /* App Icon.icon in Resources */,
```
It does — no change needed.

**Step 4: Build in Xcode to verify dock icon appears**

Open Xcode, build and run the Reddirect scheme. Check that the dock icon shows the logo from `App Icon.icon` (orange circle with R+arrow), not the placeholder grid.

**Step 5: Commit**

```bash
cd /Users/will/Developer/kwonye/reddirect
git add safari/Reddirect.xcodeproj/project.pbxproj
git commit -m "fix: use Icon Composer file for Safari app icon"
```

---

### Task 2: Replace Toolbar Icon SVG

Replace the generic lightning-bolt `toolbar-icon.svg` with a simplified monochrome "R with arrow" matching the Reddirect brand. Safari renders this as a template image (tinting it to match the system UI color).

**Files:**
- Modify: `safari/Reddirect Extension/Resources/images/toolbar-icon.svg`

**Step 1: Write the new toolbar icon**

Replace the entire contents of `toolbar-icon.svg` with:

```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.9375 15.9453">
  <!-- Circle ring (same as original) -->
  <path d="M7.96875 15.9375C12.3281 15.9375 15.9375 12.3203 15.9375 7.96875C15.9375 3.60938 12.3203 0 7.96094 0C3.60938 0 0 3.60938 0 7.96875C0 12.3203 3.61719 15.9375 7.96875 15.9375ZM7.96875 14.6094C4.28125 14.6094 1.33594 11.6562 1.33594 7.96875C1.33594 4.28125 4.27344 1.32812 7.96094 1.32812C11.6484 1.32812 14.6094 4.28125 14.6094 7.96875C14.6094 11.6562 11.6562 14.6094 7.96875 14.6094Z"/>
  <!-- R: vertical stem -->
  <path d="M3.8 4H5.2V12H3.8Z"/>
  <!-- R: top arch bowl (outer minus inner counter via evenodd) -->
  <path fill-rule="evenodd" d="M5.2 4H8.4C10.6 4 11.4 5.1 11.4 6.25C11.4 7.4 10.6 8.5 8.4 8.5H5.2V4ZM5.2 5.3V7.2H8.1C9.4 7.2 9.9 6.8 9.9 6.25C9.9 5.7 9.4 5.3 8.1 5.3H5.2Z"/>
  <!-- R: diagonal leg -->
  <path d="M7.5 8.5L11.2 12H9.6L6.2 8.5H7.5Z"/>
</svg>
```

**Step 2: Visually verify**

Open the SVG in a browser or Preview.app. Confirm it shows a circle ring with a recognizable "R" shape (stem on left, curved top-right bump, diagonal leg going lower-right). The icon does not need to be perfect at this stage — it can be refined.

**Step 3: Commit**

```bash
git add "safari/Reddirect Extension/Resources/images/toolbar-icon.svg"
git commit -m "feat: update Safari toolbar icon to R-arrow brand mark"
```

---

### Task 3: Remove Extension Popup

Remove the popup from the extension so clicking the toolbar icon does nothing (no popup opens). Keep the toolbar icon itself.

**Files:**
- Modify: `safari/Reddirect Extension/Resources/manifest.json`
- Delete: `safari/Reddirect Extension/Resources/popup.html`
- Delete: `safari/Reddirect Extension/Resources/popup.css`
- Delete: `safari/Reddirect Extension/Resources/popup.js`

**Step 1: Remove `default_popup` from manifest.json**

In `manifest.json`, change the `action` block from:
```json
"action": {
    "default_popup": "popup.html",
    "default_icon": "images/toolbar-icon.svg"
},
```
To:
```json
"action": {
    "default_icon": "images/toolbar-icon.svg"
},
```

**Step 2: Delete the popup files**

```bash
rm "safari/Reddirect Extension/Resources/popup.html"
rm "safari/Reddirect Extension/Resources/popup.css"
rm "safari/Reddirect Extension/Resources/popup.js"
```

**Step 3: Commit**

```bash
git add "safari/Reddirect Extension/Resources/manifest.json"
git rm "safari/Reddirect Extension/Resources/popup.html"
git rm "safari/Reddirect Extension/Resources/popup.css"
git rm "safari/Reddirect Extension/Resources/popup.js"
git commit -m "feat: remove extension popup, keep toolbar icon"
```

---

### Task 4: Add Logo to Asset Catalog

Add `assets/logo.svg` as a vector image set in the main app's asset catalog so SwiftUI can reference it as `Image("Logo")`.

**Files:**
- Create: `safari/Reddirect/Assets.xcassets/Logo.imageset/Contents.json`
- Create: `safari/Reddirect/Assets.xcassets/Logo.imageset/logo.svg` (copy of `assets/logo.svg`)

**Step 1: Create the imageset directory**

```bash
mkdir -p "safari/Reddirect/Assets.xcassets/Logo.imageset"
```

**Step 2: Copy the logo SVG**

```bash
cp assets/logo.svg "safari/Reddirect/Assets.xcassets/Logo.imageset/logo.svg"
```

**Step 3: Create Contents.json**

Create `safari/Reddirect/Assets.xcassets/Logo.imageset/Contents.json`:

```json
{
  "images" : [
    {
      "filename" : "logo.svg",
      "idiom" : "universal"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  },
  "properties" : {
    "preserves-vector-representation" : true
  }
}
```

**Step 4: Commit**

```bash
git add "safari/Reddirect/Assets.xcassets/Logo.imageset/"
git commit -m "feat: add Reddirect logo to asset catalog for in-app display"
```

---

### Task 5: Create SwiftUI ContentView

Create the main view that replaces the old `ViewController.swift` + WKWebView + HTML approach.

**Files:**
- Create: `safari/Reddirect/ContentView.swift`

**Step 1: Create ContentView.swift**

Create `safari/Reddirect/ContentView.swift`:

```swift
import SwiftUI
import SafariServices

let extensionBundleIdentifier = "co.dgits.Reddirect.Extension"

struct ContentView: View {
    @State private var extensionEnabled: Bool? = nil

    var body: some View {
        VStack(spacing: 20) {
            Image("Logo")
                .resizable()
                .scaledToFit()
                .frame(width: 128, height: 128)

            Group {
                if let enabled = extensionEnabled {
                    if enabled {
                        Text("Reddirect's extension is currently on. You can turn it off in Safari Extensions preferences.")
                    } else {
                        Text("Reddirect's extension is currently off. You can turn it on in Safari Extensions preferences.")
                    }
                } else {
                    Text("You can turn on Reddirect's extension in Safari Extensions preferences.")
                }
            }
            .multilineTextAlignment(.center)

            Button("Quit and Open Safari Extensions Preferences…") {
                SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { _ in
                    DispatchQueue.main.async {
                        NSApplication.shared.terminate(nil)
                    }
                }
            }
        }
        .padding(40)
        .frame(width: 420)
        .onAppear {
            SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { state, error in
                DispatchQueue.main.async {
                    if let state = state, error == nil {
                        extensionEnabled = state.isEnabled
                    }
                }
            }
        }
    }
}
```

**Step 2: Commit**

```bash
git add safari/Reddirect/ContentView.swift
git commit -m "feat: add SwiftUI ContentView for Safari host app"
```

---

### Task 6: Replace AppKit App Entry Point with SwiftUI

Replace `AppDelegate.swift` (which has `@main`) and `ViewController.swift` with a SwiftUI App struct. Delete all the old WKWebView resource files.

**Files:**
- Delete: `safari/Reddirect/AppDelegate.swift`
- Delete: `safari/Reddirect/ViewController.swift`
- Delete: `safari/Reddirect/Base.lproj/Main.storyboard`
- Delete: `safari/Reddirect/Resources/` (entire folder)
- Create: `safari/Reddirect/ReddirectApp.swift`

**Step 1: Create ReddirectApp.swift**

Create `safari/Reddirect/ReddirectApp.swift`:

```swift
import SwiftUI

@main
struct ReddirectApp: App {
    @NSApplicationDelegateAdaptor(AppLifecycleDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .windowResizability(.contentSize)
    }
}

class AppLifecycleDelegate: NSObject, NSApplicationDelegate {
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}
```

**Step 2: Delete old AppKit files**

```bash
rm safari/Reddirect/AppDelegate.swift
rm safari/Reddirect/ViewController.swift
rm "safari/Reddirect/Base.lproj/Main.storyboard"
rm -r safari/Reddirect/Resources/
rmdir "safari/Reddirect/Base.lproj"
```

**Step 3: Commit**

```bash
git add safari/Reddirect/ReddirectApp.swift
git rm safari/Reddirect/AppDelegate.swift
git rm safari/Reddirect/ViewController.swift
git rm "safari/Reddirect/Base.lproj/Main.storyboard"
git rm -r safari/Reddirect/Resources/
git commit -m "feat: replace AppKit+WKWebView with SwiftUI app"
```

---

### Task 7: Update Build Settings for SwiftUI

Remove the storyboard and WebKit references from the build settings. Without these changes, the build will fail because Xcode will look for `Main.storyboard` and the WebKit framework linker flag will be stale.

**Files:**
- Modify: `safari/Reddirect.xcodeproj/project.pbxproj`

The target build configs for `Reddirect` are `BEAA09B72F59E4E300F08DFB` (Debug) and `BEAA09B82F59E4E300F08DFB` (Release). Both need identical changes.

**Step 1: Remove storyboard and WebKit references from Debug config**

In `BEAA09B72F59E4E300F08DFB /* Debug */`, remove these lines:
```
INFOPLIST_KEY_NSMainStoryboardFile = Main;
INFOPLIST_KEY_NSPrincipalClass = NSApplication;
```

And change `OTHER_LDFLAGS` from:
```
OTHER_LDFLAGS = (
    "-framework",
    SafariServices,
    "-framework",
    WebKit,
);
```
To:
```
OTHER_LDFLAGS = (
    "-framework",
    SafariServices,
);
```

**Step 2: Make the same changes to Release config**

Apply identical removals in `BEAA09B82F59E4E300F08DFB /* Release */`.

**Step 3: Build and verify**

In Xcode, build the `Reddirect` scheme. The build should succeed with no errors. Run the app — it should show the SwiftUI window with the Reddirect logo, status text, and the preferences button.

**Step 4: Commit**

```bash
git add safari/Reddirect.xcodeproj/project.pbxproj
git commit -m "chore: remove storyboard and WebKit build settings for SwiftUI migration"
```

---

### Task 8: Final Verification

**Step 1: Build and run in Xcode**

Select the `Reddirect` scheme and run. Verify:
- [ ] Dock icon shows the Reddirect logo (not the placeholder grid)
- [ ] App window shows the logo image from Assets, the status text, and the preferences button
- [ ] Clicking the button opens Safari Extensions preferences and quits the app

**Step 2: Check Safari toolbar icon**

Enable the extension in Safari. Verify the toolbar icon shows the R-arrow shape (not lightning bolt).

**Step 3: Check Safari Extensions settings**

Open Safari > Settings > Extensions > Reddirect. Verify:
- [ ] The extension icon in the settings list shows the Reddirect logo
- [ ] No popup opens when clicking the toolbar icon

**Step 4: Commit any final tweaks**

If the toolbar SVG needs visual adjustments, edit `toolbar-icon.svg` and commit.
