# V15 Feature Migration Matrix

**IMPLEMENTED** = working in current Web client. **MIGRATED** = working in
Godot. **PREPARED** = scaffold/contract exists. **DOCUMENTED** = specified only.
**NOT YET IMPLEMENTED** = no working target implementation.

| V15 feature | V16 Web | Godot | Android | iOS | Notes |
| --- | --- | --- | --- | --- | --- |
| Start/fullscreen flow | IMPLEMENTED | PREPARED | PREPARED | PREPARED | OS restrictions apply |
| Landscape layout | IMPLEMENTED | IMPLEMENTED | PREPARED | PREPARED | Orientation configured |
| Three.js world | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | Godot has separate minimal world |
| Angled follow camera | IMPLEMENTED | MIGRATED | PREPARED | PREPARED | Movement slice |
| Fixed world-space camera direction | IMPLEMENTED | MIGRATED | PREPARED | PREPARED | No player orbit |
| X/Z gameplay plane | IMPLEMENTED | MIGRATED | PREPARED | PREPARED | Y visual only |
| Boss/event overview zoom | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Godot hook exists; encounter wiring pending |
| Bounded camera shake | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Godot hook exists; combat wiring pending |
| Third-person/orbit/first-person exclusion | IMPLEMENTED | IMPLEMENTED | PREPARED | PREPARED | Binding camera contract |
| Zoom | IMPLEMENTED | MIGRATED | PREPARED | PREPARED | Touch pinch remains open |
| Click/touch destination sailing | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Godot joystick works |
| WASD/arrow steering | IMPLEMENTED | MIGRATED | PREPARED | PREPARED | Shared actions |
| Virtual joystick | IMPLEMENTED | MIGRATED | PREPARED | PREPARED | Visual polish open |
| Touch combat buttons | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Combat port open |
| Five maps | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Catalog loaded |
| Islands and ports | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Asset/data slots exist |
| Map travel/unlocks | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Rules prepared |
| Minimap/coordinates | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | UI port pending |
| Four player ships | IMPLEMENTED | PREPARED | PREPARED | PREPARED | One placeholder playable |
| Ship purchase/selection | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | Data prepared |
| Player name/level marker | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | HUD port pending |
| Six deck levels/pips | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Shared data |
| Hull upgrades | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Economy data |
| Sail upgrades | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Economy data |
| Crew upgrades | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Economy data |
| Four cannon batteries | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Shared data |
| Cannon upgrades | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Formula preserved |
| Five ammunition types | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Shared data |
| Harpoon combat | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Action/data prepared |
| Three active abilities | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Input/data prepared |
| Manual/auto fire | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | Combat port pending |
| Target select/cycle | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Simulation pending |
| Projectiles/hit VFX | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | VFX slots prepared |
| NPC AI ships | IMPLEMENTED | PREPARED | PREPARED | PREPARED | AI pending |
| Kraken | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Data/asset slot |
| Sea serpent | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Data/asset slot |
| Leviathan | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Data/asset slot |
| Abyss boss/waves | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Three phases represented |
| Loot drops/pickup | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Tables prepared |
| XP/level progression | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Contract prepared |
| Eight missions/rewards | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Values preserved |
| Gold/pearls/materials | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Economy contract |
| Port shop | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | UI/business port pending |
| Shipyard | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | UI/business port pending |
| Gezeitenkessel/pity | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Rules prepared |
| Local AI event | IMPLEMENTED | PREPARED | PREPARED | PREPARED | No fake online users |
| Death/respawn | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | Port pending |
| Save export/import | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Bridge pending |
| IndexedDB save | IMPLEMENTED | N/A | N/A | N/A | Repository adapter |
| Save V2/V3 → V4 | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Web migration works |
| Quality profiles | IMPLEMENTED | MIGRATED | PREPARED | PREPARED | Device defaults |
| Responsive HUD | IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | NOT YET IMPLEMENTED | Native HUD pending |
| Safe-area access | PREPARED | PREPARED | PREPARED | PREPARED | HUD application pending |
| GLB/LOD asset pipeline | PREPARED | PREPARED | PREPARED | PREPARED | Production GLBs absent |
| SOH2-derived V15 systems | IMPLEMENTED | PREPARED | PREPARED | PREPARED | Scope preserved |
| Accounts/cloud save | NOT YET IMPLEMENTED | PREPARED | PREPARED | PREPARED | Boundary only |
| Multiplayer | NOT YET IMPLEMENTED | DOCUMENTED | DOCUMENTED | DOCUMENTED | Authoritative server later |
