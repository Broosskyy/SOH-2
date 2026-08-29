/**
 * V20.3.2 heading anchor QA — 8 + 8 intermediate + OUT/MID/IN.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:8787";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.3.2-anchor");

const CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

const headings = [0, 45, 90, 135, 180, 225, 270, 315];
const intermediate = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
const zoomCases = [
  { file: "17-090-out.png", zoom: 0.6, heading: 90 },
  { file: "18-090-in.png", zoom: 1.3, heading: 90 },
  { file: "19-270-out.png", zoom: 0.6, heading: 270 },
  { file: "20-270-in.png", zoom: 1.3, heading: 270 },
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
  await page.evaluate((angle) => {
    const g = window.__ABYSSAL_GAME__;
    if (g?.player) g.player.angle = (angle * Math.PI) / 180;
    if (g) g.zoom = 0.96;
  }, deg);
  await page.waitForTimeout(1500);
  const file = `${String(headings.indexOf(deg) + 1).padStart(2, "0")}-${String(deg).padStart(3, "0")}.png`;
  await page.screenshot({ path: join(outDir, file), fullPage: false });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[v20.3.2-anchor] ${file}`, {
    visualGapCss: debug?.visualGapCss,
    anchorProfileSector: debug?.anchorProfileSector,
    statusTopCss: debug?.statusTopCss,
  });
  await context.close();
}

for (const [idx, deg] of intermediate.entries()) {
  const { context, page } = await bootPage(2400, 1080, 2);
  await page.evaluate((angle) => {
    const g = window.__ABYSSAL_GAME__;
    if (g?.player) g.player.angle = (angle * Math.PI) / 180;
    if (g) g.zoom = 0.96;
  }, deg);
  await page.waitForTimeout(1500);
  const file = `${String(9 + idx).padStart(2, "0")}-${String(deg).replace(".", "")}.png`;
  await page.screenshot({ path: join(outDir, file), fullPage: false });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[v20.3.2-anchor] ${file}`, debug?.anchorInterpolation);
  await context.close();
}

for (const c of zoomCases) {
  const { context, page } = await bootPage(2400, 1080, 2);
  await page.evaluate(
    ({ zoom, heading }) => {
      const g = window.__ABYSSAL_GAME__;
      if (g?.player) g.player.angle = (heading * Math.PI) / 180;
      if (g) g.zoom = zoom;
    },
    { zoom: c.zoom, heading: c.heading },
  );
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(outDir, c.file), fullPage: false });
  await context.close();
}

await browser.close();
console.log(`[v20.3.2-anchor] Screenshots saved to ${outDir}`);
