// server/server.js
const WebSocket = require("ws");

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log("Game server running on ws://localhost:" + PORT);

const TICK_RATE = 50; // ms
const ARTIFICIAL_LATENCY = 200;

let players = {};
let coins = [];
let nextPlayerId = 1;

function delayed(fn) { setTimeout(fn, ARTIFICIAL_LATENCY); }
function randPos() { return { x: Math.random() * 1280, y: Math.random() * 720 }; }

// Coin spawner
setInterval(() => {
    coins.push({ id: Date.now(), ...randPos() });
}, 2000);

wss.on("connection", (ws) => {
    const id = nextPlayerId++;
    players[id] = { id, x: 300, y: 200, dx: 0, dy: 0, score: 0, ws };

    console.log("Player connected:", id);

    // Incoming message
    ws.on("message", (msg) => {
        delayed(() => {
            const data = JSON.parse(msg);

            if (data.type === "input") {
                players[id].dx = data.dx;
                players[id].dy = data.dy;
            }
        });
    });

    ws.on("close", () => {
        delete players[id];
        console.log("Player disconnected:", id);
    });
});

// Game loop
setInterval(() => {
    // Update players
    for (const id in players) {
        let p = players[id];

        p.x += p.dx * 3;
        p.y += p.dy * 3;

        // Collision check
        coins = coins.filter((c) => {
            const dx = p.x - c.x;
            const dy = p.y - c.y;

            if (dx * dx + dy * dy < 20 * 20) {
                p.score++;
                return false;
            }
            return true;
        });
    }

    // Create snapshot
    const snapshot = {
        type: "state",
        ts: Date.now(),
        players: Object.values(players).map((p) => ({
            id: p.id,
            x: p.x,
            y: p.y,
            score: p.score
        })),
        coins
    };

    // Broadcast snapshot with latency
    for (const id in players) {
        let p = players[id];
        delayed(() => {
            try {
                p.ws.send(JSON.stringify(snapshot));
            } catch (e) {}
        });
    }
}, TICK_RATE);
