# WoW Forever – iPhone-Web-App

Dies ist **ausschließlich die öffentliche statische Web-App**. Der ausführliche Charaktertracker, weitere Guides und Arbeitsdokumente liegen in einem **separaten privaten Repository**.

## Auf dem iPhone installieren

1. Nach Aktivierung von GitHub Pages: https://claywell1810.github.io/WoW-Forever-App/ in **Safari** öffnen.
2. **Teilen → Zum Home-Bildschirm → Als Web-App öffnen → Hinzufügen**.
3. Nach der ersten erfolgreichen Online-Nutzung ist die zuletzt gespeicherte Version im Regelfall offline nutzbar, solange iOS den Cache nicht löscht.

## Dateien
- `index.html` – Dashboard mit eingebetteten Charakterdaten und Makros, Snapshot vom 12.11.2026
- `sw.js` – Service Worker für Offline-Nutzung
- `spellbook.js` – offline verfügbare, recherchierte Druidenzauber und einzelne Ränge bis Stufe 60
- `manifest.webmanifest` – Web-App-Metadaten
- `icon.svg`, `icon-192.png` – App-Symbole
- `.nojekyll` – statische Bereitstellung ohne Jekyll

## GitHub Pages aktivieren

[Repository → Settings → Pages](https://github.com/Claywell1810/WoW-Forever-App/settings/pages): **Deploy from a branch**, dann **main / (root)**, **Save**.

## Aktualisierungen

Der **maßgebliche Charakterstand bleibt ausschließlich** im privaten WoW-Forever-Guide-Repository (`character_tracker.md`). Dieses öffentliche Repository enthält nur den **statischen Snapshot** in der HTML-Datei; es gibt **keine** Live-Verbindung zum privaten Tracker. Wenn Fortschritte bestätigt und im privaten Tracker gespeichert werden, muss anschließend die öffentliche `index.html` synchronisiert werden, damit das Dashboard sie anzeigt. Änderungen auf `main` werden nach aktivierter GitHub-Pages-Bereitstellung veröffentlicht.

Die Webseite ist öffentlich erreichbar. Keine Passwörter, privaten API-Schlüssel oder personenbezogenen Informationen in den App-Dateien speichern.


## Abhakbare Spielfortschritte

Die iPhone-App speichert **Zwischenziele bis Stufe 35, individuelle Talentpunkte und Zauberränge** in ihrem lokalen Browser-Speicher (`localStorage`). Häkchen bleiben bei normalen App-Updates erhalten, werden aber **nicht automatisch mit GitHub synchronisiert**. Beim Löschen der Web-App-Daten oder auf einem anderen Gerät sind sie nicht automatisch vorhanden.

Mit **„Abgehakte Ziele für den Chat kopieren“** auf der Übersicht beziehungsweise **„Meine Talent-Häkchen für den Chat kopieren“** im Talentbereich lässt sich der lokale Stand samt Zauberhäkchen in eine Textnotiz übernehmen. Damit kann er nach ausdrücklicher Rückmeldung in den privaten Tracker übernommen werden.

### Zauberdaten

`spellbook.js` enthält derzeit **212 mit Leveln versehene Einträge** für den Druiden (**101 bis Stufe 35**). Grundlage ist die levelweise Forever-Datenbank [Druidenzauber mit Rängen](https://wow-forever-talent-calculator.com/druid/spells) mit Abgleich bei [1mw](https://1mw.io/en/classes/druid/talents). Die Datenbanken enthalten voneinander abweichende Zählungen; insbesondere Fähigkeiten **ohne belegte Lernstufe** sowie interne passive Effekte können fehlen. Die Liste ist deshalb **keine Garantie für ein vollständiges aktuelles Lehrermenü**. Klassenquests und Talentfähigkeiten sind gekennzeichnet und werden nicht automatisch als gelernt angenommen.
