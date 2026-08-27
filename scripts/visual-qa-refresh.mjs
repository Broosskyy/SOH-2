import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:3000";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.2.5-visual-qa", "iteration-final");

const { chromium } = await import("playwright");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });
await page.goto(`${baseUrl}/?autoStart=1&visualDebug=1`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(4000);
await page.evaluate(() => {
  const g = window.__ABYSSAL_GAME__;
  if (g) g.zoom = 0.96;
});
await page.waitForTimeout(1500);
await page.screenshot({ path: join(outDir, "02-mobile-mid.png") });
await page.evaluate(() => {
  const g = window.__ABYSSAL_GAME__;
  if (!g) return;
  g.destination = { x: g.player.x + 420, y: g.player.y + 180 };
});
await page.waitForTimeout(2500);
await page.screenshot({ path: join(outDir, "04-mobile-moving-wake.png") });
await browser.close();
console.log("[visual-qa] refreshed mid + wake");
