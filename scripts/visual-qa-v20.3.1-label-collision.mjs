import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:8787";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.3.1-label-collision");

const { chromium } = await import("playwright");
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function capture(file, setup) {
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
  await setup(page);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(outDir, file), fullPage: false });
  const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
  console.log(`[v20.3.1-collision] ${file}`, debug?.labelCollision);
  await context.close();
}

await capture("01-two-npcs.png", async (page) => {
  await page.evaluate(() => {
    const g = window.__ABYSSAL_GAME__;
    if (!g) return;
    g.zoom = 0.96;
    g.player.x = 1040;
    g.player.y = 1030;
    g.entities = g.entities.map((e, i) =>
      i < 2 ? { ...e, x: 1080 + i * 18, y: 1020 + i * 8, hp: e.maxHp } : e,
    );
  });
});

await capture("02-three-npcs.png", async (page) => {
  await page.evaluate(() => {
    const g = window.__ABYSSAL_GAME__;
    if (!g) return;
    g.zoom = 0.96;
    g.player.x = 1530;
    g.player.y = 640;
    g.entities = g.entities.map((e, i) =>
      i < 3 ? { ...e, x: 1560 + i * 16, y: 650 + i * 6, hp: e.maxHp } : e,
    );
  });
});

await capture("03-player-two-npcs.png", async (page) => {
  await page.evaluate(() => {
    const g = window.__ABYSSAL_GAME__;
    if (!g) return;
    g.zoom = 1.05;
    g.player.x = 1045;
    g.player.y = 1035;
    g.entities = g.entities.map((e, i) =>
      i < 2 ? { ...e, x: g.player.x + 40 + i * 14, y: g.player.y + 10 + i * 6, hp: e.maxHp } : e,
    );
  });
});

await capture("04-target-crowd.png", async (page) => {
  await page.evaluate(() => {
    const g = window.__ABYSSAL_GAME__;
    if (!g) return;
    g.zoom = 0.96;
    g.player.x = 1580;
    g.player.y = 1440;
    const target = g.entities[0];
    if (target) g.selectedId = target.id;
    g.entities = g.entities.map((e, i) =>
      i < 4 ? { ...e, x: 1600 + i * 12, y: 1450 + i * 5, hp: e.maxHp } : e,
    );
  });
});

await capture("05-npc-poi.png", async (page) => {
  await page.evaluate(() => {
    const g = window.__ABYSSAL_GAME__;
    if (!g) return;
    g.zoom = 0.9;
    g.player.x = 430;
    g.player.y = 900;
    g.entities = g.entities.map((e, i) =>
      i < 2 ? { ...e, x: 500 + i * 20, y: 910 + i * 8, hp: e.maxHp } : e,
    );
  });
});

await browser.close();
console.log(`[v20.3.1-collision] Screenshots saved to ${outDir}`);
