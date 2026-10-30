# M304.1 – tatsächlicher Unity-Objektkatalog aus drei Referenz-APKs
**30.10.2026 · statische Analyse bereitgestellter Installationsarchive.** Keine Software ausgeführt; keine fremden Grafiken oder APK-Binärdateien in diesem Branch.

## Wesentlicher Fortschritt
Der zunächst unvollständige Sea-of-Bones-ZIP-Download enthält zwei vollständig wiederherstellbare APKs: `base.apk` (409.964.220 B) und `split_UnityDataAssetPack.apk` (95.459.172 B). Der ARM64-Split ist abgeschnitten. Die UnityFS-Blöcke und die Unity-SerializedFile-Objekttabellen wurden direkt dekodiert; für diese Metadaten war UnityPy nicht erforderlich.

| APK | Parsebare SerializedFiles | Objekte | Texture2D | Sprite | Mesh | Material | AnimationClip |
|---|---:|---:|---:|---:|---:|---:|---:|
| SeaBattles 1.24.0 | 383 | 3.320 | 315 | 154 | 13 | 13 | 0 |
| Captain of Sea 1.0 | 484 | 3.435 | 268 | 197 | 15 | 73 | 0 |
| Sea of Bones 1.3.68 | 33 | 16.731 | 868 | 543 | 182 | 246 | 5 |

Die Werte sind **Teilergebnisse**: zahlreiche Archivdateien sind nicht Unity-SerializedFile oder wurden vom Minimalparser nicht erkannt. Es handelt sich nicht um eine Gesamtzahl eindeutiger Artworks oder Schiffsmodelle; ein Sprite und seine Textur können separat gezählt werden.

**Erstellt:** 2.964 katalogisierte, benannte Unity-Ressourcen; die private CSV-Datei führt Quelle, Original-Dateipfad, Unity-Objekt-ID, Klasse, Name, Bildabmessungen (soweit auslesbar) und Objektgröße auf. Für die späteren öffentlichen GitHub-Versionen nur eigenen Code/Metadaten nutzen; die Originalbilddaten privat lassen.

## Direkt nachgewiesene Kandidaten
| Spiel | Objektname | Unity-Klasse | Größe | Bedeutung |
|---|---|---|---|---|
| SeaBattles | elite8 | Texture2D | 2048×1024 | Schiff-Sheet-Kandidat |
| SeaBattles | elite9 | Texture2D | 2048×1024 | weiterer Schiff-Sheet-Kandidat |
| SeaBattles | Warship | Texture2D | 1024×512 | Kriegsschiff |
| SeaBattles | BoneShip | Texture2D | 1024×512 | Knochenschiff |
| SeaBattles | HalloweenGalleon | Texture2D+Sprite | 1024×896 | Event-Schiff |
| SeaBattles | PumpkinAmmo | Texture2D | 16×16 | Event-Munition |
| SeaBattles | CannonShootEffect | Texture2D+Sprite | 12×25 | Kanoneneffekt |
| Sea of Bones | fragata_realista | Mesh | – | 3D-Fregatte |
| Sea of Bones | Seahawk | Mesh+Texture2D | 1024×576 Textur | Schiff |
| Sea of Bones | bala_de_hierro | Texture2D+Sprite | 1024×1024 | Eisenkugel-Munition |
| Sea of Bones | bala_encadenada_textura | Texture2D | 1024×1024 | Kettenmunition |
| Sea of Bones | arpon_hueso | Texture2D+Mesh | 128×128 Textur | Knochenharpune |
| Sea of Bones | T_OceanWaves | Texture2D | 512×512 | Wellen |
| Sea of Bones | cofre_loot | Texture2D+Mesh | 1024×1024 Textur | Beute |
| Sea of Bones | SOB_Attack, SOB_Death, SOB_CastSpell, SOB_Idle | AnimationClip | – | Angriffs-/Untergang-/Cast-/Idle-Clips |
| Captain of Sea | skill_iron_harpoons | Texture2D+Sprite | 100×100 | Harpunen-Skill |
| Captain of Sea | skill_cannon_loader | Texture2D+Sprite | 100×100 | Kanonen-Skill |
| Captain of Sea | sea_wave_normal | Texture2D | 512×512 | Wasser-Normalmap |

Die Namen und Klassen sind aus der Dateistruktur **bestätigt**. Die visuelle Qualität, Sprite-Framereihenfolge, 3D-Komplettheit und Lizenz sind noch **nicht** verifiziert.

## Folgen für Abyssal Dominion
1. **Wiederverwendbare Mechaniken:** separate Munitionstypen Eisenkugel/Kettenkugel/Harpune, Seefahrts-Werft mit wirklichen Klassen, Funktionsbuttons, Attack/Death-Effekte und differenzierte Schiffssilhouetten. **Neue Originalgrafiken** bzw. geklärte Lizenzen für öffentliche Builds.
2. **Nächster technischer Schritt:** GPU-Texturformate sowie Byte-Offsets zu `.resS`-Blöcken prüfen; private Kontaktbögen exportieren; SpriteAtlas-Slices und Meshes mit Materialzuordnung validieren; anschließend gezielten Godot-Importadapter für ausgewählte, rechtlich nutzbare Ressourcen bauen.
3. Der letzte getestete Spielbuild bleibt **M304** auf `rebuild/m304-shipyard-hud`. Es existiert noch **keine neue M304.1-APK** und noch keine PNG-/GLB-Reintegration aus diesem Audit. Kein Import von Drittanbieter-Originalgrafiken in ein öffentliches GitHub-Repository oder einen öffentlich geteilten APK-Release.

**Quellen:** ausschließlich drei vom Nutzer bereitgestellte Spielearchive. Separate lokale Gesamtdatei: `ABYSSAL_M3041_Unity_Assetkatalog.csv`.
