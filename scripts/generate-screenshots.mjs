// scripts/generate-screenshots.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, 'assets', 'store');

mkdirSync(OUTPUT, { recursive: true });

const IMAGES = [
  { template: 'screenshot-1.html',  output: 'screenshot-1.png',  width: 1280, height: 800 },
  { template: 'screenshot-2.html',  output: 'screenshot-2.png',  width: 1280, height: 800 },
  { template: 'screenshot-3.html',  output: 'screenshot-3.png',  width: 1280, height: 800 },
  { template: 'promo-small.html',   output: 'promo-small.png',   width: 440,  height: 280 },
  { template: 'promo-marquee.html', output: 'promo-marquee.png', width: 1400, height: 560 },
];

const browser = await chromium.launch();

for (const { template, output, width, height } of IMAGES) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  const templatePath = join(ROOT, 'scripts', 'screenshots', template);
  await page.goto(`file://${templatePath}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: join(OUTPUT, output),
    type: 'png',
    clip: { x: 0, y: 0, width, height },
    omitBackground: false,
  });
  await page.close();
  console.log(`✓  ${output} (${width}×${height})`);
}

await browser.close();
console.log('\nAll images written to assets/store/');
