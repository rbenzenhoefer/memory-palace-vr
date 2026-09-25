## Tutorial-Ablauf
1. **Willkommen:** Zwei kurze Karten erklären Loci und mentale Routen; „Weiter“ ist als räumlicher 3D-Knopf anklickbar.
2. **Locus kennenlernen:** Das Neuron wird hervorgehoben. Erst eine echte Auswahl öffnet seine Information und bestätigt den Schritt.
3. **Platzieren:** Der Spieler greift Neuro-Loci mit den vorhandenen Maus-, Controller- oder Handinteraktionen und stellt sie an markierten Zielpunkten ab.
4. **Route bilden:** Neuron, Synapse, Hippocampus und Kortex werden nacheinander ausgewählt. Die gewählte Reihenfolge wird zentral als Route gespeichert.
5. **Route sehen:** Zwischen den aktuellen Objektpositionen entsteht eine bodennahe, animierte Linie mit Richtungspfeilen und nummerierten Markern.
6. **Route ablaufen:** Nur der nächste Abschnitt leuchtet. Die echte Interaktion mit dem erwarteten Locus schaltet den nächsten frei.
7. **Abschluss:** Eine Erfolgskarte bestätigt den ersten aufgebauten Gedächtnispalast und bietet „Noch einmal“ oder den Rückweg ins Wohnzimmer.

## Technische Details
- Eine zentrale, typisierte Zustandsmaschine verwaltet Phase, aktive Aufgabe, geordnete Locus-IDs, besuchte Stationen und Abschluss. Einzelne Karten besitzen keine eigene Ablaufentscheidung.
- Bestehende Greif-, Ablege- und Informationsereignisse erhalten kleine, gemeinsame Tutorial-Signale. Dadurch zählen nur tatsächliche 3D-Aktionen, keine Schein-Schaltflächen.
- Die vier Lernobjekte nutzen dieselben `Locus`-, Karten-, Asset- und Inventarwege wie heute; importierte GLB/GLTF-Modelle bleiben kompatibel.
- Ein eigener Tutorial-Raum und die Portale zum Wohnzimmer werden als additive Raumdaten vorbereitet. Die Datenänderung wird erst beim Akzeptieren dieses Entwurfs wirksam.
- Die Bodenroute wird aus den aktuellen Objektpositionen berechnet, liegt knapp über dem Boden und ignoriert Maus-/Controller-Strahlen, damit Teleport und Greifen nicht gestört werden.
- Alle Tutorial-Elemente bleiben innerhalb der dauerhaft aktiven 3D-Ansicht; es gibt keinen Seitenwechsel und keine zweite VR-Szene.
- Der Sitzungsfortschritt wird bewusst nicht im Browserkonto oder in der Datenbank gespeichert.

## Prüfung
- Kompletter Ablauf auf Desktop: Portal, Karten, Greifen, Platzieren, Reihenfolge, Route, geführter Rundgang, Abschluss und Neustart.
- Bestehende Räume, Portale, Inventar und Objektkarten auf Rückfälle prüfen.
- VR-nahe Eingaben automatisiert prüfen; Lesbarkeit, Kartenabstand, Handinteraktion und Komfort anschließend mit einem echten Headset bestätigen.
