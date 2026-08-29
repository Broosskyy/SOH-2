/**
 * V20.3 rotation-safe heading QA — 8 headings + OUT/MID/IN.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:8787";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.3-world-status");

const CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

const headings = [0, 45, 90, 135, 180, 225, 270, 315];
const zoomCases = [
  { file: "09-out-dpr2.png", zoom: 0.6, dpr: 2 },
  { file: "10-mid-dpr2.png", zoom: 0.96, dpr: 2 },
  { file: "11-in-dpr2.png", zoom: 1.3, dpr: 2 },
];

const { chromium } = await import("playwright");
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function bootPage(width, height, dpr) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
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
  return { context, page };
}

for (const deg of headings) {
  const { context, page } = await bootPage(2400, 1080, 2);
  const rad = (deg * Math.PI) / 180;
  await page.evaluate((angle) => {
    const g = window.__ABYSSAL_GAME__;
    if (g?.player) g.player.angle = angle;
    if (g) g.zoom = 0.96;
  }, rad);
  await page.waitForTimeout(1800);
  const file = `0${headings.indexOf(deg) + 1}-heading-${String(deg).padStart(3, "0")}.png`;
  await page.screenshot({ path: join(outDir, file), fullPage: false });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[heading-qa] ${file}`, debug?.playerLabel?.rotationAnchor, debug?.playerLabel?.shipToLabelGapCss);
  await context.close();
}

for (const c of zoomCases) {
  const { context, page } = await bootPage(2400, 1080, c.dpr);
  await page.evaluate((zoom) => {
    const g = window.__ABYSSAL_GAME__;
    if (g) g.zoom = zoom;
  }, c.zoom);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(outDir, c.file), fullPage: false });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[heading-qa] ${c.file}`, debug?.zoom, debug?.playerLabel?.nameCssHeight);
  await context.close();
}

await browser.close();
console.log(`[heading-qa] Screenshots saved to ${outDir}`);
