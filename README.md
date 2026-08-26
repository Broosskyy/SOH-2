# Abyssal Dominion V16

Cross-Platform-2D/2,5D-Fantasy-Seeschlachtspiel mit vollständiger
3D-Darstellung für Web, Android und iOS. Der
funktionierende Webclient kombiniert React und Three.js. Parallel enthält das
Repository eine echte Godot-4-Migrationsbasis für den schrittweisen gemeinsamen
Godot-Web-/Android-/iOS-Client. V15 bleibt als Gameplay-, Balancing- und
visuelle Referenz erhalten.

## Lokal starten

```bash
npm install
npm run dev
```

## Prüfen

```bash
npm run typecheck
npm run lint
npm test
npm run validate:artifact
```

## Godot

Öffne `godot/project.godot` mit Godot 4.3 oder neuer. Die erste Szene enthält
Meer, bewegliches Spielerschiff, schräge Kamera, Desktopsteuerung und
Touchgrundlage. Der vollständige V15-Port ist noch nicht behauptet.

Die Perspektive ist verbindlich: Schiffe spielen auf X/Z, die Kamera folgt aus
einer festen schrägen Richtung und erlaubt Zoom, aber keine freie Orbit-, Ego-
oder Third-Person-Verfolgung. Siehe `docs/GAMEPLAY_CAMERA_CONTRACT.md`.

Der Webspielstand liegt hinter einer Repository-Schnittstelle weiterhin in
IndexedDB. Godot speichert lokal über `user://profiles`; Cloud Save und
Multiplayer bleiben spätere Dienste. Der exakte Status steht in
`docs/V15_FEATURE_MIGRATION_MATRIX.md`.
