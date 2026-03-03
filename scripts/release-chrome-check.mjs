import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const chromeRoot = resolve(projectRoot, "chrome");
const manifestPath = resolve(chromeRoot, "manifest.json");
const packagePath = resolve(projectRoot, "package.json");
const rulesPath = resolve(chromeRoot, "rules", "subdomain-redirects.json");

const failures = [];
const SUPPORTED_LOCALES = Object.freeze([
  "ar",
  "am",
  "bg",
  "bn",
  "ca",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "en_AU",
  "en_GB",
  "en_US",
  "es",
  "es_419",
  "et",
  "fa",
  "fi",
  "fil",
  "fr",
  "gu",
  "he",
  "hi",
  "hr",
  "hu",
  "id",
  "it",
  "ja",
  "kn",
  "ko",
  "lt",
  "lv",
  "ml",
  "mr",
  "ms",
  "nl",
  "no",
  "pl",
  "pt_BR",
  "pt_PT",
  "ro",
  "ru",
  "sk",
  "sl",
  "sr",
  "sv",
  "sw",
  "ta",
  "te",
  "th",
  "tr",
  "uk",
  "vi",
  "zh_CN",
  "zh_TW"
]);

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

function assert(condition, message) {
  if (condition) {
    pass(message);
    return;
  }

  fail(message);
}

