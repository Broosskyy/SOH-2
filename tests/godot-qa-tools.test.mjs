import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  collectWebArtifacts,
  writeBreakdown,
} from "../scripts/godot-web-build-breakdown.mjs";
import { RUNTIME_MATRIX } from "../scripts/godot-web-runtime-matrix.mjs";
import { runAndroidSmoke } from "../scripts/godot-android-smoke.mjs";

const read = (file) =>
  readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("web build breakdown reports sorted artifact sizes", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "godot-web-breakdown-"));
  try {
    const build = path.join(temporary, "web");
    await mkdir(path.join(build, "nested"), { recursive: true });
    await writeFile(path.join(build, "index.html"), "1234");
    await writeFile(path.join(build, "nested", "game.wasm"), "123456");
    const breakdown = await collectWebArtifacts(build);
    assert.equal(breakdown.artifactCount, 2);
    assert.equal(breakdown.totalBytes, 10);
    assert.deepEqual(
      breakdown.files.map((file) => [file.path, file.bytes]),
      [["index.html", 4], ["nested/game.wasm", 6]],
    );

    const output = path.join(temporary, "evidence", "breakdown.json");
    await writeBreakdown({ buildDirectory: build, output });
    assert.equal(JSON.parse(await readFile(output, "utf8")).totalBytes, 10);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("runtime matrix covers three viewports in desktop and mobile modes", () => {
  assert.equal(RUNTIME_MATRIX.length, 6);
  assert.deepEqual(
    RUNTIME_MATRIX.map(({ width, height, mobile }) =>
      `${width}x${height}:${mobile ? "mobile" : "desktop"}`),
    [
      "1280x720:desktop",
      "1280x720:mobile",
      "1920x1080:desktop",
      "1920x1080:mobile",
      "2400x1080:desktop",
      "2400x1080:mobile",
    ],
  );
});

test("Android smoke remains export-only when adb is unavailable", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "godot-android-smoke-"));
  try {
    const output = path.join(temporary, "android.json");
    const evidence = await runAndroidSmoke({
      adb: `definitely-missing-adb-${process.pid}`,
      enabled: true,
      output,
    });
    assert.equal(evidence.status, "EXPORT_ONLY");
    assert.equal(evidence.passed, true);
    assert.match(evidence.commands[0].error, /ENOENT/i);
    assert.equal(JSON.parse(await readFile(output, "utf8")).status, "EXPORT_ONLY");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("godot web serve detects private LAN IPv4 and certificate SANs", async () => {
  const serve = await import("../scripts/godot-web-serve.mjs");
  assert.equal(serve.isPrivateIpv4("192.168.178.144"), true);
  assert.equal(serve.isPrivateIpv4("8.8.8.8"), false);
  assert.deepEqual(
    serve.buildCertificateSubjectAltNames({ lanIp: "192.168.178.144" }),
    "DNS:localhost,IP:127.0.0.1,IP:::1,IP:192.168.178.144",
  );
  const lanIp = serve.detectLanIpv4({
    wlan0: [
      { family: "IPv4", internal: false, address: "192.168.178.144" },
      { family: "IPv6", internal: false, address: "fe80::1" },
    ],
  });
  assert.equal(lanIp, "192.168.178.144");
});

test("runtime QA preserves boot checks and grades black captures", async () => {
  const source = await read("scripts/godot-web-runtime-qa.mjs");
  assert.match(source, /GODOT_WEB_WIDTH/);
  assert.match(source, /GODOT_WEB_HEIGHT/);
  assert.match(source, /GODOT_WEB_MOBILE/);
  assert.match(source, /document\.readyState === 'complete'/);
  assert.match(source, /Runtime\.exceptionThrown/);
  assert.match(source, /SCREENSHOT_LUMINANCE/);
  assert.match(source, /EVIDENCE_TIER/);
  assert.match(source, /CAPTURE_UNRELIABLE/);
  assert.match(source, /blackCapture && !mobile/);
});

test("native smoke tools are gated and produce evidence", async () => {
  const windows = await read("scripts/godot-windows-smoke.mjs");
  const android = await read("scripts/godot-android-smoke.mjs");
  assert.match(windows, /GODOT_WINDOWS_EXE/);
  assert.match(windows, /GODOT_WINDOWS_SMOKE_TIMEOUT_MS/);
  assert.match(windows, /windows-smoke\.json/);
  assert.match(android, /GODOT_ANDROID_SMOKE_ENABLE === "1"/);
  assert.match(android, /status: "EXPORT_ONLY"/);
  assert.match(android, /adb, \["install", "-r"/);
});
