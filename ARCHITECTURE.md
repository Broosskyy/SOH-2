# Architecture

- React/Vinext rendert HUD, Menüs und responsive Touchoberflächen.
- Three.js/WebGL rendert Welt, Wasser, Einheiten, Treffer, Projektile und Loot
  als echte 3D-Szene. Eine feste perspektivische Kamera bewahrt das
  Seafight-artige 2,5D-Spielgefühl.
- `gameData.ts` bleibt die typisierte V15-Datenquelle des Webclients.
- `shared/game-data/catalog.v1.json` ist der engine-neutrale Vertrag.
- `app/game/core` enthält Typen, Mathematik und Runtime-State.
- `app/game/input` enthält logische Aktionen statt Geräteereignissen.
- `app/game/quality` enthält zentrale Plattform-Qualitätsprofile.
- `app/game/camera` enthält den verbindlichen festen 2,5D-Kameravertrag.
- `page.tsx` orchestriert Web-Spielschleife und UI mit diesen Kernschichten.
- `threeRenderer.ts` kapselt 3D-Szene, prozedurale Modelle, Licht, Wasser,
  Kamera, Raycasting und mobile Qualitätsgrenzen.
- `app/game/save` trennt Save-V4-Modell, Repository und IndexedDB-Adapter.
- `godot/` ist der schrittweise Cross-Platform-Zielclient.

Beide Renderer verwenden echte 3D-Szenen, aber Gameplaykoordinaten bleiben auf
X/Z. Es existiert absichtlich keine Eingabeaktion für freie Kamerarotation.

Gameplay greift nur über die Save-Repository-Fassade auf Persistenz zu. Godot
spiegelt dieselbe Grenze. Cloud Save kann ergänzt werden, ohne Kampflogik direkt
an einen Anbieter zu koppeln.
