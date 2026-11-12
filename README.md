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
- `ux.js`, `ux.css` – mobile Navigation, dynamische Heute-Ansicht, Schnellfilter, Checklisten und Backup
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


## Bedienung – vereinfachte Version (12.11.2026)

- Unten auf dem iPhone: **Heute, Leveln, Quests, Dungeons, Mehr**. Unter Mehr: Berufe, Gear, Talente, Zauber, Makros, Bücher und Datensicherung.
- **Heute** zeigt die nächsten offenen Meilensteine, Talente und Zauber. Die **Planungsstufe** (z. B. 27) wird nur lokal gespeichert. Sie ändert **nicht** den bestätigten GitHub-Spielstand (zuletzt Stufe 22).
- **Etappen bis Stufe 35** stehen am Anfang der Guide-Bereiche; abgehakte Etappen werden in eine aufklappbare Gruppe verschoben.
- Im **Zauberbuch**: „Letztes Lernlevel“ zeigt den letzten Zauber-Lernschritt bis zur Planungsstufe (auf Stufe 27 also Stufe 26); „Bis Planungsstufe“ zeigt den Rückstand. Zusätzlich kannst du **nicht abgehakte Zauber** und **Lehrer / Klassenquests / Talente** filtern.
- Ein **Häkchen bedeutet ausdrücklich vom Nutzer markiert**, nicht automatisch aus dem Spiel ausgelesen. Die App liest nicht auf den WoW-Account zu.
- Unter **Mehr → Feierabend** kopierst du eine textuelle Zusammenfassung für den Chat; anschließend kann der private Tracker nach Absprache aktualisiert werden.
- Unter **Mehr → Backup** kann der vollständige lokale Häkchenstand als JSON kopiert, als Datei gespeichert oder aus einer Datei bzw. eingefügtem JSON wiederhergestellt werden. **Import ersetzt lokale Häkchen erst nach ausdrücklicher Bestätigung.**
- Für die Offline-Nutzung muss die App nach einem Update zunächst einmal online geladen worden sein. Ein abweichender Speicherstand zwischen Safari und der zum Home-Bildschirm hinzugefügten Web-App kann vorkommen: Vor einem Wechsel am besten ein JSON-Backup erstellen.

Die Grundfunktionen einschließlich lokalem Planungslevel, Checkbox-Speicherung und Backup-Wiederherstellung wurden automatisiert geprüft. Ein vollständiger iPhone-Fingertest bleibt offen.
