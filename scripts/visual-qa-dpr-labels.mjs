/**
 * V20.2.9 label projection QA — Chrome-like mobile contexts.
 * Usage: node scripts/visual-qa-dpr-labels.mjs
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:8787";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.2.10-world-status");

const CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

const cases = [
  { file: "01-mobile-mid-dpr1.png", width: 2400, height: 1080, dpr: 1, zoom: 0.96 },
  { file: "02-mobile-mid-dpr2.png", width: 2400, height: 1080, dpr: 2, zoom: 0.96 },
  { file: "03-mobile-mid-dpr3.png", width: 2400, height: 1080, dpr: 3, zoom: 0.96 },
  { file: "04-mobile-out-dpr2.png", width: 2400, height: 1080, dpr: 2, zoom: 0.6 },
  { file: "05-mobile-in-dpr2.png", width: 2400, height: 1080, dpr: 2, zoom: 1.3 },
  { file: "06-small-landscape.png", width: 1280, height: 720, dpr: 2, zoom: 0.96 },
  { file: "07-wide-landscape.png", width: 2340, height: 1080, dpr: 2, zoom: 0.96 },
  { file: "08-moving-player.png", width: 1920, height: 1080, dpr: 2, zoom: 0.96, move: true },
  { file: "09-player-npc-poi.png", width: 2400, height: 1080, dpr: 2, zoom: 0.96 },
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
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForSelector("main.game-shell", { timeout: 120000 });
  await page.waitForFunction(() => Boolean(window.__ABYSSAL_GAME__?.running), { timeout: 90000 });
  await page.waitForTimeout(4500);
  await page.evaluate((zoom) => {
    const g = window.__ABYSSAL_GAME__;
    if (g) g.zoom = zoom;
  }, c.zoom);
  if (c.move) {
    await page.evaluate(() => {
      const g = window.__ABYSSAL_GAME__;
      if (g) {
        g.player.speed = 42;
        g.destination = { x: g.player.x + 180, y: g.player.y + 40 };
      }
    });
    await page.waitForTimeout(1800);
  } else {
    await page.waitForTimeout(1200);
  }
  await page.screenshot({ path: join(outDir, c.file), fullPage: false });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[label-qa] ${c.file}`, debug?.playerLabel, debug?.npcLabel);
  await context.close();
}

await browser.close();
console.log(`[label-qa] Screenshots saved to ${outDir}`);
