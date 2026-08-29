import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:8787";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.3.2-world");

const shots = [
  { file: "01-normal-mid-a.png", x: 720, y: 900, zoom: 0.96 },
  { file: "02-normal-mid-b.png", x: 1180, y: 820, zoom: 0.96 },
  { file: "03-normal-mid-c.png", x: 1620, y: 1100, zoom: 0.96 },
  { file: "04-port.png", x: 430, y: 900, zoom: 0.88 },
  { file: "05-island-transition.png", x: 900, y: 700, zoom: 0.92 },
  { file: "06-open-sea.png", x: 2100, y: 700, zoom: 0.96 },
  { file: "07-encounter.png", x: 1050, y: 1040, zoom: 0.96 },
  { file: "08-wreck.png", x: 1500, y: 1200, zoom: 0.94 },
  { file: "09-salvage.png", x: 1580, y: 1440, zoom: 0.94 },
  { file: "10-rock-formation.png", x: 1350, y: 650, zoom: 0.94 },
  { file: "11-navigation-lane.png", x: 800, y: 600, zoom: 0.9 },
  { file: "12-wide.png", x: 1500, y: 950, zoom: 0.62 },
];

const { chromium } = await import("playwright");
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: 2400, height: 1080 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?autoStart=1&visualDebug=1`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForSelector("main.game-shell", { timeout: 120000 });
  await page.waitForFunction(() => Boolean(window.__ABYSSAL_GAME__?.running), { timeout: 90000 });
  await page.waitForTimeout(3500);
  await page.evaluate(({ x, y, zoom }) => {
    const g = window.__ABYSSAL_GAME__;
    if (!g) return;
    g.player.x = x;
    g.player.y = y;
    g.zoom = zoom;
  }, shot);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(outDir, shot.file), fullPage: false });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[v20.3.2-world] ${shot.file}`, debug?.world);
  await context.close();
}

await browser.close();
console.log(`[v20.3.2-world] Screenshots saved to ${outDir}`);
