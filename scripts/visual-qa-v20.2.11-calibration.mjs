/**
 * V20.2.11 world status calibration QA.
 * Usage: node scripts/visual-qa-v20.2.11-calibration.mjs [baseUrl]
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.argv[2] ?? process.env.VISUAL_QA_URL ?? "http://127.0.0.1:8787";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.2.11-world-status-calibration");

const CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

const cases = [
  { file: "01-mid-dpr1.png", width: 2400, height: 1080, dpr: 1, zoom: 0.96 },
  { file: "02-mid-dpr2.png", width: 2400, height: 1080, dpr: 2, zoom: 0.96 },
  { file: "03-mid-dpr3.png", width: 2400, height: 1080, dpr: 3, zoom: 0.96 },
  { file: "04-out-dpr2.png", width: 2400, height: 1080, dpr: 2, zoom: 0.6 },
  { file: "05-in-dpr2.png", width: 2400, height: 1080, dpr: 2, zoom: 1.3 },
  { file: "06-player-only.png", width: 1920, height: 1080, dpr: 2, zoom: 0.96 },
  { file: "07-player-npc.png", width: 2400, height: 1080, dpr: 2, zoom: 0.96 },
  { file: "08-player-poi.png", width: 2400, height: 1080, dpr: 2, zoom: 0.96 },
  { file: "09-player-npc-poi.png", width: 2400, height: 1080, dpr: 2, zoom: 0.96 },
  { file: "10-wide-world-composition.png", width: 2340, height: 1080, dpr: 2, zoom: 0.96 },
];

const { chromium } = await import("playwright");
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const c of cases) {
  const context = await browser.newContext({
    viewport: { width: c.width, height: c.height },
    deviceScaleFactor: c.dpr,
    isMobile: true,
    hasTouch: true,
    userAgent: CHROME_UA,
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?autoStart=1&visualDebug=1`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.waitForSelector("main.game-shell", { timeout: 120000 });
  await page.waitForFunction(() => Boolean(window.__ABYSSAL_GAME__?.running), { timeout: 90000 });
  await page.waitForTimeout(4500);
  await page.evaluate((zoom) => {
    const g = window.__ABYSSAL_GAME__;
    if (g) g.zoom = zoom;
  }, c.zoom);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(outDir, c.file), fullPage: false });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[v20.2.11-qa] ${c.file}`, debug?.playerLabel, debug?.npcLabel);
  await context.close();
}

await browser.close();
console.log(`[v20.2.11-qa] Screenshots saved to ${outDir}`);
