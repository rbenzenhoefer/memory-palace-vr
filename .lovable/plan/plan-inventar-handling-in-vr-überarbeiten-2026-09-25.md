# Plan: Inventar-Handling in VR überarbeiten

## Ziel
Objekte lassen sich auf Möbeln und anderen Gegenständen ablegen. Mit den Grifftasten (Mittelfinger) scrollst du durchs Inventar. Mit X legst du das ausgewählte Objekt direkt vor dir ab, ähnlich wie „Q“ in Minecraft.

## Umsetzung

1. **Auf anderen Objekten ablegen**
   - Beim Loslassen wird nicht mehr nur nach Boden und Sockeln gesucht. Die Suche prüft stattdessen alle festen Oberflächen im Raum, zum Beispiel Sofa, Tisch, Regalböden, Schreibtisch, andere Lernobjekte und den Scan-Boden.
   - Nicht als Ablage zählen: das gehaltene Objekt selbst, der Inventargürtel, Portale, Infotafeln, Beschriftungen und Lichtkörper.
   - Das Objekt landet auf der höchsten Oberfläche direkt darunter und steht aufrecht, mit seiner Drehung um die Hochachse. Wird nichts getroffen, geht es wie bisher an seinen alten Platz zurück.

2. **Durch das Inventar scrollen (Grifftasten)**
   - Linke Grifftaste: Auswahl einen Platz nach links. Rechte Grifftaste: einen Platz nach rechts. Jeder Tastendruck zählt einmal, und die Auswahl springt am Ende zum Anfang zurück.
   - Die Auswahl wird zentral gespeichert. Nach Einlagern, Herausnehmen oder Ablegen wird sie angepasst, damit sie immer auf einem belegten Platz liegt.
   - Der Gürtel und seine Großansicht markieren den ausgewählten Platz deutlich (Rahmen, leichte Vergrößerung, Name darüber). Wenn es mehr Objekte gibt, als sichtbar sind, läuft die Ansicht mit der Auswahl mit.
   - Das Greifen mit dem Zeigestrahl (Abzug) und das Greifen per Hand-Pinch bleiben unverändert.

3. **X legt das ausgewählte Objekt vor dir ab**
   - X nimmt das ausgewählte Objekt aus dem Inventar. Die Position liegt 45 cm vor dem Kopf in Blickrichtung, nur waagerecht betrachtet.
   - Von dort wird nach unten die nächste Oberfläche gesucht, mit derselben Logik wie in Punkt 1. Das Objekt landet also auf Tisch oder Boden und schwebt nicht in der Luft. Es ist zu dir gedreht.
   - Hältst du gerade ein Objekt in der Hand, bleibt es dort. X betrifft nur die Inventarauswahl.
   - Bei leerem Inventar passiert nichts. Wäre die Position außerhalb des Raums, wird sie an den Raumrand gesetzt.
   - Die Y-Taste (direkt einlagern) bleibt wie bisher.

4. **Desktop**
   - Die Inventarleiste zeigt dieselbe Auswahl. Dazu kommen optional Tasten: Q/E zum Scrollen und G zum Ablegen vor der Kamera. So lässt sich alles ohne Headset testen.

5. **Prüfung**
   - Typprüfung, Vorschau ohne Laufzeitfehler.
   - Im Browser prüfen: auf Sofa oder Tisch ablegen, Auswahl scrollen, vor der Kamera ablegen, Inventar leer. Klick-Ablage und Gürtel-Einlagern dürfen nicht kaputtgehen.
   - Offen für einen Test mit echtem Headset: die Belegung der Grifftasten und der Taste X auf deinem Controller.

## Technische Details
- In `palaceStore`: `selectedSlot` hinzufügen, dazu `selectNext(dir)` und `dropSelectedAt(room, pos, rot)`. Die Invariante (ein Objekt ist immer nur an einem Ort) bleibt erhalten, weil alles in einem Schritt passiert.
- In `grab.ts`: gemeinsame Funktion `findSurfaceBelow(scene, origin, exclude)`. Sie nutzt einen Raycaster auf die Szenen-Meshes und filtert nach `userData.noDrop`, nach Sichtbarkeit und nach dem `raycast`-Noop. `releaseHeld` und der Drop mit X verwenden sie beide.
- Nicht-Ablageflächen (Portal, InfoPanel, Gürtel, Text) bekommen `userData.noDrop`.
- In `ControllerActions`: `useXRControllerButtonEvent` für `xr-standard-squeeze` links und rechts sowie für `x-button` links.
- Keine Datenbankänderung. Das einzelne, dauerhaft gemountete Canvas bleibt bestehen.
