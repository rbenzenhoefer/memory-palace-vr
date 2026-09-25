# Importierte Lernobjekte in den Regalen anzeigen

## Ursache
Der Import hat funktioniert: alle 20 Objekte liegen im Speicher und sind mit Slot 0–19 eingetragen. Die 3D-Szene liest diese Einträge aber noch nirgends aus – bisher werden nur die Platzhalterwürfel in den Regalen gezeigt. Die Verbindung zwischen Import und Szene fehlt noch.

## Was gebaut wird
- Im WarehouseRoom lädt jedes Regalfach sein zugeordnetes 3D-Modell (Slot 0 = Regal 1 oben … Slot 19 = Regal 5 unten).
- Das Modell ersetzt den Platzhalterwürfel und wird automatisch auf Fachgröße (ca. 0,35 m) skaliert.
- Fächer ohne Objekt behalten den Platzhalterwürfel.
- Klick/Controller-Strahl auf ein Objekt öffnet die bekannte 3D-Infotafel: Frage als Titel, Antwort als Text.
- Während ein Modell lädt, pulsiert der Platzhalter; defekte Dateien fallen auf den Würfel zurück, ohne die Szene zu stören.

## Technische Details
- `palaceApi.ts`: neue Funktion `fetchLocusObjects(room)` → liest `locus_objects` (slot_index nicht null) und baut die öffentliche URL über `storage.from("locus-objects").getPublicUrl(glb_path)`.
- Hook `useLocusObjects("neuro")` mit react-query.
- `WarehouseRoom.tsx` übergibt je Regal die passenden Objekte an `ShelfRack`; `ShelfRack` rendert pro Slot entweder `GltfModel` (aus `LocusVisual`, in Suspense + ErrorBoundary) oder den Platzhalter.
- Klick zeigt `InfoPanel` mit einer aus question/answer gebildeten Karte.
- Vorerst nicht aufhebbar (nur anschauen); Greifen/Inventar für Regalobjekte kann danach folgen.
- Prüfung per Playwright: Lagerraum öffnen, Netzwerk-Requests auf die 20 GLB-Dateien, Screenshot der Regale.
