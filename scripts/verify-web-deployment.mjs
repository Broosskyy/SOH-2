/**
 * V20.2.9 web server / deployment verification.
 * Usage: node scripts/verify-web-deployment.mjs [baseUrl]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.argv[2] ?? process.env.VERIFY_URL ?? "http://127.0.0.1:8787";
const outDir = join(import.meta.dirname, "..", "artifacts", "v20.2.9-deployment-verify");
const CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

const markers = [
  "PlayerWorldLabelGroup",
  "worldLabels",
  "BUILD_RELEASE",
  "V20.2.9",
  "86075a8",
];

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": CHROME_UA } });
  return { status: res.status, text: await res.text(), url: res.url };
}

await mkdir(outDir, { recursive: true });

const html = await fetchText(`${baseUrl}/?autoStart=1&visualDebug=1`);
const assetMatch =
  html.text.match(/import\(["'](\/assets\/threeRenderer-[^"']+\.js)["']\)/) ??
  html.text.match(/\/assets\/threeRenderer-[^"']+\.js/);
const assetPath = assetMatch
  ? assetMatch[1] ?? assetMatch[0].replace(/^.*(\/assets\/threeRenderer-[^"']+\.js).*$/, "$1")
  : null;

let bundleText = "";
let bundleStatus = 0;
if (assetPath) {
  const bundle = await fetchText(`${baseUrl}${assetPath}`);
  bundleStatus = bundle.status;
  bundleText = bundle.text;
}

const report = {
  baseUrl,
  htmlStatus: html.status,
  threeRendererAsset: assetPath,
  bundleStatus,
  markersInBundle: Object.fromEntries(markers.map((m) => [m, bundleText.includes(m)])),
  serviceWorker: html.text.includes("serviceWorker") || html.text.includes("navigator.serviceWorker"),
};

const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 2400, height: 1080 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: CHROME_UA,
});
const page = await context.newPage();
const t0 = Date.now();
await page.goto(`${baseUrl}/?autoStart=1&visualDebug=1`, { waitUntil: "domcontentloaded", timeout: 120000 });
const loadingVisible = await page.locator("main.loading").isVisible().catch(() => false);
await page.waitForSelector("main.game-shell", { timeout: 120000 });
const bootMs = Date.now() - t0;
await page.waitForFunction(() => Boolean(window.__ABYSSAL_GAME__?.running), { timeout: 90000 });
await page.waitForTimeout(5000);
const debug = await page.evaluate(() => window.__ABYSSAL_VISUAL_DEBUG__ ?? null);
const buildOverlay = await page.locator(".visual-build-debug").textContent().catch(() => "");
await page.screenshot({ path: join(outDir, `web-server-${new URL(baseUrl).port || "default"}.png`), fullPage: false });
report.bootMs = bootMs;
report.loadingStuckInitially = loadingVisible;
report.gameRunning = Boolean(debug);
report.visualDebug = debug;
report.buildOverlay = buildOverlay?.trim() ?? "";
report.playerLabel = debug?.playerLabel ?? null;
await browser.close();

await writeFile(join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

const pass =
  html.status === 200 &&
  bundleStatus === 200 &&
  report.markersInBundle.PlayerWorldLabelGroup &&
  report.markersInBundle["V20.2.9"] &&
  report.gameRunning &&
  /V20\.2\.9/.test(report.buildOverlay) &&
  /86075a8/.test(report.buildOverlay);

process.exit(pass ? 0 : 1);