function parseJsonFile(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${label} must be valid JSON (${error.message})`);
    return null;
  }
}

function isSemver(version) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version);
}

function isMessageToken(value) {
  return typeof value === "string" && /^__MSG_[A-Za-z0-9_]+__$/.test(value);
}

function readPngDimensions(path) {
  const file = readFileSync(path);

  if (file.length < 24) {
    throw new Error("file too small to be a PNG");
  }

  const signatureHex = file.subarray(0, 8).toString("hex");
  if (signatureHex !== "89504e470d0a1a0a") {
    throw new Error("invalid PNG signature");
  }

  const width = file.readUInt32BE(16);
  const height = file.readUInt32BE(20);

  return { width, height };
}

function walk(dirPath, relativeDir = "") {
  const entries = readdirSync(dirPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    const absolutePath = resolve(dirPath, entry.name);

    if (entry.name === ".DS_Store") {
      fail(`chrome/ must not include .DS_Store (${relativePath})`);
    }

    if (entry.name === "_metadata") {
      fail(`chrome/ must not include _metadata (${relativePath})`);
    }

    if (entry.isDirectory()) {
      walk(absolutePath, relativePath);
    }
  }
}

const manifest = parseJsonFile(manifestPath, "chrome/manifest.json");
const pkg = parseJsonFile(packagePath, "package.json");
const rules = parseJsonFile(rulesPath, "chrome/rules/subdomain-redirects.json");

if (manifest) {
  assert(manifest.manifest_version === 3, "manifest_version is 3");
  assert(typeof manifest.version === "string" && isSemver(manifest.version), "manifest version is semver");
  assert(typeof manifest.default_locale === "string" && manifest.default_locale.length > 0, "default_locale is set");
  assert(isMessageToken(manifest.name), "manifest name uses i18n message token");
  assert(isMessageToken(manifest.short_name), "manifest short_name uses i18n message token");
  assert(isMessageToken(manifest.description), "manifest description uses i18n message token");
  assert(Array.isArray(manifest.permissions), "permissions is an array");
  assert(
    Array.isArray(manifest.permissions) &&
      manifest.permissions.length === 1 &&
      manifest.permissions[0] === "declarativeNetRequest",
    "permissions only contain declarativeNetRequest"
  );
  assert(
    Array.isArray(manifest.host_permissions) &&
      manifest.host_permissions.length === 1 &&
      manifest.host_permissions[0] === "*://*.reddit.com/*",
    "host_permissions limited to *://*.reddit.com/*"
  );
  assert(
    Array.isArray(manifest.content_scripts) &&
      manifest.content_scripts.length > 0 &&
      Array.isArray(manifest.content_scripts[0].matches) &&
      manifest.content_scripts[0].matches.includes("*://*.reddit.com/*"),
    "content script matches include *://*.reddit.com/*"
  );
}

if (manifest && pkg) {
  assert(pkg.version === manifest.version, "package.json version matches manifest version");
}

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

if (manifest && typeof manifest.default_locale === "string" && manifest.default_locale.length > 0) {
  requiredFiles.push(`_locales/${manifest.default_locale}/messages.json`);
}

for (const relativePath of requiredFiles) {
  const filePath = resolve(chromeRoot, relativePath);
  assert(existsSync(filePath), `required file exists: chrome/${relativePath}`);
  if (existsSync(filePath)) {
    assert(statSync(filePath).isFile(), `required path is a file: chrome/${relativePath}`);
  }
}

if (manifest && manifest.icons) {
  const expectedIcons = {
    16: "icons/icon16.png",
    32: "icons/icon32.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png"
  };

  for (const [size, iconPath] of Object.entries(expectedIcons)) {
    assert(manifest.icons[size] === iconPath, `manifest icon ${size} maps to ${iconPath}`);
    const absoluteIconPath = resolve(chromeRoot, iconPath);
    if (existsSync(absoluteIconPath)) {
      try {
        const dimensions = readPngDimensions(absoluteIconPath);
        assert(
          dimensions.width === Number(size) && dimensions.height === Number(size),
          `${iconPath} dimensions are ${size}x${size}`
        );
      } catch (error) {
        fail(`${iconPath} is not a valid PNG (${error.message})`);
      }
    }
  }
}

if (Array.isArray(rules)) {
  assert(rules.length > 0, "redirect rules file has at least one rule");
  for (const [index, rule] of rules.entries()) {
    assert(typeof rule.id === "number", `rule ${index + 1} has numeric id`);
    assert(Boolean(rule.action) && typeof rule.action === "object", `rule ${index + 1} has action object`);
    assert(Boolean(rule.condition) && typeof rule.condition === "object", `rule ${index + 1} has condition object`);
  }
}

if (manifest && typeof manifest.default_locale === "string" && manifest.default_locale.length > 0) {
  const defaultMessagesPath = resolve(chromeRoot, "_locales", manifest.default_locale, "messages.json");
  const defaultMessages = parseJsonFile(defaultMessagesPath, `chrome/_locales/${manifest.default_locale}/messages.json`);

  if (defaultMessages) {
    const requiredMessageKeys = ["extName", "extShortName", "extDescription"];
    for (const key of requiredMessageKeys) {
      assert(
        Boolean(defaultMessages[key]) &&
          typeof defaultMessages[key] === "object" &&
          typeof defaultMessages[key].message === "string" &&
          defaultMessages[key].message.length > 0,
        `default locale defines message: ${key}`
      );
    }
  }

  const localesDir = resolve(chromeRoot, "_locales");
  if (existsSync(localesDir) && statSync(localesDir).isDirectory()) {
    const localeDirs = readdirSync(localesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    assert(localeDirs.length === SUPPORTED_LOCALES.length, "all supported locale directories are present");

    const localeSet = new Set(localeDirs);
    for (const locale of SUPPORTED_LOCALES) {
      assert(localeSet.has(locale), `supported locale directory exists: ${locale}`);
    }

    for (const locale of localeDirs) {
      assert(SUPPORTED_LOCALES.includes(locale), `locale directory is supported: ${locale}`);
    }

    for (const locale of localeDirs) {
      const localeMessagesPath = resolve(localesDir, locale, "messages.json");
      const localeMessages = parseJsonFile(localeMessagesPath, `chrome/_locales/${locale}/messages.json`);

      if (!localeMessages) {
        continue;
      }

      for (const key of ["extName", "extShortName", "extDescription"]) {
        assert(
          Boolean(localeMessages[key]) &&
            typeof localeMessages[key] === "object" &&
            typeof localeMessages[key].message === "string" &&
            localeMessages[key].message.length > 0,
          `locale ${locale} defines message: ${key}`
        );
      }
    }
  } else {
    fail("chrome/_locales directory is required when default_locale is set");
  }
}

walk(chromeRoot);

if (failures.length > 0) {
  console.error(`\nRelease check failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nRelease check passed.");
