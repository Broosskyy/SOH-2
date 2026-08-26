# SOH2 → Abyssal Dominion

SOH2 wird als Funktions- und Balancing-Referenz verwendet. Die alte Phaser-Codebasis und ihre problematischen Assets werden nicht direkt in Abyssal Dominion kopiert.

## Bereits übertragen

- Schiffsklassen und wechselbare Designs
- Kanonenbatterien, Munitionsprofile und Harpunenrollen
- Deckfortschritt mit Waffen- und Erweiterungsplätzen
- Rumpf-, Segel- und Besatzungsausbau
- Kartenfreischaltung, Missionstracking, Loot und lokale Wirtschaft
- täglicher Kessel mit Pechschutz und Kartenfragmenten
- Eventfortschritt und Bonuswellen

## Bewusst nicht übernommen

- Login-Bypass, clientautoritatives PvP und unechte Online-Spieler
- die monolithische Phaser-Szene
- doppelte oder widersprüchliche LocalStorage-Spielstände
- geschützte Namen, Grafiken, Logos, Texte oder Sounds anderer Spiele
- ungefiltertes Laden großer Bildbestände beim Spielstart

## Zielarchitektur

- React/Three.js bleibt die funktionierende V15-Webreferenz.
- Godot 4 ist der schrittweise Zielclient für Web, Android und iOS.
- `shared/game-data/catalog.v1.json` hält SOH2-abgeleitete und originale
  Abyssal-Systeme engine-neutral zusammen.
- Save, Input, Qualität und Assets besitzen austauschbare Plattformgrenzen.
- Der spätere Onlineserver bleibt autoritativ und simuliert keine Spieler.

Der Cross-Platform-Umbau reduziert den SOH2-Umfang nicht. Der exakte Web- und
Godot-Portstatus steht in `docs/V15_FEATURE_MIGRATION_MATRIX.md`.
