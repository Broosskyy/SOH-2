import { execFile } from "node:child_process";
import { constants, createReadStream, existsSync } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const defaultWebRoot = path.join(rootDir, "godot", "build", "web");
const defaultCertDir = path.join(rootDir, ".dev-certs", "godot-web");

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".pck", "application/octet-stream"],
  [".png", "image/png"],
  [".ico", "image/x-icon"],
  [".svg", "image/svg+xml"],
  [".json", "application/json"],
  [".webp", "image/webp"],
]);

const PRIVATE_IPV4_PREFIXES = [
  /^192\.168\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
];

export function isPrivateIpv4(address) {
  return PRIVATE_IPV4_PREFIXES.some((pattern) => pattern.test(address));
}

export function detectLanIpv4(interfaces = os.networkInterfaces()) {
  const candidates = [];
  for (const entries of Object.values(interfaces)) {
    if (!entries) continue;
    for (const entry of entries) {
      if (entry.family !== "IPv4" || entry.internal) continue;
      if (!isPrivateIpv4(entry.address)) continue;
      candidates.push(entry.address);
    }
  }
  return [...new Set(candidates)].sort()[0] ?? null;
}

export function resolveOpenSsl() {
  const candidates = [
    process.env.OPENSSL_PATH,
    "C:\\Program Files\\Git\\usr\\bin\\openssl.exe",
    "C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe",
    "openssl",
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (candidate.includes(path.sep) || candidate.includes("/")) {
      if (existsSync(candidate)) return candidate;
      continue;
    }
    return candidate;
  }
  return "openssl";
}

export function buildCertificateSubjectAltNames({ lanIp }) {
  const names = ["DNS:localhost", "IP:127.0.0.1", "IP:::1"];
  if (lanIp) names.push(`IP:${lanIp}`);
  return names.join(",");
}

export async function ensureDevCertificate({
  certDir = defaultCertDir,
  lanIp = detectLanIpv4(),
  openssl = resolveOpenSsl(),
} = {}) {
  await mkdir(certDir, { recursive: true });
  const keyPath = path.join(certDir, "dev-key.pem");
  const certPath = path.join(certDir, "dev-cert.pem");
  const metaPath = path.join(certDir, "dev-meta.json");
  const subjectAltName = buildCertificateSubjectAltNames({ lanIp });
  const meta = JSON.stringify({ lanIp, subjectAltName }, null, 2);

  if (existsSync(keyPath) && existsSync(certPath) && existsSync(metaPath)) {
    const previous = JSON.parse(await readFile(metaPath, "utf8"));
    if (previous.lanIp === lanIp && previous.subjectAltName === subjectAltName) {
      return { keyPath, certPath, lanIp, subjectAltName, regenerated: false };
    }
  }

  const configPath = path.join(certDir, "openssl.cnf");
  const config = [
    "[req]",
    "distinguished_name=req_distinguished_name",
    "x509_extensions=v3_req",
    "prompt=no",
    "",
    "[req_distinguished_name]",
    "CN=Abyssal Dominion Dev",
    "",
    "[v3_req]",
    `subjectAltName=${subjectAltName}`,
    "",
  ].join("\n");
  await writeFile(configPath, config, "utf8");

  await execFileAsync(openssl, [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-sha256",
    "-days",
    "825",
    "-nodes",
    "-keyout",
    keyPath,
    "-out",
    certPath,
    "-config",
    configPath,
    "-extensions",
    "v3_req",
  ]);

  await writeFile(metaPath, meta, "utf8");
  return { keyPath, certPath, lanIp, subjectAltName, regenerated: true };
}

function resolveFilePath(webRoot, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const relative = normalized === "/" || normalized === "\\"
    ? "index.html"
    : normalized.replace(/^[/\\]+/, "");
  const absolute = path.join(webRoot, relative);
  if (!absolute.startsWith(webRoot)) return null;
  return absolute;
}

export function createStaticHandler(webRoot) {
  return async function handleRequest(request, response) {
    const url = new URL(request.url ?? "/", "http://localhost");
    const filePath = resolveFilePath(webRoot, decodeURIComponent(url.pathname));
    if (!filePath) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    try {
      await access(filePath, constants.F_OK);
      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": MIME_TYPES.get(extension) ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  };
}

export async function startGodotWebServers({
  webRoot = defaultWebRoot,
  certDir = defaultCertDir,
  httpHost = process.env.GODOT_WEB_HTTP_HOST ?? "127.0.0.1",
  httpPort = Number.parseInt(process.env.GODOT_WEB_HTTP_PORT ?? "8061", 10),
  httpsHost = process.env.GODOT_WEB_HTTPS_HOST ?? "0.0.0.0",
  httpsPort = Number.parseInt(process.env.GODOT_WEB_HTTPS_PORT ?? "8062", 10),
} = {}) {
  await access(webRoot, constants.R_OK);
  const lanIp = detectLanIpv4();
  const certificate = await ensureDevCertificate({ certDir, lanIp });
  const handler = createStaticHandler(webRoot);
  const [key, cert] = await Promise.all([
    readFile(certificate.keyPath),
    readFile(certificate.certPath),
  ]);

  const httpServer = createHttpServer(handler);
  const httpsServer = createHttpsServer({ key, cert }, handler);

  await Promise.all([
    new Promise((resolve, reject) => {
      httpServer.once("error", reject);
      httpServer.listen(httpPort, httpHost, resolve);
    }),
    new Promise((resolve, reject) => {
      httpsServer.once("error", reject);
      httpsServer.listen(httpsPort, httpsHost, resolve);
    }),
  ]);

  const urls = {
    desktopHttp: `http://${httpHost === "0.0.0.0" ? "127.0.0.1" : httpHost}:${httpPort}/index.html`,
    localHttps: `https://127.0.0.1:${httpsPort}/index.html`,
    mobileHttps: lanIp
      ? `https://${lanIp}:${httpsPort}/index.html`
      : null,
  };

  return {
    httpServer,
    httpsServer,
    lanIp,
    certificate,
    urls,
    async close() {
      await Promise.all([
        new Promise((resolve) => httpServer.close(resolve)),
        new Promise((resolve) => httpsServer.close(resolve)),
      ]);
    },
  };
}

async function main() {
  const servers = await startGodotWebServers();
  const { urls, lanIp, certificate } = servers;
  console.log("GODOT_WEB_SERVE_READY");
  console.log(`DESKTOP_HTTP_URL ${urls.desktopHttp}`);
  console.log(`LOCAL_HTTPS_URL ${urls.localHttps}`);
  if (urls.mobileHttps) {
    console.log(`MOBILE_HTTPS_URL ${urls.mobileHttps}`);
  } else {
    console.log("MOBILE_HTTPS_URL unavailable (no private IPv4 interface detected)");
  }
  console.log(`LAN_IP ${lanIp ?? "none"}`);
  console.log(`CERT_SAN ${certificate.subjectAltName}`);
  console.log(`CERT_REGENERATED ${certificate.regenerated}`);
  console.log(`WEB_ROOT ${defaultWebRoot}`);
  console.log("Press Ctrl+C to stop.");

  const shutdown = async () => {
    await servers.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
