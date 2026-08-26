# Game Design

ABYSSAL DOMINION ist ein eigenständiges Fantasy-Seeschlachtspiel mit kurzen
Jagdaufträgen, mittleren Expeditionen und längeren Bonuswellen. Position,
Reichweite, Zieltyp und Munition bilden die unmittelbaren Entscheidungen.

Die vier Regionen Azurwacht, Dämmersee, Sturmbruch und Abyssale Prüfung
steigern Gefahr und Belohnung. Schiffe werden mit Kanonen bekämpft,
Seeungeheuer effizient mit Tiefenharpunen. Fortschritt entsteht über Level,
Kanonen-/Harpunenstufen, Vorräte, Materialien und Missionsbelohnungen.

Alle Gegner sind klar als KI oder Monster gekennzeichnet. Echte Spieler,
Gilden und PvP werden nicht vorgetäuscht.

## Perspektive

Die Welt wird vollständig in 3D gerendert, während Navigation und Kampf auf
der Wasserfläche bleiben. Eine feste schräge Kamera folgt dem Schiff weich,
zoomt bei Bossen weiter heraus und vermeidet die Unübersichtlichkeit einer frei
drehbaren Third-Person-Kamera. Damit bleibt die Bedienung vertraut, obwohl
Schiffe, Inselhöhen, Häfen, Monster, Licht und Wasser räumlich sind.

Diese Perspektive ist verbindlich: Navigation, Reichweiten, Kollision und
Combat bleiben auf X/Z. Y dient nur visueller Höhe. Es gibt keine freie
Orbit-, Ego- oder Hinter-dem-Schiff-Kamera. Boss- und Ereignisansichten dürfen
nur kontrolliert weiter herauszoomen. Details und Abnahmeregeln stehen in
`docs/GAMEPLAY_CAMERA_CONTRACT.md`.
