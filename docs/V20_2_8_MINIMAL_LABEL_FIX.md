# V20.2.8 — Revert V20.2.7 + Minimal Real-Mobile Label / HP-Bar Fix

## A. Git

| Item | Hash / Status |
|------|----------------|
| Ausgangscommit (V20.2.7) | `67c6b04` — fix: V20.2.7 real mobile labels and visual asset readiness |
| Basis (V20.2.6) | `5f069be` — fix: V20.2.6 mobile label projection and screen-space stability |
| Revert-Commit | `0382bf4` — Revert "fix: V20.2.7 real mobile labels and visual asset readiness" |
| Fix-Commit | *(see final push hash below)* |
| Push Status | `origin/main` — pushed after fix commit |

## B. Revert

V20.2.7 wurde per normalem `git revert 67c6b04` zurückgenommen (kein `reset --hard`, kein Force Push).

Nach dem Revert:

- `app/game/visuals/worldLabels.ts` entfernt (war V20.2.7-only)
- Label-Logik wieder vollständig in `app/threeRenderer.ts` (V20.2.6-Stand)
- `tests/v20.2.7-label-runtime-architecture.test.mjs` entfernt
- `docs/V20_2_7_ASSET_GAP_AUDIT.md` entfernt
- Keine Merge-Konflikte

## C. Root Cause

**Konkrete technische Ursache (V20.2.6 auf echtem Android):**

1. **Feste World-Unit-Höhen statt Screen-Space-Pixel**  
   Labels nutzten `applyLabelSpriteScale(sprite, canvas, worldHeight)` mit festen World-Höhen (Player ~20, NPC ~26–30). Auf Mobile mit hoher Kamera-Distanz und schmalem CSS-Viewport projizierten diese auf nur ~11–20 CSS-Pixel Höhe — bei einer extrem breiten Canvas-Textur (340×48, Aspect ~7:1).

2. **Aggressive GPU-Downsampling der Ultra-Wide-Textur**  
   Die gesamte Label-Composite-Textur (Name + Level + HP-Bar + Shipname) wurde auf wenige Dutzend Screen-Pixel herunterskaliert. Lineares Filtering auf Mobile-GPUs erzeugte horizontales Smearing, fragmentierte HP-Bar-Segmente und buchstabenartige Streifen — visuell als „deformiert / L-förmig / überlappend“ wahrgenommen.

3. **Kein DPR-aware Canvas-Backing**  
   Canvas intern 1× (340×48) ohne `devicePixelRatio`-Skalierung → Text und HP-Bar wurden bei DPR 2/3 weich und bei Downscaling verzerrt dargestellt, obwohl V20.2.6 bereits das Sprite-Seitenverhältnis korrekt hielt.

**Nicht die Ursache:** Parent-Ship-Scale (Sprites hängen direkt an `world`, nicht am Kraken-Mesh). DPR-Doppelanwendung im Renderer (bereits in V20.2.6 via CSS-Layout-Resize behoben).

## D. Fix

**Geänderte Dateien:**

| Datei | Änderung |
|-------|----------|
| `app/threeRenderer.ts` | Screen-space Label-Sizing + DPR-sharp Canvas |
| `tests/v20.2.6-label-projection.test.mjs` | Tests auf neuen Helper aktualisiert |
| `scripts/visual-qa-dpr-labels.mjs` | 9 Screenshots (DPR 1/2/3 × OUT/MID/IN) |
| `web-build/**` | Production-Build synchronisiert |

**Neue/korrigierte Helper (minimal, in `threeRenderer.ts`):**

- `worldUnitsPerPixel(camera, renderer, worldPos)` — CSS-Pixel → World-Units an Label-Position
- `applyLabelSpriteScreenSize(sprite, canvas, unitsPerPixel, pixelHeight)` — erhält `spriteAspect = canvasAspect`
- `labelScreenPixels(zoom, base, min, max)` — Zoom-Kompensation in CSS-Pixeln, nicht World-Units
- `createLabelCanvas(cssW, cssH)` — DPR-capped (max 2×) Backing-Store für Schärfe
- `configureLabelTexture()` — `generateMipmaps: false`, `ClampToEdgeWrapping`

**Warum minimal:**

