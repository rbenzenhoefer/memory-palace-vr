# Plan: WarehouseRoom

## Ziel
Einen leeren, klar ausgeleuchteten Lagerraum als neuen begehbaren Raum im bestehenden Memory Palace ergänzen. Der Zugang erfolgt über ein Portal im Home Room; beim Wechsel bleibt die einzige bestehende Canvas-/XR-Sitzung erhalten.

## Umsetzung
- Einen neuen Datenbankraum `warehouse` mit dem Titel „WarehouseRoom“ anlegen: 12 m lang, 8 m breit, 4 m hoch, passender Startpunkt und industrielle Farbwelt.
- Ein Portal vom Home Room zum Lagerraum sowie ein Rückportal zum Home Room hinzufügen.
- Eine eigene `WarehouseRoom`-Szene für die Raumausstattung bauen:
  - strukturierter grauer Betonboden mit matter PBR-Anmutung
  - helle industrielle Wände und einfache Decke
  - mehrere rechteckige Deckenleuchten mit sichtbaren Leuchtflächen
  - ausgewogene Umgebungs-, Flächen- und Punktbeleuchtung für klare räumliche Tiefe
  - keine Regale, Lernobjekte oder weitere Ausstattung
- Den bestehenden datengetriebenen `RoomRenderer` so erweitern, dass nur der Lagerraum diese Ausstattung erhält.
- Vorhandene VR-Funktionen unverändert weiterverwenden: bestehender „Enter VR“-Knopf, Teleportation, sanfte Fortbewegung, Controller-Pointer und Desktop-Orbit-Steuerung.

## Technische Leitplanken
- Keine zweite Canvas und keine neue Browser-Route; `WarehouseRoom` ist ein interner Palastraum, damit VR-Sitzung und Zustand erhalten bleiben.
- Die Bodenfläche bleibt das Teleportziel und nutzt exakt die Raumgrenzen 8 × 12 × 4 m.
- Keine externen Textur- oder Lichtdateien; die Betonwirkung entsteht lokal als prozedurale Textur.
- Seed-Daten werden idempotent per Migration ergänzt, inklusive der nötigen bestehenden Zugriffsregeln.

## Prüfung
- Typen und Preview-Build prüfen.
- Home → WarehouseRoom → Home im Browser durchspielen.
- Desktop-Darstellung bei 1280 × 1800 und einer mobilen Breite visuell prüfen.
- Sicherstellen, dass die Szene sichtbar, beleuchtet und ohne Laufzeitfehler ist; echte Headset-Prüfung bleibt geräteabhängig.
