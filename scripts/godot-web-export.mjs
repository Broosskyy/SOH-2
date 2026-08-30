import { execFile } from "node:child_process";
import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { resolveGodotBinary } from "./godot-resolve-binary.mjs";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const godotProject = path.join(rootDir, "godot", "project.godot");
const exportPreset = "Web";
const webBuildDir = path.join(rootDir, "godot", "build", "web");
const viewportContractSource = path.join(rootDir, "godot", "export", "web-viewport-contract.js");
const BUILD_MARKER = "G0.5.7-RESERVED-REGION-LAYOUT";

export async function patchWebExportArtifacts() {
  const htmlPath = path.join(webBuildDir, "index.html");
  const contractDest = path.join(webBuildDir, "web-viewport-contract.js");
  await copyFile(viewportContractSource, contractDest);
  let html = await readFile(htmlPath, "utf8");
  const extraCss = `
html, body {
\twidth: 100%;
\theight: 100%;
\toverflow: hidden;
}
#canvas {
\tposition: fixed;
\tinset: 0;
\twidth: 100%;
\theight: 100%;
\tmax-width: none;
\tmax-height: none;
}
`;
  if (!html.includes("position: fixed")) {
    html = html.replace("</style>", `${extraCss}\t\t</style>`);
  }
  if (!html.includes("web-viewport-contract.js")) {
    html = html.replace(
      '<script src="index.js"></script>',
      `<script src="web-viewport-contract.js"></script>\n\t\t<script>window.AbyssalWebViewport?.install?.();</script>\n\t\t<script src="index.js"></script>`,
    );
  }
  html = html.replace(
    /<meta name="abyssal-build" content="[^"]*">/,
    `<meta name="abyssal-build" content="${BUILD_MARKER}">`,
  );
  if (!html.includes("abyssal-build")) {
    html = html.replace("<head>", `<head>\n\t\t<meta name="abyssal-build" content="${BUILD_MARKER}">`);
  }
  await writeFile(htmlPath, html, "utf8");
}

export { resolveGodotBinary } from "./godot-resolve-binary.mjs";

export async function exportGodotWeb({
  godotBinary,
  projectPath = godotProject,
  preset = exportPreset,
} = {}) {
  const resolved = godotBinary
    ? { binary: godotBinary, version: null }
    : await resolveGodotBinary();
  const resolvedBinary = resolved.binary;
  await access(projectPath);
  await mkdir(webBuildDir, { recursive: true });
  const args = ["--headless", "--path", path.dirname(projectPath), "--export-release", preset];
  const { stdout, stderr } = await execFileAsync(resolvedBinary, args, {
    cwd: rootDir,
    maxBuffer: 16 * 1024 * 1024,
  });
  await patchWebExportArtifacts();
  return { stdout, stderr };
}

async function main() {
  const result = await exportGodotWeb();
  if (result.stdout.trim()) process.stdout.write(`${result.stdout}\n`);
  if (result.stderr.trim()) process.stderr.write(`${result.stderr}\n`);
  console.log("GODOT_WEB_EXPORT_COMPLETE");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
