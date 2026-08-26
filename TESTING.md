# Testing

## Automatisierte V16-Prüfungen

- TypeScript: `npm run typecheck`
- ESLint: `npm run lint`
- Produktionsbuild plus gerenderter Spiel-Shell-Test: `npm test`
- Cross-Platform-Vertrag, Input-Parität und Godot-Dateistruktur:
  `npm run test:architecture`
- Sites-Artefakt: `npm run validate:artifact`
- Game-Data-Synchronisierung: automatisch vor jedem Web-Build

## Manuell auf Zielgeräten offen

- längere Touchsessions und Multi-Touch/Pinch-Zoom;
- Android APK/AAB auf Midrange- und High-End-Geräten;
- iOS/Xcode-Build, Signierung, Notch und Dynamic Island;
- Godot-Web-Export in Browsern mit WebGL2;
- 30/60-FPS-Budgets in großen Kämpfen;
- Save-Import zwischen Web- und später vollständigem Godot-Client.

Ein vorhandenes Export-Preset gilt nicht als erfolgreicher Plattformbuild.
