import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const url = process.env.GODOT_WEB_URL ?? "http://127.0.0.1:8061/index.html";
const chrome =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const output =
  process.env.GODOT_WEB_SCREENSHOT ??
  path.resolve("artifacts/godot-g0.1/web_runtime.png");
const mobile = process.env.GODOT_WEB_MOBILE === "1";
const port = 9300 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(path.join(os.tmpdir(), "abyssal-godot-web-"));
await mkdir(path.dirname(output), { recursive: true });

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
    "--window-size=1280,720",
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
const consoleMessages = [];
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
  if (
    message.method === "Runtime.consoleAPICalled"
  ) {
    const text = message.params.args
      .map((argument) => argument.value ?? argument.description)
      .join(" ");
    consoleMessages.push(`${message.params.type}: ${text}`);
    if (message.params.type === "error") consoleErrors.push(text);
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
  const runtimeState = await send("Runtime.evaluate", {
    expression:
      "JSON.stringify({ready:document.readyState,visibility:document.visibilityState,canvas:{width:canvas.width,height:canvas.height,clientWidth:canvas.clientWidth,clientHeight:canvas.clientHeight},touch:navigator.maxTouchPoints})",
    returnByValue: true,
  });
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(output, Buffer.from(screenshot.data, "base64"));
  if (consoleErrors.length) {
    throw new Error(`Web runtime console errors:\n${consoleErrors.join("\n")}`);
  }
  console.log(`GODOT_WEB_RUNTIME_PASS ${url}`);
  console.log(`RUNTIME_STATE ${runtimeState.result.value}`);
  if (mobile) console.log(`CONSOLE ${JSON.stringify(consoleMessages)}`);
  console.log(`SCREENSHOT ${output}`);
} finally {
  socket.close();
  browser.kill();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {
    // Chrome's crash reporter can briefly retain a metrics file on Windows.
  });
}

