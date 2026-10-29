# Abyssal Dominion — M303.5 SeaBattles-Art-Prototyp
Datum: 2026-10-29

## Stand der Umsetzung
- Native Godot-4.7.2-Scene: `scenes/classic/classic_sea_map.tscn` → `scripts/classic/m3035_seabattles_core.gd`
- Android Landscape, Vollbild über `project.godot` und eine responsive HUD-Hülle (M303.4)
- M303.1: lokale Seekarte, Karte/Minimap, Schiffssteuerung, Inselumfahrung, Zielwahl, NPCs, Monster, Kanonen/Harpunen, Gold/Beute, Reparatur
- M303.5: optional private 8-Richtungs-PNG-Atlanten (4 Spalten × 2 Reihen), alternative öffentliche 16-Richtungs-Vektorplatzhalter und vorhandene 3D-GLB-Modelle
- M303.5 Bewegung: sanftere Beschleunigung, Kurvenrotation, Wegpunkt-Anfahrt, langsam wandernde NPC-Schiffe
- Umschalter auf dem HUD: **GRAFIK: APK-TEST → GRAFIK: 3D → GRAFIK: 2D**; in dieser lokalen Version führt das Umschalten zu einem Szenen-Neustart
- Quelle der Assets und Spiellogik sind unabhängig. Die Schiffs-/Insel-Sprites ändern **keine** HP, Bewegung, Wegpunkte oder Rewards.

## Private SeaBattles-PNGs hinzufügen – auf dem Entwicklungssystem, VOR dem Build
Keine Unity-Bundles in Godot kopieren: Nur zuvor korrekt dekodierte PNGs oder WebP-Dateien verwenden.
Ablage (lokal, per .gitignore ausdrücklich nicht ins öffentliche Repository):

```text
assets/classic/private_seabattles/
  ships/
    elite8.png
    pinnace.png
    warship.png
    flyingdutchman.png
  islands/
    snow.png
    rock.png
    tropical.png
```

- **Bereits aus der Nutzer-APK stammender Diagnose-Atlas:** Die Datei `elite8_apk_diagnostic_8dir.png` aus der früheren privaten M303.3-Version kann alternativ unter `assets/classic/private_seabattles/ships/` abgelegt werden. **Diese Fassung hat Farbfehler** und eignet sich nur für technische Bewegungs-/Frame-Tests.
- `elite8.png`, `pinnace.png` etc. sind erwartete *Dateinamen*, keine Behauptung, dass alle Dateien bereits korrekt exportiert vorliegen.
- Jedes erwartete Schiffssheet: acht Ansichten in 4×2-Anordnung, transparente Hintergründe; der korrekte Frame-Reihenfolge-/Heading-Abgleich mit SeaBattles ist noch offen.
- Falls kein privates PNG vorhanden ist, rendert M303.5 die vorhandene eigene Vector-Sprite-Grafik oder ein GLB.
- Alternativ kann eine fertig dekodierte PNG an denselben relativen Pfad in `user://seabattles/` gelegt werden; dort vorhandene Dateien liest der Adapter ohne Reexport.

## Einschränkung und Abnahme
- **Die von dir bereitgestellte APK wurde zuvor untersucht.** Originalgrafiken wurden nicht in dieses öffentliche Repo hochgeladen. Hier liegt ausschließlich der Lade-Adapter und Fallbackcode.
- Von der APK wurden bisher einzelne Texturbezeichnungen und eine `elite8`-Diagnosegrafik gesichtet; für exakte Originaldarstellung müssen die restlichen Grafikdateien korrekt ETC2-dekodiert werden.
- SeaBattles verwendet Unity; unsere Implementierung bleibt Godot. Die Bewegungsparameter wurden **nicht** aus dem IL2CPP-Code rückentwickelt, sondern als lokales Spielgefühl-Profil angepasst.
- **Native Godot-4.7.2-, Android- und Web-QA ist NOT_EVALUATED.** Kein behaupteter nativer PASS, keine erzeugte APK und noch kein bestätigter Live-Multiplayer.
- Der Branch ist separater Prototyp. M302 `main` bleibt unverändert.

## Unmittelbare visuelle Abnahmekriterien
1. Start direkt im Querformat, keine Browser- oder Android-Statusleisten über dem Spielfeld.
2. Kein überlappendes HUD auf 844×390, 1280×720 und 1920×1080.
3. Spieler- und NPC-Schiffe drehen bei Kurswechsel, ohne unkontrolliertes seitliches Gleiten.
4. Inselumfahrung blockiert kein Schiff dauerhaft.
5. Private 8-Richtungs- und eigene 16-Richtungs-Sprites sowie GLB-Darstellung lassen sich separat prüfen.
6. Screenshotvergleich mit SeaBattles: effektive Schiffsgröße, Küstenkontur, Seekarten-Dichte, Kamerawinkel und Minimap/Buttons.
