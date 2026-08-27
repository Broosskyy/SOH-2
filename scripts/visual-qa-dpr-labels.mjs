/**
 * V20.2.6 label projection QA across deviceScaleFactor values.
 * Usage: node scripts/visual-qa-dpr-labels.mjs
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:3000";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.2.6-label-qa");

const cases = [
  { name: "1920x1080-dpr1", width: 1920, height: 1080, deviceScaleFactor: 1 },
  { name: "1920x1080-dpr2", width: 1920, height: 1080, deviceScaleFactor: 2 },
  { name: "2400x1080-dpr2", width: 2400, height: 1080, deviceScaleFactor: 2 },
  { name: "2400x1080-dpr3", width: 2400, height: 1080, deviceScaleFactor: 3 },
  { name: "1280x720-dpr2", width: 1280, height: 720, deviceScaleFactor: 2 },
];

const { chromium } = await import("playwright");
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const c of cases) {
  const context = await browser.newContext({
    viewport: { width: c.width, height: c.height },
    deviceScaleFactor: c.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?autoStart=1&visualDebug=1`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    const g = window.__ABYSSAL_GAME__;
    if (g) g.zoom = 0.96;
  });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: join(outDir, `02-mobile-mid-${c.name}.png`),
    fullPage: false,
  });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[label-qa] ${c.name}`, debug?.playerLabel, debug?.renderer);
  await context.close();
}

await browser.close();
console.log(`[label-qa] Screenshots saved to ${outDir}`);
