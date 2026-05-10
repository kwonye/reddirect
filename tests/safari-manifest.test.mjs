import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MANIFEST_PATH = join('safari', 'Reddirect Extension', 'Resources', 'manifest.json');
const PROJECT_ROOT = process.cwd();

test('Safari manifest should use DNR and have correct configuration', async (t) => {
  const manifestPath = join(PROJECT_ROOT, MANIFEST_PATH);
  
  // Verify manifest file exists
  assert.ok(existsSync(manifestPath), 'Safari manifest.json should exist');
  
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  await t.test('should use manifest_version 3', () => {
    assert.strictEqual(manifest.manifest_version, 3, 'Manifest version should be 3');
  });

  await t.test('should have declarativeNetRequestWithHostAccess permission', () => {
    assert.ok(Array.isArray(manifest.permissions), 'Permissions should be an array');
    assert.ok(
      manifest.permissions.includes('declarativeNetRequestWithHostAccess'),
      'Should have declarativeNetRequestWithHostAccess permission'
    );
  });

  await t.test('should have correct host_permissions', () => {
    assert.ok(Array.isArray(manifest.host_permissions), 'Host permissions should be an array');
    assert.ok(
      manifest.host_permissions.includes('*://*.reddit.com/*'),
      'Should have *.reddit.com host permission'
    );
    assert.ok(
      manifest.host_permissions.includes('*://reddit.com/*'),
      'Should have reddit.com host permission'
    );
  });

  await t.test('should not have action (to avoid site-access prompts)', () => {
    assert.strictEqual(manifest.action, undefined, 'Manifest should not have an action property');
  });

  await t.test('should reference DNR rules file', () => {
    assert.ok(manifest.declarative_net_request, 'Should have declarative_net_request property');
    assert.ok(Array.isArray(manifest.declarative_net_request.rule_resources), 'rule_resources should be an array');
    assert.ok(manifest.declarative_net_request.rule_resources.length > 0, 'Should have at least one rule resource');
    
    const ruleResource = manifest.declarative_net_request.rule_resources[0];
    assert.strictEqual(ruleResource.id, 'subdomain_redirects', 'Rule resource ID should be subdomain_redirects');
    assert.strictEqual(ruleResource.enabled, true, 'Rule resource should be enabled');
    assert.ok(ruleResource.path, 'Rule resource should have a path');
    
    // Verify the rules file exists
    const rulesPath = join(PROJECT_ROOT, 'safari', 'Reddirect Extension', 'Resources', ruleResource.path);
    assert.ok(existsSync(rulesPath), `DNR rules file should exist at ${ruleResource.path}`);
  });

  await t.test('should not have webNavigation or tabs permissions', () => {
    assert.ok(
      !manifest.permissions.includes('webNavigation'),
      'Should not have webNavigation permission (replaced by DNR)'
    );
    assert.ok(
      !manifest.permissions.includes('tabs'),
      'Should not have tabs permission (replaced by DNR)'
    );
  });
});
