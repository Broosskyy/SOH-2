import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const [baseUrl, outDir, viewportsJson] = process.argv.slice(2);
const viewports = JSON.parse(viewportsJson);

let playwright;
try {
  playwright = await import("playwright");
} catch {
  console.error("playwright not installed. Run: npm install -D playwright && npx playwright install chromium");
  process.exit(1);
}

const { chromium } = playwright;
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(`${baseUrl}/?autoStart=1&visualDebug=1`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(4000);

  await page.evaluate((zoom) => {
    const g = window.__ABYSSAL_GAME__;
    if (g) g.zoom = zoom;
  }, vp.zoom);

  await page.waitForTimeout(1500);
  await page.screenshot({
    path: join(outDir, `${vp.name}.png`),
    fullPage: false,
  });
  console.log(`[visual-qa] ${vp.name}`);
}

// Moving wake screenshot
await page.setViewportSize({ width: 1920, height: 1080 });
await page.evaluate(() => {
  const g = window.__ABYSSAL_GAME__;
  if (!g) return;
  g.zoom = 0.96;
  g.destination = { x: g.player.x + 420, y: g.player.y + 180 };
});
await page.waitForTimeout(2500);
await page.screenshot({
  path: join(outDir, "04-mobile-moving-wake.png"),
  fullPage: false,
});
console.log("[visual-qa] 04-mobile-moving-wake");

await browser.close();
