/**
 * V20.2.7 visual QA — labels across viewports, DPR, and zoom levels.
 * Usage: node scripts/visual-qa-dpr-labels.mjs
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:3000";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.2.7-label-qa");

const viewports = [
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 2400, height: 1080 },
];

const dprs = [1, 2, 3];
const zooms = [
  { name: "out", value: 0.65 },
  { name: "mid", value: 0.96 },
  { name: "in", value: 1.24 },
];

const { chromium } = await import("playwright");
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const viewport of viewports) {
  for (const dpr of dprs) {
    for (const zoom of zooms) {
      const tag = `${viewport.width}x${viewport.height}-dpr${dpr}-${zoom.name}`;
      const context = await browser.newContext({
        viewport,
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
      await page.evaluate((z) => {
        const g = window.__ABYSSAL_GAME__;
        if (g) g.zoom = z;
      }, zoom.value);
      await page.waitForTimeout(4500);
      await page.screenshot({
        path: join(outDir, `${tag}.png`),
        fullPage: false,
      });
      const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
      console.log(`[label-qa] ${tag}`, debug?.labels?.[0], debug?.renderer);
      await context.close();
    }
  }
}

await browser.close();
console.log(`[label-qa] Screenshots saved to ${outDir}`);
