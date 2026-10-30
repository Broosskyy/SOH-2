# Abyssal Dominion — M304.3 Original Fleet & Ocean

Date: 2026-10-30. Separate integration branch: `rebuild/m3043-original-fleet-ocean`.
Base: last verified M304.2 code commit `5d9f9b6`, documentation-only head `43a01e3`. M302 `main` remains unchanged.

## Implemented (source code committed)

- **New original 3D vessel system:** `scripts/classic/m3043_original_vessel.gd`.
  - Independent lightweight procedural mesh silhouettes for brig, frigate, ghost, raider, and sloop.
  - Tapered hull, side rails, decks, cabin, cannon barrels, yardarms, cloth sails, rigging, bowsprit, pennant.
  - Gentle visual heave and roll. Parent ship node still owns movement and collisions.
  - `set_hull_ratio()` controls damage-only meshes. 100% HP cannot select an unverified wreck atlas row.
  - No third-party ship meshes/textures are included in this original 3D subsystem.
- **Game integration:** `scripts/classic/m3043_original_fleet_ocean.gd`; entry scene now runs this script. Fresh sessions default to original 3D mode; existing explicit test mode meta stays respected. The original 3D switch is separate from the previously established SeaBattles/SeaOfBones two-pack toggle.
- **Visual world:** original time-animated water shader, original captain ship emblem `assets/classic/original_ui/captain_ship.svg`. This is actual Godot shader and scene source, not a mockup.
- **State continuity:** 3D ship class changes use the same gameplay ship node and maintain active combat state, ammo, gold and course. NPC health and player hull ratio update visible damage state.
- **Old gameplay systems:** M304.2 HUD, active 3-way ammo and chainshot, quests, ports, NPCs and loot remain in the same scene.
- **QA:** `tests/m3043_original_fleet_smoke.gd` verifies actual game creation, original mesh groups, damage ratio transitions, class buy, original/reference toggles and ongoing ammo/UI state. GitHub CI runs existing M303.7–M304.2 regressions before new test and APK export.

## Unverified / outstanding

- Engine-level headless checks do not prove final on-device appearance, battery consumption, FPS, GPU/thermal performance, touch quality or ship-scale aesthetics.
- The 3D ship meshes are code-generated original game art, **not** a final high-poly ship production asset pack. More modeling, texture work and animation will be needed.
- Local game only; newer M304 gameplay systems are not server authoritative and are not yet integrated with the older M302 transactional backend.
- Reference sprites from SeaBattles and SeaOfBones remain test-only; do not publish or distribute third-party art without adequate rights.
- GitHub Actions creates a new temporary Android debug signing key for each build. Updating over an older test app can fail; back up local data first and consider permanent keystore handling.
- APK CI artifact is temporary, not a permanent release.

## Next acceptance tests after CI

1. Real Samsung installation, 844x390 and native landscape orientation, 60-second sailing and tight turns.
2. Original ship remains visibly intact at 100 HP while navigating, and enters actual damage state only when HP falls below 33%.
3. Buy frigate and ghost ship; verify actual changing hull/sail silhouettes without teleport.
4. Fire iron, harpoon and chainshot; collect gold; shipyard open/close; original/reference switching.
5. Review frame rate, camera distance, ocean, wake and ship details from a real device capture.
