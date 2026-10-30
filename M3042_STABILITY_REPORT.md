# Abyssal Dominion – M304.2 stability and live HUD pass

Date: 2026-10-30. Branch: `rebuild/m3042-navigation-hud-stability`.
Base: M304.1 chainshot branch (not M302 main).
Entry: `scenes/classic/classic_sea_map.tscn` -> `scripts/classic/m3042_navigation_hud_stability.gd`.

## Changes committed

1. **Healthy ship frame stability**: `m3035_render_adapter.gd` no longer treats all atlas rows as orientations. Direction frames use first-row columns; frame changes for active sailing are opt-in only with `verified_sailing_row: true` and a validated matching set of frames. No unverified sailing/wreck frames at full HP. A six-degree heading deadband reduces flicker around diagonal boundaries.
2. **Captain portrait**: `m3036_unified_sea_map.gd` now shows the intact first atlas frame instead of hardcoded SeaBattles frame 4.
3. **Helm**: the active M304.2 ship motor turns the bow toward the route and gradually accelerates/decelerates. Swept collision probes reduce low-FPS coast tunneling. The moving/wake visual follows actual speed.
4. **Munitions UI**: M304.1 chainshots are now active in the start scene, beside cannonballs and harpoons. The duplicate legacy weapon cycle button is hidden; all three touch quickslots retain independent actions and ammo counts.
5. **Nonoverlapping HUD**: dedicated navigation, ammo and combat positions; narrow-display fallback hides pan arrows when needed. Player, quest, minimap, target, status and modal row placements are recalculated. Yard ship rows, chainshot restock and close no longer occupy the same space on standard landscape displays.
6. **Original game UI artwork**: new original `helm.svg`, `repair.svg`, `fire.svg` beside existing original iron ball, harpoon, and chainshot icons. These are source files, not illustration-only mockups.
7. **Godot/Android QA**: `tests/m3042_live_hud_helm_smoke.gd` checks active chain ammo, healthy sprite frames, actual touch control bounds, shipyard row positions and helm yaw. CI `m304-shipyard.yml` runs prior regressions and the new test, then produces `ABYSSAL_DOMINION_M3042_HELM_HUD.apk` if checks pass.

## Limits / known caveats
- Local gameplay simulation; the M302 server-authoritative backend is not yet connected to this M304.2 sea scene.
- Current ship sprite sheets are pre-existing temporary reference artwork for local tests. No additional third-party texture is committed in this branch. The public-facing release still needs original or appropriately licensed ship/island artwork.
- Existing M304 test graphics from the M303 branch are staged in the CI workspace only. Avoid releasing them publicly without rights verification.
- Native device playtesting, real FPS, and visual assessment **cannot be inferred** from headless regression tests. Test the resulting APK on the target Android device.
- The engine may still expose weaknesses in island avoidance and target movement requiring live gameplay captures. No claim of fully fixed navigation until actual playtest.
- The M304.2 test APK is a **temporary GitHub Actions artifact**, not a permanent signed release.
- Do not merge M304.2 into M302 main until backend separation and native visual QA are approved.

## QA acceptance criteria for next iteration
- 3 minutes of continuous sailing with quick turns and coastal approaches, no unwanted wreck frames at full hull.
- HUD and all three ammo slots tappable at 844x390, 1280x720 and actual Samsung physical landscape resolution, and while menus are opened/closed.
- Third ammo type can fire on ships, consumes stock, applies timed rigging debuff and can be restocked at shipyard.
- All three ship variants, quests, loot and camera actions still function.
- Capture a real device video including moving ship, ammo cycling, target kill, loot pickup, shipyard purchases and zoom.

## Next prioritized graphic step
Art-direct an original fleet sheet with recognizable silhouettes (brig, frigate, ghost ship), individual sprite directions, mapped healthy/damaged states, synchronized sink stages, original shoreline textures, ocean foam and a dedicated target ring. Keep original and reference resources separate.
