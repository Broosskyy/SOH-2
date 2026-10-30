# Abyssal Dominion – Referenz-APK-Audit (30.10.2026)

**Quellen:** drei vom Nutzer hochgeladene Archive. Statische ZIP-/UnityFS-Strukturprüfung, keine Installation oder Ausführung. **Kein Drittanbieter-Grafikmaterial in diesem Commit.**

## Bestätigte Befunde

| Quelle | Eingabepaket | Technische Struktur | Im APK lose Gameplay-PNGs |
|---|---:|---|---|
| Captain of Sea 1.0 | 328,5 MiB APK | Unity/IL2CPP; 1.594 APK-Einträge, 1.199 unter `assets/`; zahlreiche Unity-Serialisierungsdateien in `assets/bin/Data/` | 0: 177 PNGs liegen unter Android-`res/` |
| SeaBattles 1.24.0 | 130,0 MiB APKS | 5 äußere Dateien, `base.apk` mit 958 Einträgen, davon 525 Unity-Datendateien unter `assets/bin/Data/`; 26 Addressables-Bundles überwiegend Lokalisierung | 0: 177 PNGs liegen unter Android-`res/` |
| Sea of Bones 1.3.68 | 477,8 MiB ZIP | Enthält 521,1-MiB-APKS; `base.apk` 391,0 MiB; `split_UnityDataAssetPack.apk` 91,0 MiB | 0: 203 PNGs liegen unter Android-`res/` |

### Sea of Bones: UnityFS-Metadaten erfolgreich dekodiert
- `data.unity3d`: 388.251.645 Bytes; UnityFS-Format 8; Unity 6000.3.6f1; 3.811 Blöcke, **7 interne Dateien**, ca. 499,5 Mio. Bytes expandiert.
- `sharedassets0.assets`: 73.948.100 Bytes; `sharedassets0.assets.resS`: 416.263.872 Bytes.
- `datapack.unity3d`: 95.056.623 Bytes; 1.219 Blöcke, **66 interne Dateien**, ca. 159,7 Mio. Bytes expandiert.
- `sharedassets2.assets.resS`: 67.118.624 Bytes.

### Captain of Sea
- APK-Größe: 344.488.768 Bytes, insgesamt ca. 989,8 MiB expandiert.
- Unity-Serialisierung enthält Versionszeichenfolge `6000.3.7f1`.
- `lib/arm64-v8a/libil2cpp.so` ca. 145,9 MiB, `libunity.so` ca. 22,9 MiB.
- Die Unity-Dateien tragen überwiegend 32-stellige Hash-Namen.

## M304.1: konkreter Integrationsplan
1. Unity `Texture2D`, `Sprite`, `SpriteAtlas`, `Mesh`, `Material` und `AnimationClip` aus den unterschiedlichen Serialisierungs-/AssetBundle-Dateien getrennt inventarisieren; neben Dateiname, Objekt-ID, Auflösung, Game-Quelle dokumentieren.
2. Im **privaten** Analyseordner Bildtafeln für Schiffe, Munition/VFX, Inseln/Küsten, Wasser, Monster, HUD/Icons erstellen und die visuellen Kandidaten manuell zuordnen.
3. Für freigegebene Assets oder eine lokal abgegrenzte, nicht verteilte Testversion Godot-Importmapping und Sprite-Animationen erstellen. Keine fremden Originalgrafiken in öffentlichen GitHub-Code oder öffentliche Builds übernehmen.
4. Für langfristige Release-Version eigene/lizenzierte Schiffs- und UI-Grafiken erstellen; Gameplay-/HUD-Inspiration von Originalgrafik unterscheiden.
5. M304-`rebuild/m304-shipyard-hud` bleibt als letzter getesteter **spielbarer** GitHub-/APK-Stand unberührt. Neue Arbeiten nur nach erfolgreicher Sprite-/Mesh-Objektinventarisierung integrieren.

## Grenzen der aktuellen Analyse
Die oben genannten Dateigrößen und UnityFS-Knoten belegen umfangreiches Spielmaterial, **aber keine konkreten identifizierten Schiffstypen**. Eine vollständige Texture2D-/Sprite-/Mesh-Extraktion ist noch offen. Deshalb werden aus den Quellpaketen derzeit **keine neuen Fremdgrafiken** öffentlich weiterverteilt. Eine lokale Installation des UnityPy-Parsers war mangels Paketnetzwerk nicht möglich.

Weiterführender Arbeitsbereich: `research/m304-three-apk-assets`. Der aktuelle M304-APK-Code bleibt auf `rebuild/m304-shipyard-hud`.
