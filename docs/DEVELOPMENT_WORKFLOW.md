# Development Workflow

Verbindlicher Abschluss-Workflow für größere Abyssal-Dominion-Entwicklungsaufträge
auf Branch `main` im Repository `Broosskyy/SOH-2`.

## Repository-Layout

| Pfad | Zweck |
|------|--------|
| Source-Code, Godot, Assets | Projektroot (dieses Repository) |
| `dist/` | Lokaler Vinext-Build (gitignored, nur lokal) |
| `web-build/` | Versionierter Web-Build für GitHub (client/, server/, .openai/) |

Der Web-Build in `web-build/` wird nach jedem erfolgreichen Produktionsbuild aus
`dist/` synchronisiert und mit committed.

## Voraussetzungen

- Node.js >= 22.13.0
- Git Bash (Windows) oder Linux/macOS-Shell für `scripts/*.sh`
- `npm ci` einmalig nach Clone oder Lockfile-Änderung

## Standard-Abschluss nach größeren Änderungen

1. **Implementieren** — nur den Auftrag; keine unnötigen Refactorings.
2. **Prüfen**
   - `npm run typecheck`
   - `npm run test:architecture`
   - optional: `npm run lint`
3. **Web-Build erzeugen**
   - `npm run build`
   - Führt automatisch aus: `sync:game-data` → Vinext-Build → Artefakt-Validierung → `web-build`-Sync
4. **Smoke-Test**
   - `node --test tests/rendered-html.test.mjs`
   - oder vollständig: `npm test` (baut erneut und führt alle Tests)
5. **Git**
   - `git status` prüfen (keine Secrets, keine `node_modules`, kein `dist/`)
   - Source-, Asset-, Config- und `web-build/`-Änderungen stagen
   - Commit mit sinnvoller Message
   - `git push origin main` (kein Force Push)
6. **Verifizieren**
   - `git status` sauber
   - `git rev-parse HEAD` = `git rev-parse origin/main`

## Build-Befehle

| Befehl | Zweck |
|--------|--------|
| `npm run dev` | Lokaler Entwicklungsserver |
| `npm run build` | Produktionsbuild + Validierung + `web-build`-Sync |
| `npm run sync:web-build` | Nur `dist/` → `web-build/` (nach manuellem Build) |
| `npm run validate:artifact` | Prüft `dist/server/index.js` und Hosting-Manifest |

## Sicherheitsregeln

**Verboten:**

- `git push --force` / `--force-with-lease`
- `git reset --hard` zum Verwerfen unbekannter Änderungen
- Push bei fehlgeschlagenem kritischem Build
- automatisches Lösen komplexer Merge-Konflikte ohne Prüfung

Bei Auth-, Merge-, Build- oder Größenproblemen: stoppen und berichten.

## Fehlerbehebung

| Problem | Maßnahme |
|---------|----------|
| `vinext is unavailable` | `npm ci` ausführen |
| Build-Skripte schlagen fehl | Git Bash verwenden, nicht PowerShell direkt |
| `Missing dist artifact` bei Sync | Zuerst `npm run build` |
| Datei > 100 MB | Nicht committen; STOP und Asset-Pipeline prüfen |
