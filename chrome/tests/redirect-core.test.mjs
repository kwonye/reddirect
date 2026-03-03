import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);

// The redirect-core.js is at parent directory
const { computeRedirectUrl } = require("../redirect-core.js");

function redirected(url) {
  return computeRedirectUrl(url);
}

test("redirects single-label subreddit host to /r/<subreddit>", () => {
  assert.equal(redirected("https://nba.reddit.com"), "https://reddit.com/r/nba/");
});

test("preserves path, query, and hash", () => {
  assert.equal(
    redirected("https://nba.reddit.com/top?t=week#now"),
    "https://reddit.com/r/nba/top?t=week#now"
  );
});

test("does not redirect reserved hosts", () => {
  assert.equal(redirected("https://www.reddit.com"), null);
  assert.equal(redirected("https://old.reddit.com/r/nba"), null);
  assert.equal(redirected("https://api.reddit.com"), null);
});

test("does not redirect multi-label hosts", () => {
  assert.equal(redirected("https://foo.bar.reddit.com"), null);
});

test("does not redirect non-reddit hosts", () => {
  assert.equal(redirected("https://nba.example.com"), null);
});

test("normalizes to https even when source is http", () => {
  assert.equal(redirected("http://nba.reddit.com/new"), "https://reddit.com/r/nba/new");
});

test("normalizes uppercase host casing", () => {
  assert.equal(redirected("https://NBA.Reddit.com/rising"), "https://reddit.com/r/nba/rising");
});

test("returns null on invalid and unsupported URLs", () => {
  assert.equal(redirected("not a url"), null);
  assert.equal(redirected("ftp://nba.reddit.com"), null);
  assert.equal(redirected("https://reddit.com/r/nba"), null);
});

test("Chrome extension has declarativeNetRequest rules", () => {
  const rulesPath = resolve(import.meta.dirname, "..", "rules", "subdomain-redirects.json");
  const rules = readFileSync(rulesPath, "utf8");
  const parsed = JSON.parse(rules);
  const redirectRule = parsed.find(r => r.action.type === "redirect");
  assert.ok(redirectRule, "Chrome should have a redirect rule for subdomain conversion");
  assert.ok(
    redirectRule.condition.regexFilter.includes("reddit"),
    "Redirect rule should match reddit domains"
  );
});
