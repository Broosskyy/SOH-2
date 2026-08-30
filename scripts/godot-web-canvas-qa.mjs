import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const url = process.env.GODOT_WEB_URL ?? "http://127.0.0.1:8061/index.html";
const chrome =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const mobile = process.env.GODOT_WEB_MOBILE === "1";
const width = parseDimension("GODOT_WEB_WIDTH", 915);
const height = parseDimension("GODOT_WEB_HEIGHT", 412);
const minCoverage = Number.parseFloat(process.env.GODOT_WEB_MIN_COVERAGE ?? "90");
const port = 9300 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(path.join(os.tmpdir(), "abyssal-godot-canvas-"));

function parseDimension(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? `${fallback}`, 10);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

const browser = spawn(
  chrome,
  [
    "--headless=new",
    "--no-first-run",
    "--disable-default-apps",
    "--enable-unsafe-swiftshader",
    "--use-angle=swiftshader",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

browser.stderr.resume();

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function pageTarget() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(
        (response) => response.json(),
      );
      const page = targets.find((target) => target.type === "page");
      if (page) return page;
    } catch {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error("Chrome DevTools endpoint did not become ready");
}

const target = await pageTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const consoleErrors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
    return;
  }
  if (message.method === "Runtime.exceptionThrown") {
    consoleErrors.push(message.params.exceptionDetails.text);
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    consoleErrors.push(
      message.params.args.map((argument) => argument.value ?? argument.description).join(" "),
    );
  }
});

function send(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
  if (mobile) {
    await send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
  }
  await send("Page.navigate", { url });
  let booted = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await sleep(250);
    const result = await send("Runtime.evaluate", {
      expression:
        "document.readyState === 'complete' && document.getElementById('status') === null && !!document.getElementById('canvas')",
      returnByValue: true,
    });
    if (result.result.value === true) {
      booted = true;
      break;
    }
  }
  if (!booted) throw new Error("Godot splash did not clear within 30 seconds");
  await sleep(1500);

  const metricsResult = await send("Runtime.evaluate", {
    expression: `(() => {
      const metrics = window.AbyssalWebViewport?.readMetrics?.() || {};
      const canvas = document.getElementById('canvas');
      const rect = canvas?.getBoundingClientRect?.();
      return JSON.stringify({
        build: document.querySelector('meta[name="abyssal-build"]')?.content || metrics.build || '',
        metrics,
        canvasRect: rect ? { x: rect.x, y: rect.y, w: rect.width, h: rect.height } : null,
        page: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          clientWidth: document.documentElement.clientWidth,
          clientHeight: document.documentElement.clientHeight,
        },
      });
    })()`,
    returnByValue: true,
  });
  const payload = JSON.parse(metricsResult.result.value);
  const coverage = payload.metrics?.coverage ?? { x: 0, y: 0 };
  const canvas = payload.metrics?.canvas ?? payload.canvasRect ?? {};

  if (consoleErrors.length) {
    throw new Error(`Web runtime console errors:\n${consoleErrors.join("\n")}`);
  }
  if (!String(payload.build).includes("G0.5.3")) {
    throw new Error(`Stale or missing build marker: ${payload.build || "none"}`);
  }
  if (coverage.x < minCoverage || coverage.y < minCoverage) {
    throw new Error(
      `Canvas coverage below ${minCoverage}%: x=${coverage.x?.toFixed?.(1) ?? coverage.x}% y=${coverage.y?.toFixed?.(1) ?? coverage.y}%`,
    );
  }
  if ((canvas.w ?? canvas.width ?? 0) < width * 0.9) {
    throw new Error(`Canvas CSS width too small: ${canvas.w ?? canvas.width} < ${width * 0.9}`);
  }
  if ((canvas.h ?? canvas.height ?? 0) < height * 0.9) {
    throw new Error(`Canvas CSS height too small: ${canvas.h ?? canvas.height} < ${height * 0.9}`);
  }
  if ((canvas.x ?? 0) > 4 || (canvas.y ?? 0) > 4) {
    throw new Error(`Canvas origin offset too large: x=${canvas.x} y=${canvas.y}`);
  }

  const evidencePath = path.resolve(
    process.env.GODOT_WEB_CANVAS_EVIDENCE ??
      `artifacts/godot-g0.5.3/web-canvas-${width}x${height}-${mobile ? "mobile" : "desktop"}.json`,
  );
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`GODOT_WEB_CANVAS_QA_PASS ${width}x${height} ${mobile ? "mobile" : "desktop"}`);
  console.log(`CANVAS_COVERAGE x=${coverage.x.toFixed(1)}% y=${coverage.y.toFixed(1)}%`);
  console.log(`EVIDENCE ${evidencePath}`);
} finally {
  socket.close();
  browser.kill();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
