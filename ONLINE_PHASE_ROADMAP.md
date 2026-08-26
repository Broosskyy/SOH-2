# Online Phase Roadmap

Der Gameplay-Kern bleibt unabhängig von einem Anbieter. Lokale Repositories
werden später über dieselben Schnittstellen an Supabase und einen
autoritativen Game-Server angebunden.

1. Versionierte Migration lokaler Profile und optionale Registrierung.
2. Supabase für Konto, Cloud-Spielstand, Inventar-Metadaten und soziale Daten.
3. Autoritativer, tickbasierter Game-Server für Bewegungs- und Kampflogik.
4. WebSocket-Replikation, Gruppen, Gilden, Ranglisten und Matchmaking.
5. serverseitige Beutevergabe, Telemetrie und Anti-Cheat-Prüfungen.
6. gemeinsames Konto und Crossplay für Browser, Android und iOS.
7. gestaffeltes Deployment mit getrennten Test-, Staging- und Live-Welten.

Im aktuellen Build werden keine echten Online-Spieler simuliert.
