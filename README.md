# WoW Forever – iPhone-Web-App

Dies ist **ausschließlich die öffentliche statische Web-App**. Der ausführliche Charaktertracker, weitere Guides und Arbeitsdokumente liegen in einem **separaten privaten Repository**.

## Auf dem iPhone installieren

1. Nach Aktivierung von GitHub Pages: https://claywell1810.github.io/WoW-Forever-App/ in **Safari** öffnen.
2. **Teilen → Zum Home-Bildschirm → Als Web-App öffnen → Hinzufügen**.
3. Nach der ersten erfolgreichen Online-Nutzung ist die zuletzt gespeicherte Version im Regelfall offline nutzbar, solange iOS den Cache nicht löscht.

## Dateien
- `index.html` – Dashboard mit eingebetteten Charakterdaten und Makros, Snapshot vom 14.11.2026
- `sw.js` – Service Worker für Offline-Nutzung
- `spellbook.js` – offline verfügbare, recherchierte Druidenzauber und einzelne Ränge bis Stufe 60
- `gear-db.js`, `gear-db.css` – Gear-Builder mit lokaler IndexedDB, öffentlicher WoW-Forever-Item-API, Ausrüstungsprofilen und Wunschliste
- `ux.js`, `ux.css` – vorbereitete optionale UX-Erweiterung; die aktive App-Navigation und Checklisten liegen derzeit in `index.html`
- `manifest.webmanifest` – Web-App-Metadaten
- `icon.svg`, `icon-192.png` – App-Symbole
- `.nojekyll` – statische Bereitstellung ohne Jekyll

## GitHub Pages aktivieren

