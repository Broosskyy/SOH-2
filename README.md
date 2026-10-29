# Abyssal Dominion — M303.5 Godot SeaBattles Reference Core

**Current branch**: `rebuild/classic-seafight-m303` (separate from unchanged M302 `main`).

**Boot:** `scenes/classic/classic_sea_map.tscn` → `scripts/classic/m3035_seabattles_core.gd`, using Godot 4.7.2.

- Native fullscreen / sensor landscape (Android), independent responsive HUD and touch controls.
- Local sea-chart prototype: sailing/shore avoidance, NPC/monster selection, cannon/harpoon, repairs and loot.
- Separate rendering adapter: original replaceable 16-dir placeholder sprites, optional **local** 4×2 SeaBattles PNG texture atlases, existing GLB 3D models; in-game graphics switch.
- Compatible optional local texture slots for islands and sea; fallback visuals always work.
- Offline Unity Texture2D importer from user's APK collection: `tools/import_seabattles_local.py`. It only writes to `assets/classic/private_seabattles/` which is excluded from Git.
- **Important status:** APK graphic conversion and Godot native Android/Web runtime are **NOT TESTED** in this branch. Public GitHub does not contain third-party APK original graphics; no playable release APK was produced.

Full integration and QA report: [M303_5_VISUAL_CORE_REPORT.md](M303_5_VISUAL_CORE_REPORT.md).

---

## Earlier M303 / M302 notes

# Abyssal Dominion — Classic-Seafight-Rebuild M303.1

**Aktive Entwicklung:** `rebuild/classic-seafight-m303`. Der M302-Bestand auf `main` bleibt unverändert.

**Grundkern-Code committed:** Seekarte (klassische schräge Kamera), austauschbare 16-Richtungs-Schiffsgrafiken, Insel-Navigation mit Ausweichwegpunkten, Wasser-Tap-Steuerung, Zielwahl, Kanonen-/Harpunenmodus, NPC- und Monster-Ziele, lokale Treffer/Beute/Gold, Reparatur und Respawn. Dies sind **rein lokale Testsysteme**, keine Online-MMO-Features.

- Einstieg: `scenes/classic/classic_sea_map.tscn`
- Entwicklungs-/QA-Bericht: [M303_1_CORE_REPORT.md](M303_1_CORE_REPORT.md)
- Produkt-/Abnahmeplan: [CLASSIC_REBUILD_M303.md](CLASSIC_REBUILD_M303.md)
- Grafik- und Urheberrecherche: [ASSET_PROVENANCE_M303.md](ASSET_PROVENANCE_M303.md)
- Featurevergleich der Referenzspiele: [M303_CLONE_REFERENCE_MATRIX.md](M303_CLONE_REFERENCE_MATRIX.md)
- **Keine native Godot-, Android- oder Browser-QA durchgeführt. Kein APK/Web-Build erzeugt.**

---

## Frühere M303-Grundlagen und M302-Archiv

# Abyssal Dominion — Classic-Seafight-Rebuild M303

**Neuer eigenständiger Neustart-Branch:** `rebuild/classic-seafight-m303`. Der unveränderte alte M302-Stand bleibt auf `main` erhalten.

- Startszene im Branch: `scenes/classic/classic_sea_map.tscn` (lokaler Grafik-/Steuerungsprototyp, keine echte Onlinewelt).
- Basis-M303: eigene schräge Seekarten-Kamera, vorhandene Platzhalter-Schiffs-/Insel-GLBs, Wasser-Shader, Click-/Tap-to-Sail, Minimap, NPC-Auswahl und **ausdrücklich lokale** Kanonen-Testsimulation.
- Produkt-/Abnahmeplan: [CLASSIC_REBUILD_M303.md](CLASSIC_REBUILD_M303.md).
- Bild-/Urheber-/Assetrecherche: [ASSET_PROVENANCE_M303.md](ASSET_PROVENANCE_M303.md).
- **Status:** Code in GitHub committed, native Godot-/Browser-/Android-QA noch nicht durchgeführt; kein Release und keine APK.

---

## Archivierter M302-Verlauf (frühere README)

# Abyssal Dominion — M302 archival notes

Current source: M302 / 0.302.0 / build 302. Master basis: V3.8.

## M301
Server-only SQLite domain for war-gated attacking/attackable guild towers, scheduled Halloween NPC combat, collectible pumpkins, harpoon-only pumpkin wrecks, event-NPC-specific pumpkin cannon ammo and boss top-damage/last-hit pending rewards. Godot world adds distinct non-authoritative visual previews and one unframed shared pumpkin-ammo icon. LOCAL_DEVELOPMENT event claims are fail-closed outside local preview. No connected backend or live deployment exists: pending rewards require authenticated M266 settlement, native QA remains NOT_EVALUATED. See `M301_SERVER_SLICE_REPORT.md`.

## M300
Guild Islands remain map-level-2 local previews with five separate tower roles; enemy/war previews now show visual-only warning beacons. Halloween portal, wreck, phase fleets and guild decoration remain a local event prototype. Decoration is now scoped to the current sector and removed when Halloween ends or the layer is rebuilt. Neither preview adds server damage, durable rewards or ownership. One complete GLB remains the initial model rule for every ship; see `M300_PRODUCTION_REPORT.md` and `data/m300_guild_halloween_closure_contract.json`. Native QA remains NOT_EVALUATED.

