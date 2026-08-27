/**
 * V20.2.8 label projection QA across DPR and zoom levels.
 * Usage: node scripts/visual-qa-dpr-labels.mjs
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:3000";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.2.8-label-qa");

const dprs = [1, 2, 3];
const zoomLevels = [
  { tag: "out", zoom: 0.6 },
  { tag: "mid", zoom: 0.96 },
  { tag: "in", zoom: 1.3 },
];

const { chromium } = await import("playwright");
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const dpr of dprs) {
  const context = await browser.newContext({
    viewport: { width: 2400, height: 1080 },
    deviceScaleFactor: dpr,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?autoStart=1&visualDebug=1`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForTimeout(3500);

  for (const level of zoomLevels) {
    await page.evaluate((zoom) => {
      const g = window.__ABYSSAL_GAME__;
      if (g) g.zoom = zoom;
    }, level.zoom);
    await page.waitForTimeout(1200);
    const name = `mobile-landscape-dpr${dpr}-${level.tag}`;
    await page.screenshot({
      path: join(outDir, `${name}.png`),
      fullPage: false,
    });
    const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
    console.log(`[label-qa] ${name}`, debug?.playerLabel, debug?.renderer);
  }

  await context.close();
}

await browser.close();
console.log(`[label-qa] Screenshots saved to ${outDir}`);
