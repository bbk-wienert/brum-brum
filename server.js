// Lokaler Webserver + Multiplayer-Server für Brum Brum (ohne Zusatzpakete).
// Start:  node server.js   (optional Port: node server.js 3000)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = Number(process.argv[2]) || 8080;
const ROOT = __dirname;
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.ico':'image/x-icon' };

function lanIPs(){
  const ips = [];
  for (const list of Object.values(os.networkInterfaces()))
    for (const a of list || []) if (a.family === 'IPv4' && !a.internal) ips.push(a.address);
  return ips;
}

// ---------- Dateien ausliefern ----------
const server = http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0]); } catch { res.writeHead(400); return res.end(); }
  if (p === '/api/hot') { // Liste der Zuschauer-Bilder im Ordner "hot"
    fs.readdir(path.join(ROOT, 'hot'), (err, files) => {
      const list = err ? [] : files.filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f)).sort();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify(list));
    });
    return;
  }
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT) || path.basename(file) === 'server.js') { res.writeHead(403); return res.end('Verboten'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Nicht gefunden'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// ---------- Minimaler WebSocket-Server ----------
function wsSend(socket, str){
  if (!socket.writable) return;
  const p = Buffer.from(str);
  let h;
  if (p.length < 126) h = Buffer.from([0x81, p.length]);
  else if (p.length < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 126; h.writeUInt16BE(p.length, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 127; h.writeBigUInt64BE(BigInt(p.length), 2); }
  socket.write(Buffer.concat([h, p]));
}

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key || String(req.headers.upgrade).toLowerCase() !== 'websocket') return socket.destroy();
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  socket.setNoDelay(true);

  const client = { socket, room: null, send(o){ wsSend(socket, JSON.stringify(o)); } };
  let buf = Buffer.alloc(0), frags = [];

  socket.on('data', d => {
    buf = Buffer.concat([buf, d]);
    while (buf.length >= 2) {
      const fin = buf[0] & 0x80, op = buf[0] & 0x0f, masked = buf[1] & 0x80;
      let len = buf[1] & 0x7f, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (len > 1e6) return socket.destroy();
      const maskOff = off; if (masked) off += 4;
      if (buf.length < off + len) return;
      let payload = Buffer.from(buf.subarray(off, off + len));
      if (masked) for (let i = 0; i < payload.length; i++) payload[i] ^= buf[maskOff + (i & 3)];
      buf = buf.subarray(off + len);
      if (op === 8) { try { socket.write(Buffer.from([0x88, 0])); } catch {} socket.end(); return; }
      if (op === 9) { if (socket.writable) socket.write(Buffer.concat([Buffer.from([0x8A, payload.length]), payload])); continue; }
      if (op === 1 || op === 0) {
        frags.push(payload);
        if (fin) { const msg = Buffer.concat(frags).toString(); frags = []; onMessage(client, msg); }
      }
    }
  });
  socket.on('close', () => leaveRoom(client));
  socket.on('error', () => leaveRoom(client));
});

// ---------- Räume ----------
const rooms = new Map();
function makeCode(){
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; let c;
  do { c = Array.from({ length: 4 }, () => L[Math.floor(Math.random() * L.length)]).join(''); } while (rooms.has(c));
  return c;
}

function onMessage(c, str){
  let m; try { m = JSON.parse(str); } catch { return; }
  if (!m || typeof m.t !== 'string') return;
  switch (m.t) {
    case 'create': {
      leaveRoom(c);
      const room = { code: makeCode(), members: [c] };
      rooms.set(room.code, room); c.room = room;
      c.send({ t: 'created', code: room.code, ips: lanIPs(), port: PORT });
      console.log(`Raum ${room.code} erstellt`);
      break;
    }
    case 'join': {
      const room = rooms.get(String(m.code || '').toUpperCase().trim());
      if (!room) return c.send({ t: 'err', msg: 'Raum nicht gefunden. Code richtig?' });
      if (room.members.includes(c)) return;
      if (room.members.length >= 2) return c.send({ t: 'err', msg: 'Der Raum ist schon voll.' });
      leaveRoom(c);
      room.members.push(c); c.room = room;
      c.send({ t: 'joined', code: room.code });
      room.members[0].send({ t: 'peer' });
      console.log(`Spieler ist Raum ${room.code} beigetreten`);
      break;
    }
    case 'leave': leaveRoom(c); break;
    case 'start': // nur der Host darf starten; geht an beide gleichzeitig
      if (c.room && c.room.members[0] === c && c.room.members.length === 2)
        for (const x of c.room.members) x.send({ t: 'start', track: m.track, laps: m.laps, pu: !!m.pu });
      break;
    default: // alles andere an den anderen Spieler weiterleiten
      if (c.room) for (const x of c.room.members) if (x !== c) x.send(m);
  }
}

function leaveRoom(c){
  const r = c.room; if (!r) return;
  c.room = null;
  const i = r.members.indexOf(c); if (i < 0) return;
  r.members.splice(i, 1);
  if (i === 0) { // Host weg -> Raum schließen
    for (const x of r.members) { x.room = null; x.send({ t: 'left', closed: true }); }
    rooms.delete(r.code);
    console.log(`Raum ${r.code} geschlossen`);
  } else {
    for (const x of r.members) x.send({ t: 'left', closed: false });
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('Brum Brum läuft!');
  console.log(`  Auf diesem PC:    http://localhost:${PORT}`);
  for (const ip of lanIPs()) console.log(`  Im WLAN/Netzwerk: http://${ip}:${PORT}`);
  console.log('Beenden mit Strg+C');
});
