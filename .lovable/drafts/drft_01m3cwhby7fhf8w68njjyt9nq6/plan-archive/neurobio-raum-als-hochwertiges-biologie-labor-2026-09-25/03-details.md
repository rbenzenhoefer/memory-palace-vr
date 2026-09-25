## Umsetzung

1. **Eigenständige Laborszene**
   - Eine ausschließlich für den Neuro-Raum verwendete 3D-Inneneinrichtung ergänzen.
   - Boden-, Wand- und Deckenmaterialien sowie Beleuchtung speziell für diesen Raum definieren, ohne andere Räume zu verändern.

2. **Laborarchitektur und Ausstattung**
   - Modulare Arbeitstische, Unterbauschränke, offene Ablagen und eine zentrale Laborinsel bauen.
   - Mikroskop, Monitor, Tastatur, Petrischalen, Reagenzgläser, Flaschen, Spüle und Armatur als leichtgewichtige 3D-Objekte hinzufügen.
   - Eine Neuroanatomie-Tafel und eine beleuchtete Präparatevitrine an den Wänden platzieren.
   - Deckenelemente und mehrere gerichtete Arbeitsleuchten sorgen für Tiefe statt flacher Gesamtbeleuchtung.

3. **Raumgefühl und Laufwege**
   - Möblierung an den Wänden und um eine kompakte Mittelinsel gruppieren.
   - Spawnpunkt, Portale, Podeste und die Wege zwischen allen interaktiven Objekten freihalten.
   - Größen und Positionen für Augenhöhe und Bewegung in VR auslegen.

4. **Bestehende Funktionen bewahren**
   - Die Daten und Positionen der Neuro-Lernobjekte nicht verändern.
   - Greifen, Tragen, Ablegen, Inventar, Lernkarten, Controllerstrahlen, Teleportation und Joystick-Laufen unverändert weiterverwenden.
   - Der Raum bleibt Teil des persistenten XR-Canvas; es entsteht keine neue Browserseite.

## Technische Leitplanken

- Neue Laborbestandteile bleiben in einer raumspezifischen Komponente; der gemeinsame Raum-Renderer wählt sie nur für `neuro` aus.
- Materialien und Geometrien werden wiederverwendet und bleiben performant genug für zwei VR-Augen.
- Keine Datenbank- oder Speicheränderungen.
- Prüfung auf Desktop und Mobilgerät: Raum sichtbar, Lernobjekte erreichbar, Portale frei, keine Laufwegüberschneidungen oder Laufzeitfehler. Die abschließende Komfortprüfung im echten Headset bleibt erforderlich.
