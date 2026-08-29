import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function collectWebArtifacts(buildDirectory) {
  const root = path.resolve(buildDirectory);
  const files = [];

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        const details = await stat(absolute);
        files.push({
          path: path.relative(root, absolute).replaceAll(path.sep, "/"),
          bytes: details.size,
          modifiedAt: details.mtime.toISOString(),
        });
      }
    }
  }

  await visit(root);
  files.sort((left, right) => left.path.localeCompare(right.path));
  return {
    buildDirectory: root,
    artifactCount: files.length,
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
    files,
  };
}

export async function writeBreakdown({
  buildDirectory = process.env.GODOT_WEB_BUILD_DIR ?? "godot/build/web",
  output = process.env.GODOT_WEB_BREAKDOWN_OUTPUT ??
    "artifacts/godot-g0.2/web-build-breakdown.json",
} = {}) {
  const breakdown = {
    generatedAt: new Date().toISOString(),
    ...(await collectWebArtifacts(buildDirectory)),
  };
  const destination = path.resolve(output);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(breakdown, null, 2)}\n`);
  console.log(`GODOT_WEB_BUILD_BREAKDOWN ${destination}`);
  console.log(JSON.stringify(breakdown));
  return breakdown;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await writeBreakdown();
}