- Ein Canvas-Sprite pro Label (Player/NPC/POI) — keine V20.2.7 Multi-Sprite-Architektur
- Kein DOM/CSS/React-Overlay
- Keine neuen Dependencies
- HP-Bar bleibt im gleichen Canvas (keine PlaneGeometry-Separation nötig nach Aspect+Screen-Space-Fix)
- Water, Kraken, Camera, HUD, Gameplay unberührt

## E. Player

| Element | Ziel-CSS-Höhe | Status |
|---------|---------------|--------|
| Name (`CAPTAIN ROWAN`) | Teil von 48px Gesamt-Label | ✅ im Composite-Canvas |
| Level (`LV 3`) | rechts in Name-Zeile | ✅ |
| Shipname (`KRAKEN'S FURY`) | untere Canvas-Zeile | ✅ |
| HP-Bar | horizontal im Canvas | ✅ kein separates Mesh |

Target: `labelScreenPixels(zoom, 48, 42, 54)` CSS-Pixel Gesamthöhe.

## F. NPC

| Element | Ziel-CSS-Höhe | Status |
|---------|---------------|--------|
| Name + Level | Teil von 36–40px Label | ✅ |
| HP-Bar | im Composite-Canvas | ✅ |

Target: `labelScreenPixels(zoom, selected?40:36, 30, 44)`.

## G. POI

**Unchanged in Struktur**, aber profitiert automatisch vom gemeinsamen `createLabelCanvas` + `applyLabelSpriteScreenSize`-Pfad für Island-Marker (`36px` base).

## H. Regression

| Bereich | Status |
|---------|--------|
| Water / Shader / Foam / Shoreline / Wake | ✅ unverändert |
| Kraken Scale / Lighting / Materials | ✅ unverändert |
| Player Ship Model | ✅ unverändert |
| NPC Ship Models | ✅ unverändert |
| Islands / Props / Loot / Monsters | ✅ unverändert |
| Camera / Zoom / Controls | ✅ unverändert |
| Combat / HUD / Minimap / Mission UI | ✅ unverändert |
| Gameplay / Save / Spawn / Navigation | ✅ unverändert |

## I. Tests

```
npm run typecheck                                    ✅ PASS
node --test tests/v20.2.6-label-projection.test.mjs  ✅ PASS (3/3)
node --test tests/cross-platform-architecture.test.mjs ✅ PASS
node --test tests/v20.2.5-presentation.test.mjs      ✅ PASS
node --test tests/geometry-visual-fix.test.mjs       ✅ PASS
node --test tests/web-artifact-assets.test.mjs       ✅ PASS
node --test tests/rendered-html.test.mjs             ✅ PASS
vinext build + sync-web-build                        ✅ PASS
```

V20.2.7-Architektur-Test (`v20.2.7-label-runtime-architecture.test.mjs`) bewusst entfernt — sicherte verworfene Multi-Sprite-Architektur ab.

## J. Automated Screenshot Result

**Pfad:** `artifacts/v20.2.8-label-qa/`

9 Screenshots: Mobile Landscape 2400×1080, DPR 1/2/3 × Zoom OUT (0.6) / MID (0.96) / IN (1.3).

**Debug-Metriken (konsistent über alle 9 Fälle):**

| Metrik | Erwartung | Ergebnis |
|--------|-----------|----------|
| `spriteAspect` | = `textureAspect` (~7.08) | ✅ immer gleich |
| `projectedScreenHeight` | ≈ `targetPixelHeight` (42–54px) | ✅ |
| `projectedScreenWidth` | ≈ height × 7.08 | ✅ |
| DPR 2/3 Canvas | 680×96 (2× backing) | ✅ |

## K. Manual Android Verification

**REAL ANDROID CHROME VERIFICATION REQUIRED**

Automated Playwright-Screenshots bestätigen korrektes Aspect-Ratio und Screen-Space-Sizing im Headless-Chromium. Sie ersetzen **nicht** den Test auf echtem Android Chrome mit Touch, Browser-Chrome, `visualViewport` und GPU-Treiber des Zielgeräts.

Bitte manuell prüfen:

- [ ] Player Name / Shipname / Level lesbar, nicht deformiert
- [ ] HP-Bar horizontal, nicht L-förmig
- [ ] NPC Name + HP stabil
- [ ] Landscape, DPR 2–3, Zoom OUT/MID/IN
