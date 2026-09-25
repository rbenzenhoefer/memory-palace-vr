# Plan: VR-Handling und Controllergefühl überarbeiten

## Ziel
Die Fortbewegung soll in beiden Augen stabil bleiben, das Greifen soll sich wie echtes Halten anfühlen, die Y-Taste soll ein anvisiertes Objekt direkt verstauen und die vertikale Sicht soll weich statt in Sprüngen reagieren.

## Umsetzung

1. **Stabile Bewegung für beide Augen**
   - Die Position und Drehung des VR-Ursprungs nur noch innerhalb des Bildzyklus verändern, statt parallel dazu bei jedem Bild einen React-/Zustands-Render auszulösen.
   - Kopfposition und Blickrichtung aus einer konsistenten XR-Pose ableiten und horizontale Bewegung weiterhin auf den Boden begrenzen.
   - Die gespeicherte Spielerposition nur kontrolliert synchronisieren, damit Teleport und Raumwechsel weiter funktionieren, ohne die laufende Stereoansicht zu stören.
   - Linken Stick mit der von der installierten XR-Version bereitgestellten `xr-standard-thumbstick`-Belegung lesen; Vorwärts/Rückwärts und Seitwärtsbewegung bleiben kopfbezogen.

2. **Weiche vertikale Sicht**
   - Rechte Stick-Y-Achse als stufenlose Neigung mit Deadzone, Delta-Zeit und sanfter Dämpfung umsetzen.
   - Die Neigung begrenzen und um den aktuellen Kopfpunkt anwenden, damit beide Augen dieselbe Transformation erhalten und die natürliche Kopfbewegung erhalten bleibt.
   - Horizontales Drehen bleibt wie gewünscht auf dem rechten Stick; die vorhandenen abrupten 30°-Schritte werden durch eine weiche, geschwindigkeitsabhängige Drehung ersetzt, damit sich die gesamte Blicksteuerung einheitlich anfühlt.

3. **Y-Taste verstaut das anvisierte Objekt**
   - Das aktuell vom Controllerstrahl anvisierte portable Locus zentral verfolgen.
   - Die Y-Taste über die installierte Controller-Profil-API (`y-button`) einmal pro Tastendruck behandeln.
   - Das Ziel atomar direkt ins Inventar verschieben, ohne es vorher sichtbar in die Hand zu nehmen; bei vollem Inventar bleibt es im Raum und der Gürtel blinkt rot.
   - Nicht-portable Objekte und leeres Anvisieren bleiben ohne Wirkung.

4. **Natürliches Halten auf Handhöhe**
   - Beim Greifen die Pose des auslösenden Controllers beziehungsweise der Hand festhalten.
   - Das Objekt mit einem kurzen, stabilen Abstand an die Grip-/Hand-Pose binden statt an das entfernte Ende des Zielstrahls.
   - Position und vollständige Handrotation pro Bild übernehmen und den ursprünglichen Rotationsversatz bewahren; Mausbedienung bleibt unverändert.
   - Ablegen auf Boden, Sockel oder Inventargürtel sowie Hand-Pinch und Controllerstrahl bleiben erhalten.

5. **Prüfung**
   - Typprüfung und Vorschau ohne neue Laufzeitfehler prüfen.
   - Desktop-Aufheben, Ablegen und Inventar erneut testen, damit die bestehende Bedienung nicht zurückfällt.
   - XR-Logik mit simulierten Controllerzuständen für Bewegung, Drehung, Y-Taste, Inventar-voll und Handpose absichern.
   - Abschließend bleiben als reale Headset-Prüfung: Stereo-Stabilität, Komfort der vertikalen Neigung und gerätespezifische Y-Belegung.

## Technische Leitplanken
- Ein einziges, dauerhaft gemountetes Canvas/XR bleibt bestehen.
- Teleportation und beide Pointer-Strahlen bleiben parallel zur Stick-Steuerung aktiv.
- Keine Datenbankänderung und keine dauerhafte Speicherung der Objektpositionen.
- Keine Änderungen an Raumgestaltung oder nicht-portablen Dekorationen.
