# Plan: Home Room als gemütliches Wohnzimmer

## Ziel
Den bestehenden Home Room „Eingangshalle“ in ein bewohntes, gemütliches Wohnzimmer verwandeln, ohne die durchgehend laufende VR-Szene oder den Wechsel zum Neuro-Raum zu verändern.

## Gestaltung
- **Farbwelt:** Terrakotta `#B85C3B`, Oliv `#657153`, warmes Elfenbein `#F3E7D3` und Holzbraun `#8B5E3C`.
- **Stil:** klassisch-elegant, warm beleuchtet, mit Perserteppich und dunklen Holzdetails statt einer sterilen Ausstellungshalle.
- **Anordnung:** asymmetrische, bewohnte Ecken mit freiem Lauf- und Teleportbereich in der Mitte.
- **Schrift:** Libre Baskerville für Raumtitel, IBM Plex Sans für kurze Hinweise und Beschriftungen.

## Umsetzung
1. **Wohnzimmer als eigene 3D-Ausstattung ergänzen**
   - Sofa mit Polstern und Armlehnen in Oliv.
   - Niedriges TV-Möbel mit Fernseher gegenüber dem Sofa.
   - Perserteppich aus mehreren flachen, detaillierten Formen in Terrakotta, Elfenbein und gedecktem Rot.
   - Schreibtisch-Ecke mit Holzschreibtisch, Computerbildschirm, Tastatur, Stuhl und warmer Arbeitslampe.
   - Mehrere Zimmerpflanzen mit Töpfen, Stielen und Blättern in unterschiedlichen Größen.
   - Deckenlampe mit sichtbarem Schirm und warmem Lichtkegel.

2. **Fenster und Landschaft gestalten**
   - Großes gerahmtes Fenster in einer freien Wandfläche.
   - Helle Aussicht mit grünen Feldern, Heckenlinien, sanften Hügeln und Himmel als räumlich geschichtete Szene hinter dem Fenster.
   - Dezentes Tageslicht vom Fenster ergänzt die warme Innenbeleuchtung.

3. **Raumwirkung verbessern**
   - Boden optisch als warmer Holz-/Parkettboden ausführen und die Wände in warmem Elfenbein halten.
   - Lichtquellen so abstimmen, dass Sofa, Teppich und Arbeitsplatz lesbar bleiben, ohne harte Blendung in VR.
   - Möbel mit Schatten und unterschiedlichen Materialoberflächen ausstatten, damit Holz, Stoff, Pflanzen und Metall unterscheidbar sind.

4. **Bestehende Funktionen bewahren**
   - Ausstattung nur im Home Room anzeigen; der Neuro-Raum bleibt unverändert.
   - Portal nach „Neuro-Raum“, Quiz-Station, Erinnerungsobjekte, Klickflächen und Teleportboden bleiben erreichbar.
   - Freie Wege um Spawnpunkt und Portal sicherstellen; keine Möbel blockieren Navigation oder Blickrichtung.
   - Die eine dauerhaft montierte VR-Szene bleibt bestehen, damit ein Raumwechsel die VR-Sitzung nicht beendet.

## Technische Details
- Möbel und Landschaft werden als kleine, wiederverwendbare React-Three-Fiber-Komponenten aus performanten Grundformen gebaut; es sind keine externen Modell-Downloads nötig.
- Farben werden zentral als benannte Wohnzimmer-Materialwerte gehalten, statt über die Darstellung verteilt zu werden.
- Die Einrichtung wird innerhalb des bestehenden `RoomRenderer` anhand des Home-Room-Merkmals eingebunden.
- Beleuchtung bleibt auf wenige gezielte Lichtquellen begrenzt, um Desktop und Headset flüssig zu halten.

## Prüfung
- Home Room auf Desktop in mehreren Blickrichtungen prüfen.
- Portal anklicken und Rückweg testen.
- Teleportierbare Bodenfläche und freie Laufwege prüfen.
- Darstellung bei breitem und mobilem Bildschirm kontrollieren.
- Fehlerprotokolle und finalen Build-Status prüfen.