## M299
An isolated oblique LOCAL_DEVELOPMENT QA scene now shows all eight complete starter/early-NPC ships at once, with responsive desktop/portrait layout and selectable sailing, impact and sinking demos. The UI explicitly leaves native QA NOT_EVALUATED; its scene-tagged preview cannot become a server event or game reward. M287 verified motion-event handoff and M285 preview-vs-server precedence are hardened. Open `scenes/qa/m299_ship_animation_visual_qa.tscn` in Godot for first native inspection; see `M299_PRODUCTION_REPORT.md` and `data/m299_ship_animation_visual_qa_matrix.json`.

## M298
The three starter and five early NPC placeholder ships gain gentle animation of the complete visual model (heave/pitch/roll/turn heel and M286 verified staged sinking) using M287 motion presentation and M285 confirmed reactions. The ship motor, collision, navigation and combat remain unchanged; replacement GLBs and UI previews are untouched. Reduced motion/mobile budgets and data profiles are included. A BROKEN shield state no longer generates an unconfirmed impact flash. See `M298_PRODUCTION_REPORT.md`, `data/m298_ship_visual_animation_contract.json` and `scripts/visual/m298_ship_visual_animation_rig.gd`.

## M297
The remaining early Scout and Heavy NPC ships now have separate complete GLB placeholders with baked structural silhouettes. All five early NPC slots resolve to distinct replaceable complete models instead of applying runtime structural ship parts to these active assets. Collision, movement, combat and rewards remain unchanged. See `M297_PRODUCTION_REPORT.md`, `data/m297_early_npc_complete_model_contract.json` and `tools/m297_build_remaining_npc_glbs.py`.

## M296
The friendly coastal sloop and NPC gunship now have individually replaceable, complete one-node/one-mesh GLB placeholders. The gunship broadside/deck details and coastal aft deck are baked into their own models; runtime structural decorators are skipped for these exact GLBs. No movement, combat or economy truth is changed. See `M296_PRODUCTION_REPORT.md`, `data/m296_complete_npc_models_contract.json` and `tools/m296_build_npc_glbs.py`.

## M295
NPC Scout and Raider no longer use identical complete GLBs. The Raider now has a separately replaceable complete single-node/single-mesh GLB placeholder with a wider silhouette and dark/crimson palette; its old runtime hull/sail decorator is bypassed for this model. Gameplay stats, collision, controls and server truth are unchanged. See `M295_PRODUCTION_REPORT.md`, `data/m295_raider_single_model_placeholder_contract.json` and `tools/m295_build_raider_glb.py`.

## M294
Tap-to-Sail route observation distinguishes water-tap intent from locally observed ship movement, arrival and interruption. The Command Deck exposes that sequence without granting server movement truth or native QA. Existing course marker, clean-room naval readability and complete individual ship GLB placeholders remain in use. See `M294_PRODUCTION_REPORT.md` and `data/m294_sailing_observation_contract.json`.

## M293
Port proximity events now apply only to the player's ship. Passive first-sortie world guidance points only to Haven's Reach for home/return and yields to tracked quests, selected combat targets, open menus/charts and sinking. Stale or sunk enemy placeholders are ignored; the same replaceable world beacon and complete individual ship GLBs remain in use. See `M293_PRODUCTION_REPORT.md` and `data/m293_world_guidance_priority_contract.json`.

## M292
First-sortie guidance now uses the existing mission panel when no quest is selected; a tracked quest remains primary, with only a width-safe secondary counter. Local observations and server receipts are counted separately in the Command Deck. Existing single-GLB ship placeholders and the external world beacon are reused, not modularized. See `M292_PRODUCTION_REPORT.md` and `data/m292_sortie_hud_guidance_contract.json`.

## M291
First Sea Sortie Evidence Causality: an actual Haven's Reach undock or harbor exit observes departure; water-tap intent alone does not. A genuine return-to-harbor interaction can close the ten-step regular journey without forcing the player to sink. Defeat/respawn stay optional, separately tracked native-QA cases. Fire/repair/navigation intent remains observation only; no fabricated hits, recovery, travel or native PASS. Existing one-piece GLB ship placeholders and the external single world beacon are reused. See `M291_PRODUCTION_REPORT.md` and `data/m291_sortie_causality_contract.json`.

## M290
First Sea Sortie Runtime Integration / Gameplay Event Binding / Visible Guidance / Stable Single-Model Placeholder Slots. M290 binds the M289 12-stage journey to passive gameplay observations, adds one restrained world-guidance placeholder and shows compact sortie progress inside the existing mission area. It never drives navigation, target selection, combat, loot, progression, respawn or release approval. Seafight and Battle of Sea remain clean-room genre/UX references only.

Initial ship-production lock: **one ship equals one complete individual 3D/GLB model**. Hull, bow, stern, deck, masts, sails and characteristic design parts stay together. M285–M290 sockets and QA hooks host external presentation/integration layers only; they are not a modular ship-construction system. True modular ships remain deferred.

See `M289_DEEP_AUDIT_FOR_M290.md`, `M290_PRODUCTION_REPORT.md` and `START_HERE_CURSOR.md`.
