import { cp, mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const distRoot = resolve(root, "dist");
const webBuildRoot = resolve(root, "web-build");

const requiredDistPaths = [
  "server/index.js",
  "server/wrangler.json",
  ".openai/hosting.json",
  "client/assets",
];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

for (const relativePath of requiredDistPaths) {
  const absolutePath = resolve(distRoot, relativePath);
  if (!(await exists(absolutePath))) {
    console.error(`Missing dist artifact: dist/${relativePath}`);
    console.error("Run npm run build before syncing the web-build output.");
    process.exit(66);
  }
}

await rm(webBuildRoot, { recursive: true, force: true });
await mkdir(webBuildRoot, { recursive: true });

for (const segment of ["client", "server", ".openai"]) {
  const source = resolve(distRoot, segment);
  if (await exists(source)) {
    await cp(source, resolve(webBuildRoot, segment), { recursive: true });
  }
}

const viteCache = resolve(webBuildRoot, "client", ".vite");
if (await exists(viteCache)) {
  await rm(viteCache, { recursive: true, force: true });
}
const serverViteCache = resolve(webBuildRoot, "server", ".vite");
if (await exists(serverViteCache)) {
  await rm(serverViteCache, { recursive: true, force: true });
}

console.log(`Synced web-build from dist/ → web-build/ (${webBuildRoot})`);
