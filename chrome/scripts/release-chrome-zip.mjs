import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const chromeRoot = resolve(projectRoot, "chrome");
const distRoot = resolve(projectRoot, "dist");
const checkScript = resolve(projectRoot, "scripts", "release-chrome-check.mjs");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "pipe",
    encoding: "utf8",
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    const details = output ? `\n${output}` : "";
    throw new Error(`${command} ${args.join(" ")} exited with code ${result.status}${details}`);
  }

  return result.stdout;
}

function collectPackagedFiles(rootPath, relativePath = "") {
  const currentPath = relativePath ? resolve(rootPath, relativePath) : rootPath;
  const entries = readdirSync(currentPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  const files = [];

  for (const entry of entries) {
    const childRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.name === "_metadata" || entry.name === ".DS_Store" || entry.name.startsWith(".")) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...collectPackagedFiles(rootPath, childRelative));
      continue;
    }

    if (entry.isFile()) {
      files.push(childRelative);
    }
  }

  return files;
}

function assertZipContents(zipPath, requiredFiles) {
  const listed = run("unzip", ["-Z", "-1", zipPath]);
  const zipEntries = listed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const path of zipEntries) {
    if (path.startsWith("_metadata/") || path === "_metadata") {
      throw new Error("zip contains forbidden _metadata directory");
    }
    if (path === ".DS_Store" || path.endsWith("/.DS_Store")) {
      throw new Error("zip contains forbidden .DS_Store file");
    }
  }

  for (const required of requiredFiles) {
    if (!zipEntries.includes(required)) {
      throw new Error(`zip is missing required file: ${required}`);
    }
  }

  return zipEntries.length;
}

run(process.execPath, [checkScript], { stdio: "inherit" });

const manifest = JSON.parse(readFileSync(resolve(chromeRoot, "manifest.json"), "utf8"));
const version = manifest.version;
const defaultLocale = manifest.default_locale;

if (!version) {
  throw new Error("manifest version is required to package release zip");
}

mkdirSync(distRoot, { recursive: true });

const outputZip = resolve(distRoot, `reddirect-chrome-v${version}.zip`);
if (existsSync(outputZip)) {
  rmSync(outputZip, { force: true });
}

const filesToPackage = collectPackagedFiles(chromeRoot);
if (filesToPackage.length === 0) {
  throw new Error("no files collected from chrome/ for packaging");
}

run("zip", ["-q", "-X", outputZip, ...filesToPackage], { cwd: chromeRoot });

const requiredFiles = [
  "manifest.json",
  "content-redirect.js",
  "redirect-core.js",
  "rules/subdomain-redirects.json",
  "icons/icon16.png",
  "icons/icon32.png",
  "icons/icon48.png",
  "icons/icon128.png"
];

if (typeof defaultLocale === "string" && defaultLocale.length > 0) {
  requiredFiles.push(`_locales/${defaultLocale}/messages.json`);
}

const fileCount = assertZipContents(outputZip, requiredFiles);
console.log(`Packaged ${fileCount} files: ${outputZip}`);
