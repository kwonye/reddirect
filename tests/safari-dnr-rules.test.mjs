import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const RULES_PATH = join('safari', 'Reddirect Extension', 'Resources', 'rules', 'subdomain-redirects.json');
const PROJECT_ROOT = process.cwd();

test('Safari DNR rules should correctly redirect Reddit subdomains', async (t) => {
  const rulesPath = join(PROJECT_ROOT, RULES_PATH);
  
  // Verify rules file exists
  assert.ok(existsSync(rulesPath), 'DNR rules file should exist');
  
  const rules = JSON.parse(readFileSync(rulesPath, 'utf-8'));

  await t.test('should be valid JSON array', () => {
    assert.ok(Array.isArray(rules), 'Rules should be an array');
    assert.ok(rules.length > 0, 'Should have at least one rule');
  });

  await t.test('should have allow rules for reserved hosts', () => {
    const allowRules = rules.filter(rule => rule.action.type === 'allow');
    assert.ok(allowRules.length >= 14, 'Should have at least 14 allow rules for reserved hosts');
    
    const reservedHosts = ['www', 'old', 'new', 'i', 'm', 'np', 'mod', 'api', 'oauth', 'out', 'amp', 'gateway', 'pay', 'accounts'];
    
    reservedHosts.forEach(host => {
      const hasRule = allowRules.some(rule => 
        rule.condition.regexFilter.includes(`${host}\\.reddit\\.com`)
      );
      assert.ok(hasRule, `Should have allow rule for ${host}.reddit.com`);
    });
  });

  await t.test('should have redirect rule for subdomains', () => {
    const redirectRules = rules.filter(rule => rule.action.type === 'redirect');
    assert.ok(redirectRules.length >= 1, 'Should have at least one redirect rule');
    
    const redirectRule = redirectRules.find(rule => 
      rule.action.redirect && rule.action.redirect.regexSubstitution
    );
    assert.ok(redirectRule, 'Should have a redirect rule with regexSubstitution');
    assert.ok(
      redirectRule.action.redirect.regexSubstitution.includes('reddit.com/r/'),
      'Redirect should point to reddit.com/r/'
    );
  });

  await t.test('should redirect simple subdomain correctly', () => {
    const redirectRule = rules.find(rule => rule.action.type === 'redirect');
    const regex = new RegExp(redirectRule.condition.regexFilter);
    
    // Test: https://nba.reddit.com should match
    assert.ok(regex.test('https://nba.reddit.com'), 'Should match nba.reddit.com');
    
    // Test: http://nba.reddit.com should also match
    assert.ok(regex.test('http://nba.reddit.com'), 'Should match http://nba.reddit.com');
  });

  await t.test('should preserve path and query in redirect', () => {
    const redirectRule = rules.find(rule => rule.action.type === 'redirect');
    const regex = new RegExp(redirectRule.condition.regexFilter);
    
    // Test URL with path and query
    const testUrl = 'https://nba.reddit.com/top?t=week';
    assert.ok(regex.test(testUrl), 'Should match URL with path and query');
    
    // Verify the regex captures groups correctly
    const match = testUrl.match(regex);
    assert.ok(match, 'Should capture groups');
    assert.ok(match[1], 'Should capture subdomain (group 1)');
    assert.strictEqual(match[1], 'nba', 'Group 1 should be the subdomain');
  });

  await t.test('should not redirect reserved hosts', () => {
    const redirectRule = rules.find(rule => rule.action.type === 'redirect');
    const allowRules = rules.filter(rule => rule.action.type === 'allow');
    const reservedHosts = ['www', 'old', 'new', 'i', 'm', 'api'];
    
    reservedHosts.forEach(host => {
      const url = `https://${host}.reddit.com`;
      const hasAllowRule = allowRules.some(rule => 
        new RegExp(rule.condition.regexFilter).test(url)
      );
      assert.ok(hasAllowRule, `${host}.reddit.com should have an allow rule`);
    });
  });

  await t.test('should not redirect multi-label hosts like foo.bar.reddit.com', () => {
    const redirectRule = rules.find(rule => rule.action.type === 'redirect');
    const regex = new RegExp(redirectRule.condition.regexFilter);
    
    // Multi-label subdomain should not match
    assert.ok(!regex.test('https://foo.bar.reddit.com'), 'Should not match foo.bar.reddit.com');
    assert.ok(!regex.test('https://test.sub.reddit.com'), 'Should not match test.sub.reddit.com');
  });

  await t.test('should have correct priority ordering', () => {
    const allowRules = rules.filter(rule => rule.action.type === 'allow');
    const redirectRules = rules.filter(rule => rule.action.type === 'redirect');
    
    // Allow rules should have higher priority than redirect rules
    const minAllowPriority = Math.min(...allowRules.map(r => r.priority));
    const maxRedirectPriority = Math.max(...redirectRules.map(r => r.priority));
    
    assert.ok(minAllowPriority > maxRedirectPriority, 'Allow rules should have higher priority than redirect rules');
  });

  await t.test('should only apply to main_frame resources', () => {
    rules.forEach(rule => {
      assert.ok(
        rule.condition.resourceTypes.includes('main_frame'),
        `Rule ${rule.id} should apply to main_frame resources`
      );
    });
  });
});
