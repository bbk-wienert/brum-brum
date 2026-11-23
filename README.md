# Brum Brum 🏁

3D-Autorennen im Browser: Zeitfahren allein, Duell zu zweit an einer Tastatur oder online von zwei Geräten im selben WLAN.

## Starten

```
node server.js
```

Dann im Browser **http://localhost:8080** öffnen. Andere Geräte im WLAN nutzen die Adresse, die der Server beim Start anzeigt.
Es werden keine zusätzlichen Pakete gebraucht, nur [Node.js](https://nodejs.org).

## Features

- 6 Strecken mit eigenen Welten: Sonnenring 🌳, Eispass ❄️, Momiji-Tōge ⛩️, Neon-Tokio 🌃, Vulkankrater 🌋, Wüsten-Canyon 🏜️
  - Momiji-Tōge: japanischer Bergpass in der Abenddämmerung mit Haarnadel-Serpentinen, Leitplanken, Torii-Tor, Zedern & Ahorn
  - Neon-Tokio: Leuchtreklamen, Getränkeautomaten, japanische Straßenmarkierung
- Street-Racing-Look: Nachtrennen (im Menü abschaltbar), Neon-Design, Unterbodenlicht, Bodykit mit Heckflügel, Vinyl-Streifen und Chromfelgen
- **Nitro** (Taste Q bzw. Strg rechts / `-` für Spieler 2): blaue Flammen, Weitwinkel-Effekt, Speed-Lines. Der Tank füllt sich durch Driften
- **Drift-Punkte** mit Multiplikator bei langen Drifts; ein Einschlag kostet den laufenden Drift
- Tacho mit Drehzahlring und Ganganzeige
- ASCII-Intros im Neon-Look: beim Öffnen der Seite (Felge aus Zeichen, Zoom in die Nabe, Warp, Logo – Klick/Taste überspringt) und beim Rennstart aus dem Menü (Strecke und Name zeichnen sich aus Zeichen, dann Countdown)
- Sprungschanzen, Turbo-Felder, Bremsspuren, Verfolgerkamera (Taste **C** wechselt)
- Power-Up-Würfel: Turbo, 3× Turbo, Raketen-Turbo, Schild, Sprung, Haftreifen, Superstern
  - nur mit Gegner (können auch dir selbst schaden): Ölfleck, Blitz, Risiko
- Rundenzeiten, Rekorde und Geist-Auto der Bestfahrt (im Browser gespeichert)
- Modi: 1 Spieler, 2 Spieler mit geteiltem Bildschirm, Online mit Raum-Code

## Steuerung

| | Spieler 1 / Allein | Spieler 2 |
|---|---|---|
| Fahren | W A S D (allein auch Pfeiltasten) | Pfeiltasten |
| Handbremse | Leertaste / Shift links | Shift rechts / Num 0 |
| Nitro | Q | Strg rechts / - |
| Power-Up | E | Enter |

Außerdem: **R** Neustart · **P** Pause · **M** Ton · **G** Geist · **C** Kamera · **Esc** Menü

## Eigene Bilder (Plakatwände & Videowand)

Bilder (jpg, png, webp, gif) im Ordner `bilder2/` erscheinen auf den beleuchteten Plakatwänden entlang jeder Strecke und auf der Videowand kurz vor der Ziellinie (wechselt alle 3,5 Sekunden). Querformat (16:9) passt am besten, andere Formate werden ohne Verzerren eingepasst. Solange der Ordner leer ist, steht dort „DEIN BILD HIER“.

Mit der Taste **B** werden überall (Zuschauer, Plakatwände, Videowand) die Bilder aus `bilder3/` benutzt, nochmal **B** schaltet zurück. Nach dem Einfügen die Seite neu laden. Die Bilder werden nicht mit ins Repo hochgeladen.

## Zuschauer-Bilder

Bilder (jpg, png, webp, gif) im Ordner `bilder1/` erscheinen als Zuschauer am Streckenrand und im Power-Up-Glücksrad. Der Ordner wird nicht mit ins Repo hochgeladen.

## Technik

- `index.html` – das ganze Spiel (Three.js für 3D)
- `server.js` – Webserver + Multiplayer (WebSocket, ohne Zusatzpakete)
- `three.min.js` – [Three.js](https://threejs.org) r158 (MIT-Lizenz)
