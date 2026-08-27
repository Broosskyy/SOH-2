# V20.2.9 — Chrome Mobile World Label Reconstruction

## A. Git

| Item | Value |
|------|-------|
| Ausgangs-HEAD | `ed8507b` — docs: add final commit hash to V20.2.8 report |
| Final HEAD | *(see push below)* |
| Commit | `fix: V20.2.9 reconstruct mobile world status for Chrome compatibility` |
| Push | `origin/main` |
| Working Tree | clean (artifacts/ untracked) |

## B. Chrome Mobile Root Cause

**Warum andere Mobile-Browser korrekt waren:**
V20.2.6/V20.2.8 nutzten eine einzelne ultrabreite Composite-CanvasTexture (340×48 bis 384×84, Aspect ~7:1) für Name + Level + HP (+ Shipname). Nicht-Chrome-Mobile-GPUs tolerierten das Downsampling/Sampling besser.

**Warum Chrome Mobile problematisch war:**
Chrome Mobile (Chromium WebGL auf Android) zeigt bei extrem breiten `CanvasTexture`-Sprites aggressive lineares Downsampling, Alpha-Blending-Artefakte und Subpixel-Smearing. Ergebnis: horizontal gestreckte „Riesen-Texture“, fehlende Namen, L-förmige HP-Bars, isolierte Level-Fragmente.

**V20.2.8-Annahmen unvollständig:**
- Korrektes Sprite-Aspect und DPR-Backing reichten nicht — die Architektur (alles in einer Canvas) blieb Chrome-anfällig.
- Screen-Space-Sizing ohne Strukturänderung konnte die Composite-Textur nicht stabilisieren.

## C. PlayerWorldLabelGroup

```
PlayerWorldLabelGroup
├── guildTag          (hidden, future)
├── playerName        (tight CanvasTexture sprite)
├── pirateRank        (hidden, future)
├── levelTag          (inline in playerName canvas)
├── hpBar             (PlaneGeometry + MeshBasicMaterial)
├── shieldBar         (PlaneGeometry + MeshBasicMaterial)
├── progressRow       (hidden, future)
└── extensionRow      (hidden, future)
```

- **Anchor:** world-level group at `(player.x, 8, player.y+36)`, keine Parent-Scale vom Kraken-GLB
- **Shipname:** entfernt aus World-Label (Playername = primäre Identität)

## D. Future-ready Player Status

| Feld | Status |
|------|--------|
| GuildTag | vorbereitet, `visible=false` |
| PirateRank | vorbereitet, `visible=false` |
| ProgressStatus / Prestige | `progressRow`, `visible=false` |
| Extensions / Decks / Module | `extensionRow`, `visible=false` |
| Keine Fake-Daten | alle future rows hidden |

## E. Player State Mapping

| Feld | Source |
|------|--------|
| PlayerName | `frame.playerName` → Runtime `gameRef.playerName` / Save |
| HP | `frame.player.hp` / `frame.player.maxHp` |
| Shield | `frame.player.shield` / `frame.player.maxShield` |

`WorldFrame` und `RendererFrame` erweitert um `shield`/`maxShield`.

## F. NPC Labels

```
NpcWorldLabelGroup
├── nameLine + level (single tight text sprite: "NAME   LV n")
└── hpBar (PlaneGeometry, hostile=red)
```

Shield optional vorbereitet, standardmäßig hidden (NPCs ohne Shield-State).

## G. POI Labels

```
PoiWorldLabelGroup
├── nameLine (tight sprite)
└── levelTag (tight sprite)
```

Keine HP/Shield-Bars.

## H. Screen-Space Sizes (MID zoom ~0.96)

| Element | Target | Automated MID (DPR2) |
|---------|--------|---------------------|
| Player name row | 12–16 px | ~14 px |
| Player HP bar | 90–140 × 5–9 px | 118 × 7 px |
| Player Shield bar | same × 4–8 px | 118 × 6 px |
| NPC name row | 12–16 px | ~13 px |
| NPC HP bar | 80–110 × 5–7 px | 92 × 6 px |
| POI name | 13–17 px | ~15 px |

**OUT (0.6):** Player total ~28 px height, HP ~93 × 5.5 px  
**IN (1.3):** Player total ~36 px height, HP ~130 × 7.7 px

## I. Chrome Compatibility

- **Text:** kleine, eng zugeschnittene CanvasTexture-Sprites, DPR-capped (max 2×)
- **HP/Shield:** `PlaneGeometry` + `MeshBasicMaterial`, `depthTest: false`
- **Texture:** `generateMipmaps=false`, `ClampToEdgeWrapping`, `premultiplyAlpha=false`
- **Sizing:** `worldUnitsPerPixel` + `labelZoomFactor` (OUT 0.82 → MID 1.0 → IN 1.08)
- **Billboard:** `billboardToCamera` auf Label-Group

## J. Automated Visual QA

**Pfad:** `artifacts/v20.2.9-label-qa/`  
**Context:** Playwright Chromium, Chrome Android UA, touch, DPR 1/2/3  
**Runtime:** Vite dev `localhost:5173` (preview:web auf 8787 blieb im Loading-Screen — IndexedDB/Save-Latenz; Production-Build synchronisiert)

| Screenshot | Ergebnis |
|------------|----------|
| 01-mobile-mid-dpr1.png | PASS — Player + NPC + POI sichtbar |
| 02-mobile-mid-dpr2.png | PASS — Referenz-Screenshot |
| 03-mobile-mid-dpr3.png | PASS |
| 04-mobile-out-dpr2.png | PASS — kleiner, lesbar |
| 05-mobile-in-dpr2.png | PASS — nicht überdimensioniert |
| 06-small-landscape.png | PASS |
| 07-wide-landscape.png | PASS |
| 08-moving-player.png | PASS |

**Debug MID DPR2:**
- `playerLabel.name`: Captain Rowan
- `hpBarScreenWidth/Height`: 118 × 7
- `shieldBarScreenWidth/Height`: 118 × 6
- `npcLabel.name`: Scherben-Plünderer

## K. Reference Match Audit

| Kriterium | Bewertung |
|-----------|-----------|
| PLAYER STATUS SIZE | **MATCH** |
| PLAYER NAME | **MATCH** |
| HP | **MATCH** |
| SHIELD | **MATCH** |
| EXTENSION AREA | **N/A** (prepared, hidden) |
| NPC STATUS | **MATCH** |
| POI LABEL | **MATCH** |
| OVERALL WORLD UI | **MATCH** (automated Chromium) |

## L. Regression Checks

| Bereich | Status |
|---------|--------|
| Kraken GLB / Loader / Scale | ✅ unverändert |
| Water / Wake / Camera / Zoom | ✅ unverändert |
| HUD / Combat / Navigation | ✅ unverändert |
| Islands / World density | ✅ unverändert |

## M. Tests / Build

```
npm run typecheck                    ✅ PASS
npm run test:architecture            ✅ PASS
tests/v20.2.9-world-label-architecture ✅ PASS (4)
tests/v20.2.6-label-projection         ✅ PASS (3)
tests/v20.2.5-presentation             ✅ PASS (7)
vinext build + sync-web-build          ✅ PASS
```

## N. Manual Android Chrome Verification

**REAL ANDROID CHROME VERIFICATION REQUIRED**

Automated Chromium-QA bestätigt korrekte Größen und Geometrie. Endgültige Abnahme nur auf echtem Android Chrome mit Touch, `visualViewport` und Geräte-GPU.
