# Brum Brum 🏁

3D-Autorennen im Browser: Zeitfahren allein, Duell zu zweit an einer Tastatur oder online von zwei Geräten im selben WLAN.

## Starten

```
node server.js
```

Dann im Browser **http://localhost:8080** öffnen. Andere Geräte im WLAN nutzen die Adresse, die der Server beim Start anzeigt.
Es werden keine zusätzlichen Pakete gebraucht, nur [Node.js](https://nodejs.org).

## Features

- 5 Strecken mit eigenen Welten: Sonnenring 🌳, Eispass ❄️, Nachtstadt 🌃, Vulkankrater 🌋, Wüsten-Canyon 🏜️
- Sprungschanzen, Turbo-Felder, Bremsspuren, Verfolgerkamera (Taste **C** wechselt)
- Power-Up-Würfel: Turbo, Schild, Sprung, Ölfleck, Blitz
- Rundenzeiten, Rekorde und Geist-Auto der Bestfahrt (im Browser gespeichert)
- Modi: 1 Spieler, 2 Spieler mit geteiltem Bildschirm, Online mit Raum-Code

## Steuerung

| | Spieler 1 / Allein | Spieler 2 |
|---|---|---|
| Fahren | W A S D (allein auch Pfeiltasten) | Pfeiltasten |
| Handbremse | Leertaste / Shift links | Shift rechts / Strg rechts / Num 0 |
| Power-Up | E / Q | Enter |

Außerdem: **R** Neustart · **P** Pause · **M** Ton · **G** Geist · **C** Kamera · **Esc** Menü

## Zuschauer-Bilder

Bilder (jpg, png, webp, gif) im Ordner `hot/` erscheinen als Zuschauer am Streckenrand und im Power-Up-Glücksrad. Der Ordner wird nicht mit ins Repo hochgeladen.

## Technik

- `index.html` – das ganze Spiel (Three.js für 3D)
- `server.js` – Webserver + Multiplayer (WebSocket, ohne Zusatzpakete)
- `three.min.js` – [Three.js](https://threejs.org) r158 (MIT-Lizenz)
