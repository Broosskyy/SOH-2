# V20 Test Report

Date: 2026-08-26  
Baseline: V19 commit `43895e9`  
Target: Web, Android browser, iOS browser; Godot-compatible asset data

## Automated results

| Check | Result | Notes |
|---|---|---|
| `npm ci --ignore-scripts --cache /tmp/abyssal-v20-npm-cache --prefer-offline` | PASS | 524 packages installed from lockfile |
| TypeScript `tsc --noEmit` | PASS | no diagnostics |
| ESLint | PASS | no diagnostics |
| Architecture tests | PASS | 5/5 tests |
| Production build | PASS | Vinext/Vite 5 build stages completed |
| Hosting artifact validation | PASS | ESM Worker export and hosting manifest present |
| GLB validation | PASS | all three files identified as glTF binary version 2; Web and Godot sizes match |
| Git whitespace validation | PASS | `git diff --check` clean |

The production artifact is 7.9 MB unpacked. Vite reports a non-blocking warning for a client chunk above 500 KB; V21 should split the Three.js renderer/import path further.

## Browser QA

The agent preview loaded the title screen, HUD and gameplay simulation. The start flow, target cycling, ready-fire state, incoming combat damage, map panel and level-gated map entries were exercised successfully. The simulation continued updating hull/shield state and target range.

The provided cloud Chrome runtime has WebGL disabled (`GL_RENDERER = Disabled`), so it could not render or visually inspect the Three.js canvas. The application correctly surfaced its renderer fallback error. This environment limitation prevents honest screenshot-level verification of ocean shading, GLB scale, VFX appearance and FPS in that browser; it is not a production-build error.

## Input coverage

| Input | Coverage |
|---|---|
| Mouse wheel / plus / minus | code path and bounds verified by TypeScript/tests |
| One-pointer click/touch navigation | handler retained and gesture-separated |
| Enemy selection / fire | browser interaction passed |
| Two-finger pinch | implementation and architecture assertion passed; physical multi-touch device pending |
| Camera joystick | existing pan-only simulation preserved |

## Gameplay regression coverage

Combat state, targeting and damage ran in browser preview. Map UI and travel gating loaded. Save/load, loot, respawn, full map travel, projectile hit/miss visuals and long-session enemy AI remain structurally unchanged or covered by the successful production build, but were not all completed as full manual end-to-end scenarios in the WebGL-disabled cloud runtime.

## Required device follow-up

Before tagging V20 final art, run one 10-minute session on a real midrange Android device and one iOS Safari device. Confirm pinch behavior, GLB scale/orientation, shore foam boundaries, miss splashes, respawn/save reload and at least 30 FPS on MEDIUM. Run desktop Chrome/Firefox with WebGL enabled at 60 FPS target.

## Known open points

- Island bodies still use authored sprite art in a 3D presentation shell.
- Sovereign Frigate GLBs prove the modular/LOD pipeline but need a dedicated artist pass.
- Reflections are intentionally approximate; no expensive planar or SSR reflection is used.
- Physical-device GPU performance and multi-touch remain pending because the available cloud browser exposes neither WebGL nor device emulation.
