# Save System

- Engine-neutrales Datenmodell: Version 4.
- V2- und V3-Spielstände werden auf V4 migriert.
- Web-Repository: IndexedDB `abyssal-dominion`, Store `profiles`, Profil
  `captain`.
- Godot-Repository: vorbereitet unter `user://profiles`.
- Cloud-Repository: Schnittstelle vorbereitet, nicht implementiert.
- Automatische Speicherung alle zehn Sekunden und bei wichtigen Aktionen.
- Manueller JSON-Export und Import bleiben erhalten.
- Reset löscht ausschließlich das lokale Profil.

Das Save-Modell ist unabhängig von IndexedDB. Gespeichert werden Fortschritt,
Währungen, Munition, Karten, Missionen, Ausrüstung, Schiff,
Kanonenbatterie, Deck- und Werftausbau, Kesselstatus und Qualitätseinstellung.
