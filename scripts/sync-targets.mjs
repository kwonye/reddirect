import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

const mappings = [
  [
    resolve(projectRoot, "shared", "redirect-core.js"),
    resolve(projectRoot, "chrome", "redirect-core.js")
  ],
  [
    resolve(projectRoot, "shared", "redirect-core.js"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Scripts", "redirect-core.js")
  ],
  [
    resolve(projectRoot, "chrome", "content-redirect.js"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Scripts", "content-redirect.js")
  ],
  [
    resolve(projectRoot, "chrome", "manifest.json"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Resources", "manifest.json")
  ],
  [
    resolve(projectRoot, "chrome", "icons", "icon16.png"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Resources", "icons", "icon16.png")
  ],
  [
    resolve(projectRoot, "chrome", "icons", "icon32.png"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Resources", "icons", "icon32.png")
  ],
  [
    resolve(projectRoot, "chrome", "icons", "icon48.png"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Resources", "icons", "icon48.png")
  ],
  [
    resolve(projectRoot, "chrome", "icons", "icon128.png"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Resources", "icons", "icon128.png")
  ],
  [
    resolve(projectRoot, "chrome", "icons", "icon1024.png"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Resources", "icons", "icon1024.png")
  ]
];

for (const [source, target] of mappings) {
  copyFileSync(source, target);
}
