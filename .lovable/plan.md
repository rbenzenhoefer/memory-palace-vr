# Regal-Objekte greifbar machen

## Ursache
Es liegt nicht an den Ordnern: beide sind öffentlich und liefern die Modelle problemlos aus. Die Regal-Objekte werden bisher bewusst als reine "Anschau-Objekte" gezeichnet, nicht als tragbare Lernobjekte wie die Demo-Objekte im Neuro-Raum. Ihnen fehlt also nur die Greif-Logik.

## Was gebaut wird
- Jedes der 20 Regal-Objekte kann wie die anderen gegriffen, getragen, abgestellt, ins Inventar gelegt (auch mit der Y-Taste) und wieder herausgeholt werden.
- Ungegriffen steht es in seinem Regalfach, ca. 35 cm groß, und zeigt beim Anklicken weiterhin Frage und Antwort.
- Wird es anderswo abgestellt (auch in einem anderen Raum), erscheint es dort und das Fach bleibt leer (blauer Platzhalter).
- Wie bisher gilt das nur für die aktuelle Sitzung; nach dem Neuladen steht alles wieder im Regal.

## Technische Details
- Jedes Regal-Objekt wird in ein vollwertiges tragbares Lernobjekt umgewandelt: eigene ID (`lo-<id>`), `isPortable: true`, Modell-URL als fertiges Asset, Frage/Antwort als Karte.
- Im Regal wird dafür die bestehende `Locus`-Komponente (ohne Sockel) verwendet, damit Maus, Controller-Strahl, Handgriff, Hover-Effekt und Y-Taste denselben Weg nutzen wie bei den anderen Objekten.
- Das Fach zeigt das Objekt nur, solange es weder in der Hand, im Inventar noch anderswo abgestellt ist; abgestellte Objekte übernimmt die vorhandene Darstellung über den Zwischenspeicher der getragenen Objekte.
- Nach `Locus` kann die Anzeigegröße von 0,35 m übergeben werden, damit die Modelle in die Fächer passen.
- Keine Änderungen an Datenbank oder Speicher.
- Prüfung per Playwright: Objekt aus dem Regal greifen, auf dem Boden abstellen, ins Inventar legen und zurückholen.
