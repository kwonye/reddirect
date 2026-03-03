import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

const mappings = [
  [
    resolve(projectRoot, "shared", "redirect-core.js"),
    resolve(projectRoot, "chrome", "redirect-core.js")
  ],
  [
    resolve(projectRoot, "chrome", "content-redirect.js"),
    resolve(projectRoot, "safari", "ReddirectExtension", "Scripts", "content-redirect.js")
  ]
];

for (const [source, target] of mappings) {
  copyFileSync(source, target);
}
