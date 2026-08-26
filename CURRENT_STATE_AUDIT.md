# Abyssal Dominion – V16-Audit

Stand: 25. August 2026. V15 wurde als funktionierende Webreferenz erhalten und
schrittweise für die gemeinsame Godot-Zielarchitektur vorbereitet.

## Funktioniert

- Browser-Spiel im Querformat mit Maus, Tastatur und Touch-Steuerung
- verbindliche feste 2,5D-Schrägkamera, Zoom, Zielauswahl und Klick-Navigation
- fünf Seekarten mit Häfen, Gegnern, Monstern und Bonuswellen
- Kanonen-, Munitions- und Harpunenkampf inklusive Nachladen und Auto-Feuer
- vier kauf- und wechselbare Schiffsklassen
- vier Kanonenbatterien, sechs Deckstufen und drei dauerhafte Werftausbauten
- Missionen, Loot, Erfahrung, Währungen, Händler, Gezeitenkessel und lokales Event
- lokales, versioniertes IndexedDB-Savegame mit Import, Export und Migration von Version 2/3 auf Version 4
- Versenkung und sicherer Respawn in Hafen Aster
- wählbare Grafikprofile AUTO, LOW, MEDIUM, HIGH und ULTRA

## In diesem Stand behoben

- flache Welt-Schiffskarten durch drehbare 3D-Schiffe ersetzt
- sichtbare Rümpfe, Decks, Masten, Segel, Kanonenreihen, Rigg und Ausbaubänder
- Schiffwechsel aktualisiert Modell, Werte und Savegame gemeinsam
- kompaktere Lebensanzeigen über Gegnern statt großer Kartenfenster
- hellere Beleuchtung und bessere Lesbarkeit der 3D-Welt
- Rumpf-, Segel- und Besatzungsausbau aus SOH2 funktional übertragen
- alter Spielstand wird auf das neue Speicherformat migriert
- Import speichert den normalisierten statt eines veralteten Roh-Spielstands
- Respawn kehrt verlässlich auf die sichere Startkarte zurück
- veralteter Build-Test ersetzt; Build und Test laufen wieder durch
- Echtzeit-State, Kampfberechnung, Missionsbelohnungen, Wirtschaft, Input, Qualität und Saveadapter aus der Hauptkomponente gelöst
- plattformneutraler Datenkatalog mit automatischer Godot-Synchronisation angelegt
- echtes Godot-4-Projekt mit Meer, Platzhalterschiff, schräger Kamera, Desktopbewegung, Mobile-HUD-Grundlage und Exportprofilen angelegt
- X/Z-Wasserfläche als einzige Gameplayebene in Webdaten und Godot-Code fixiert
- freie Orbit-, Ego- und Hinter-dem-Schiff-Kamera technisch und dokumentarisch ausgeschlossen
- Boss-/Ereignisübersicht und begrenzte Camera-Shake-Schnittstellen ergänzt

## Noch nicht vollständig

- hochauflösende externe GLB-Schiffsmodelle und Animations-Rigs
- Talente, Offiziere, Begleiter, Herstellung und verkaufbares Inventar
- tägliche Aufgaben mit Kalenderrotation und abholbaren Belohnungsstufen
- vollständige Bonuskarten-Auswahl und mehrere Bossmechaniken
- Audio, Musik und haptisches Feedback
- echter Multiplayer, Gildenserver und Crossplay
- vollständiger Godot-Port von Kampf, KI, Karten, Werft, Missionen und HUD
- signierte Android- und iOS-Builds sowie Godot-Web-Export

## Technische Priorität als Nächstes

1. Den vorhandenen Web-Kampf als ersten vollständigen vertikalen Slice nach Godot portieren.
2. Zielauswahl, Projektile, Schaden, Loot und Save-V4-Abgleich in Godot testen.
3. Danach Karten/AI und das native HUD portieren.
4. Erste produktionsnahe GLB-Schiffe mit LOD0–LOD2 integrieren.
5. Godot Web, Android und iOS auf echten Zielgeräten bauen und profilieren.
