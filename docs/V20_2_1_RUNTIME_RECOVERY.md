# V20.2.1 — GPT/OpenAI Web Runtime Recovery

## A. Runtime-Architektur

### GPT/OpenAI Sites Flow (Source of Truth)

OpenAI Sites deploys this project as a **Cloudflare Worker** with a static **ASSETS** binding.
The repository does not ship a separate “static-only” site format.

| Schritt | Befehl / Artefakt | Ergebnis |
|--------|-------------------|----------|
| Dev (HMR) | `npm run dev` | Vite + `@cloudflare/vite-plugin` + `sites()` Plugin |
| Produktionsbuild | `npm run build` | `scripts/build-verified.sh` |
| Vinext-Build | `vinext build` | `dist/client/`, `dist/server/`, `dist/.openai/` |
| Validierung | `scripts/validate-artifact.sh` | Worker `default.fetch`, `hosting.json` |
| GitHub-Spiegel | `scripts/sync-web-build.mjs` | `web-build/` = Kopie von `dist/{client,server,.openai}` |

### Entry Points

| Pfad | Rolle |
|------|--------|
| `worker/index.ts` | Cloudflare Worker-Einstieg (Image-Proxy + App-Handler) |
| `dist/server/index.js` | Vinext RSC/SSR Worker-Bundle (`default.fetch`) |
| `dist/server/wrangler.json` | Wrangler-Konfiguration (`main`, `assets.directory`) |
| `.openai/hosting.json` | Sites-Manifest (`project_id`, D1/R2 null) |
| `build/sites-vite-plugin.ts` | Dev-Auth-Middleware; kopiert Manifest nach `dist/.openai/` |
| `vite.config.ts` | `vinext()`, `sites()`, Cloudflare-Plugin |
| `preview-wrangler.json` | Root Wrangler-Config für lokales Preview (ohne Cache in `dist/server/`) |

### `web-build/` — was es ist

`web-build/` ist **kein** eigenständiges Runtime-Format und **kein** beliebiger Static-Server-Root.
Es ist ein versionierter Spiegel des deploy-fähigen Artefakts:

- `web-build/client/` — gehashte JS/CSS/Assets (ASSETS-Binding)
- `web-build/server/` — Worker (`index.js`, `wrangler.json`, SSR-Module)
- `web-build/.openai/hosting.json` — Sites-Manifest

Deploy/Preview erwartet immer **Worker + ASSETS**, nicht nur `client/`.

### Was nur in der OpenAI-Sites-Runtime existiert

- Plattform-Hosting mit `project_id` aus `hosting.json`
- Automatische `oai-authenticated-user-*` Header (lokal simuliert durch `sites()` Plugin in Dev)
- Cloudflare-Plattform-Bindings (ASSETS, optional D1/R2 — hier null)

Lokale Parität ist möglich über **Wrangler `dev`** mit `dist/server/wrangler.json` (Miniflare Worker + Assets).

---

## B. Ursache „Seekarten werden geladen …“

### UI-Gate

```616:617:app/page.tsx
    if (!ready)
        return <main className="loading"><span>⚓</span><b>ABYSSAL DOMINION</b><small>Seekarten werden geladen …</small></main>;
```

`ready` wird gesetzt nach `loadSave()` in `useEffect` (Zeile 79). IndexedDB-Fehler führen zu `freshSave()` — der Hang entsteht **nicht** durch fehlgeschlagenes Save-Loading.

### Diagnose

| Symptom | Ursache | Typ |
|---------|---------|-----|
| SSR-HTML zeigt Loading | Normal — Client muss hydratisieren | erwartet |
| `vinext start` auf **Windows**, Port 3000 | `/assets/*.js` → **404** | **Runtime/Hosting** |
| `preview:web` (Wrangler) | `/assets/*.js` → **200**, Client kann booten | korrekt |

**Root cause (Windows + `npm run start`):** Vinext `0.0.50` `StaticFileCache` indexiert Pfade mit Windows-Backslashes (`/assets\index.js`), HTML referenziert Forward-Slashes (`/assets/index.js`). Lookup schlägt fehl → RSC-Handler liefert 404 → kein Client-JS → permanentes Loading.

**Kein Game-Code-Bug.** Keine Änderung an Loader, Kraken, Visuals oder Gameplay.

---

## C. Lokaler korrekter Testweg

| Zweck | Befehl | URL | Runtime |
|-------|--------|-----|---------|
| Entwicklung (HMR) | `npm run dev` | Vite-Default (meist 5173) | Vite Dev + Sites-Plugin |
| **Sites/Production-Preview** | `npm run preview:web` | `http://127.0.0.1:8787` | Wrangler + Worker + ASSETS |
| Node-Prod-Server | `npm run start` | `http://localhost:3000` | Vinext Node (Linux/macOS ok; **Windows: Asset-Bug**) |

Optional: `PORT=3000 npm run preview:web` für Port 3000.

**Windows:** `preview:web` statt `start` für Production-ähnlichen Test.

---

## D. GPT/OpenAI-Web-Build erzeugen

```bash
npm run build
```

Erzeugt:

1. `dist/client/` — Client-Bundle + public Assets
2. `dist/server/index.js` — Worker
3. `dist/.openai/hosting.json` — Sites-Manifest
4. `web-build/` — synchroner Git-Spiegel

Validierung: `npm run validate:artifact`

---

## E. Änderungen in V20.2.1

| Datei | Warum |
|-------|--------|
| `scripts/run-with-sites-env.mjs` | Cross-Platform Sites-Runtime-Env (Windows + Bash) |
| `scripts/preview-web.mjs` | Wrangler-Preview = Sites-Worker-Parität |
| `package.json` | `dev`/`start` Windows-fähig; `preview:web` neu |
| `scripts/clean-wrangler-dist-cache.mjs` | Entfernt `dist/server/.wrangler` vor Build |
| `preview-wrangler.json` | Preview-Config außerhalb von `dist/server/` |
| `scripts/build-verified.sh` | Ruft Cache-Cleanup vor Vinext-Build |
| `tests/web-artifact-assets.test.mjs` | SSR-HTML ↔ `dist/client` Bundle-Konsistenz |
| `docs/V20_2_1_RUNTIME_RECOVERY.md` | Dieses Dokument |
| `docs/DEVELOPMENT_WORKFLOW.md` | Preview-Befehle ergänzt |

Keine Gameplay-, Visual- oder Loader-Änderungen.

---

## F. Verifikation

- `npm run typecheck`
- `npm run test:architecture`
- `npm run build`
- `node --test tests/rendered-html.test.mjs tests/web-artifact-assets.test.mjs`
- `npm run preview:web` → Browser: Loading verschwindet, Start-Screen erscheint

---

## G. Checkliste (Auftrag)

- [x] GPT/OpenAI-Sites-Build = `npm run build` → `dist/` + `web-build/`
- [x] Runtime = Cloudflare Worker + ASSETS (`dist/server/wrangler.json`)
- [x] `web-build/` vollständig nach Sync
- [x] V20.2 kompatibel (kein Game-Code geändert)
- [x] localhost:3000 Hang = falscher lokaler Runtime-Pfad (vinext Node auf Windows)
- [x] Hosting/Runtime-Problem, kein Game-Bug
- [x] Lokaler Test = `npm run preview:web`
- [x] Build = `npm run build`
