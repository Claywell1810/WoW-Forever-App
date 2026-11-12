# WoW Forever – iPhone-Web-App

Dies ist **ausschließlich die öffentliche statische Web-App**. Der ausführliche Charaktertracker, weitere Guides und Arbeitsdokumente liegen in einem **separaten privaten Repository**.

## Auf dem iPhone installieren

1. Nach Aktivierung von GitHub Pages: https://claywell1810.github.io/WoW-Forever-App/ in **Safari** öffnen.
2. **Teilen → Zum Home-Bildschirm → Als Web-App öffnen → Hinzufügen**.
3. Nach der ersten erfolgreichen Online-Nutzung ist die zuletzt gespeicherte Version im Regelfall offline nutzbar, solange iOS den Cache nicht löscht.

## Dateien
- `index.html` – Dashboard mit eingebetteten Charakterdaten und Makros, Snapshot vom 12.11.2026
- `sw.js` – Service Worker für Offline-Nutzung
- `manifest.webmanifest` – Web-App-Metadaten
- `icon.svg`, `icon-192.png` – App-Symbole
- `.nojekyll` – statische Bereitstellung ohne Jekyll

## GitHub Pages aktivieren

[Repository → Settings → Pages](https://github.com/Claywell1810/WoW-Forever-App/settings/pages): **Deploy from a branch**, dann **main / (root)**, **Save**.

## Aktualisierungen

Der **maßgebliche Charakterstand bleibt ausschließlich** im privaten WoW-Forever-Guide-Repository (`character_tracker.md`). Dieses öffentliche Repository enthält nur den **statischen Snapshot** in der HTML-Datei; es gibt **keine** Live-Verbindung zum privaten Tracker. Wenn Fortschritte bestätigt und im privaten Tracker gespeichert werden, muss anschließend die öffentliche `index.html` synchronisiert werden, damit das Dashboard sie anzeigt. Änderungen auf `main` werden nach aktivierter GitHub-Pages-Bereitstellung veröffentlicht.

Die Webseite ist öffentlich erreichbar. Keine Passwörter, privaten API-Schlüssel oder personenbezogenen Informationen in den App-Dateien speichern.