[Repository → Settings → Pages](https://github.com/Claywell1810/WoW-Forever-App/settings/pages): **Deploy from a branch**, dann **main / (root)**, **Save**.

## Aktualisierungen

Der **maßgebliche Charakterstand bleibt ausschließlich** im privaten WoW-Forever-Guide-Repository (`character_tracker.md`). Dieses öffentliche Repository enthält nur den **statischen Snapshot** in der HTML-Datei; es gibt **keine** Live-Verbindung zum privaten Tracker. Wenn Fortschritte bestätigt und im privaten Tracker gespeichert werden, muss anschließend die öffentliche `index.html` synchronisiert werden, damit das Dashboard sie anzeigt. Änderungen auf `main` werden nach aktivierter GitHub-Pages-Bereitstellung veröffentlicht.

Die Webseite ist öffentlich erreichbar. Keine Passwörter, privaten API-Schlüssel oder personenbezogenen Informationen in den App-Dateien speichern.


## Dungeon-Komplettierungsziel bis 35

Im Dungeontab gibt es 17 einzeln abhackbare Dungeon-/Klosterziele, einschließlich der schwieriger erreichbaren Allianz-Instanzen. Die beiden ausdrücklich abgeschlossenen Dungeons **Burg Schattenfang** und **Tiefschwarze Grotte** bleiben als bestätigte Etappen hinterlegt. Für **Ausgrabungsstätte: Sumpfland** wurden am 14.11.2026 die Dungeon-Quests gesammelt; ein Dungeonabschluss ist nicht bestätigt. Der **Gemütliche Schlafsack** wurde am selben Tag erhalten. **Höhlen des Wehklagens** wurden bereits gespielt, aber der vollständige Abschluss ist nicht gesondert bestätigt. Die Questabgaben werden separat geprüft. Die Checkliste setzt oder löscht vorhandene lokale Häkchen nicht; neue Einträge sind zunächst offen. Das Ziel, alle Dungeons auch über Stufe 35 hinaus zu spielen, steht im privaten Charaktertracker.

## Abhakbare Spielfortschritte

Die iPhone-App speichert **Zwischenziele bis Stufe 35, individuelle Talentpunkte und Zauberränge** in ihrem lokalen Browser-Speicher (`localStorage`). Häkchen bleiben bei normalen App-Updates erhalten, werden aber **nicht automatisch mit GitHub synchronisiert**. Bei neuen, eindeutig bestätigten Meilensteinen setzt der App-Snapshot nur bislang unentschiedene Häkchen als Startwert. Beim Löschen der Web-App-Daten oder auf einem anderen Gerät sind sie nicht automatisch vorhanden.

Mit **„Abgehakte Ziele für den Chat kopieren“** auf der Übersicht beziehungsweise **„Meine Talent-Häkchen für den Chat kopieren“** im Talentbereich lässt sich der lokale Stand samt Zauberhäkchen in eine Textnotiz übernehmen. Damit kann er nach ausdrücklicher Rückmeldung in den privaten Tracker übernommen werden.

### Zauberdaten

`spellbook.js` enthält derzeit **212 mit Leveln versehene Einträge** für den Druiden (**101 bis Stufe 35**). Grundlage ist die levelweise Forever-Datenbank [Druidenzauber mit Rängen](https://wow-forever-talent-calculator.com/druid/spells) mit Abgleich bei [1mw](https://1mw.io/en/classes/druid/talents). Die Datenbanken enthalten voneinander abweichende Zählungen; insbesondere Fähigkeiten **ohne belegte Lernstufe** sowie interne passive Effekte können fehlen. Die Liste ist deshalb **keine Garantie für ein vollständiges aktuelles Lehrermenü**. Klassenquests und Talentfähigkeiten sind gekennzeichnet und werden nicht automatisch als gelernt angenommen.


## Bedienung – vereinfachte Version (14.11.2026)

- Unten auf dem iPhone: **Heute, Leveln, Quests, Dungeons, Mehr**. Unter Mehr: Berufe, Gear, Talente, Zauber, Makros, Bücher und Datensicherung.
- **Heute** zeigt die nächsten offenen Meilensteine, Talente und Zauber. Die **Planungsstufe** (z. B. 27) wird nur lokal gespeichert. Sie ändert **nicht** den bestätigten GitHub-Spielstand (zuletzt Stufe 27, bestätigt am 14.11.2026).
- **Etappen bis Stufe 35** stehen am Anfang der Guide-Bereiche; abgehakte Etappen werden in eine aufklappbare Gruppe verschoben.
- Im **Zauberbuch**: „Letztes Lernlevel“ zeigt den letzten Zauber-Lernschritt bis zur Planungsstufe (auf Stufe 27 also Stufe 26); „Bis Planungsstufe“ zeigt den Rückstand. Zusätzlich kannst du **nicht abgehakte Zauber** und **Lehrer / Klassenquests / Talente** filtern.
- Ein **Häkchen bedeutet lokal markiert**. Mit diesem Update werden zweifelsfrei bestätigte Meilensteine bei erstmalig leerem Eintrag als Startwert angehakt; eine vorhandene Nutzerentscheidung (auch bewusst **nicht** angehakt) wird nicht überschrieben. Die App liest nicht auf den WoW-Account zu.
- Unter **Mehr → Feierabend** kopierst du eine textuelle Zusammenfassung für den Chat; anschließend kann der private Tracker nach Absprache aktualisiert werden.
- Unter **Mehr → Backup** kann der vollständige lokale Häkchenstand als JSON kopiert, als Datei gespeichert oder aus einer Datei bzw. eingefügtem JSON wiederhergestellt werden. **Import ersetzt lokale Häkchen erst nach ausdrücklicher Bestätigung.**
- Für die Offline-Nutzung muss die App nach einem Update zunächst einmal online geladen worden sein. Ein abweichender Speicherstand zwischen Safari und der zum Home-Bildschirm hinzugefügten Web-App kann vorkommen: Vor einem Wechsel am besten ein JSON-Backup erstellen.

Die Grundfunktionen einschließlich lokalem Planungslevel, Checkbox-Speicherung und Backup-Wiederherstellung wurden automatisiert geprüft. Ein vollständiger iPhone-Fingertest bleibt offen.

### Bestätigter Spielstand vom 14.11.2026

**Stufe 27**. Schlafsack-Questreihe erledigt und Gegenstand erhalten. Dungeon-Quests für **Ausgrabungsstätte: Sumpfland** gesammelt; die Instanz bleibt offen. Die App führt hierfür neue Etappen (`level-27`, `quests-sleepingbag`, `dung-excav-quests`) und setzt sie nur dann als bestätigt, wenn lokal noch keine eigene Entscheidung gespeichert ist. Alle übrigen Häkchen und Talent-/Zauberauswahlen bleiben bestehen.


## Gear-Builder und echte Itemdatenbank (14.11.2026)

**Zugriff:** App → **Mehr → Gear-Builder**, alternativ **Gear craften → Gear-Builder öffnen**. Der Bereich enthält zwei getrennte Profile: **Wrathcat (Solo)** und **Heiler (Instanzen)**, eine Slotübersicht, eine Suche, einen Vergleich von bekannten Werten und Upgrade-Wunschlisten.

**Externe Quelle:** Die Suche verwendet die öffentliche [TheWoWDB Forever API](https://thewowdb.com/developers/) über \`GET https://thewowdb.com/api/v1/forever/item/?q=...\` und die Itemdetail-Route \`.../item/{id}\`. Kein API-Key erforderlich, browserseitiger CORS-Zugriff laut Dokumentation erlaubt. Sichtbare Attribution ist eingebaut. Die API liefert Gegenstandsdatensätze aus dem WoW-Forever-Client; sie kann unvollständige, ältere oder von Ingame-Anzeigen abweichende Angaben enthalten. Die App zeigt deshalb Quellenlinks, unterscheidet manuelle Spielerbestätigungen von API-Items und **behauptet keine Dropchance**.

**Lokale echte Datenbank:** Browser-\`IndexedDB\` namens \`wow-forever-gear-v1\` mit Tabellen/Object Stores \`items\`, \`profiles\`, \`wishlist\` und \`meta\`. Echte API-Ergebnisse werden lokal zwischengespeichert und können danach offline angesehen werden. Der bereits vorliegende Charakterstand ist in der Datenbank als manuell bestätigte Startauswahl hinterlegt; in der Heileransicht ist das Weisheit-Brustteil ausdrücklich **nur geplant**, nicht als getragen bestätigt. Die bereits vorhandenen lokalen Häkchen, Zauber und Talente verwenden weiter ihren unveränderten bisherigen \`localStorage\`-Schlüssel.

**Vergleich:** Gewichtete Vergleichspunkte sind ausschließlich eine **heuristische Orientierung**, keine WoW-Forever-DPS-, HPS- oder Tank-Simulation. Fehlende Werte bleiben als unbekannt kenntlich. Setboni, Effekte, Verzauberungen und tatsächliche Klassentauglichkeit müssen vor einer Empfehlung geprüft werden.

**Backup / Synchronisierung:** Der Gear-Builder bietet **separaten JSON-Export und -Import** für Items, Profile und Wunschliste; der Import bestätigt vor dem Überschreiben. Das bisherige App-Backup betrifft die übrigen Häkchen. Die IndexedDB synchronisiert **nicht** geräteübergreifend und schreibt **nicht** automatisch in den privaten GitHub-Tracker. Für geräteübergreifende Synchronisierung wäre ein geschütztes Backend nötig. Derzeit ist **keine** zentral gehostete Datenbank eingerichtet. Bei Browser-Datenlöschung ohne Backup können die lokalen Profile verloren gehen.

**API-Verfügbarkeit:** Die Suche benötigt Internet, zuvor geladene Datensätze und Profile nicht. Ein Server- oder CORS-Fehler darf weder die bestehende Guide-App noch die gespeicherten lokalen Daten beschädigen.

**Technische Prüfung:** Scripte auf Syntax und Verknüpfung zu HTML/Cache prüfen; ein vollständiger Interaktionstest auf iPhone bzw. gegen reale API-Antworten steht noch aus.
