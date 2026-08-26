import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const clientDir = join(root, "dist/client");

test("Sites SSR HTML references a client bundle that exists in dist/client", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not used", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  const assetMatch =
    html.match(/import\(["'](\/assets\/[^"']+\.js)["']\)/) ??
    html.match(/href=["'](\/assets\/index-[^"']+\.js)["']/);
  assert.ok(assetMatch, "expected a client entry /assets/*.js reference in SSR HTML");

  const assetPath = assetMatch[1];
  const assetFile = join(clientDir, assetPath.replace(/^\/+/, ""));
  await access(assetFile);
});

test("dist/client serves hashed asset bytes for ASSETS binding simulation", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-assets`);
  const { default: worker } = await import(workerUrl.href);

  const htmlResponse = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not used", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await htmlResponse.text();
  const assetMatch =
    html.match(/import\(["'](\/assets\/[^"']+\.js)["']\)/) ??
    html.match(/href=["'](\/assets\/index-[^"']+\.js)["']/);
  assert.ok(assetMatch);

  const assetPath = assetMatch[1];
  const assetFile = join(clientDir, assetPath.replace(/^\/+/, ""));
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile(assetFile);
  assert.ok(bytes.byteLength > 0, `expected non-empty bundle at ${assetPath}`);
});
