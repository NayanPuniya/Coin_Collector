// client/client.js
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const socket = new WebSocket("ws://localhost:8080");

let myId = null;
let buffer = [];
const INTERPOLATION_DELAY = 200;

socket.onmessage = (e) => {
    const data = JSON.parse(e.data);

    if (data.type === "state") {
        buffer.push(data);

        if (buffer.length > 20) buffer.shift();
    }
};

// Movement input
let input = { dx: 0, dy: 0 };

document.addEventListener("keydown", (e) => {
    if (e.key === "w") input.dy = -1.5;
    if (e.key === "s") input.dy = 1.5;
    if (e.key === "a") input.dx = -1.5;
    if (e.key === "d") input.dx = 1.5;

    socket.send(JSON.stringify({ type: "input", ...input }));
});

document.addEventListener("keyup", (e) => {
    if (["w", "s"].includes(e.key)) input.dy = 0;
    if (["a", "d"].includes(e.key)) input.dx = 0;

    socket.send(JSON.stringify({ type: "input", ...input }));
});

// Interpolation function
function interpolatePlayer(id, renderTime) {
    for (let i = 0; i < buffer.length - 1; i++) {
        const a = buffer[i];
        const b = buffer[i + 1];

        if (a.ts <= renderTime && renderTime <= b.ts) {
            let pa = a.players.find((p) => p.id === id);
            let pb = b.players.find((p) => p.id === id);

            if (!pa || !pb) return pa;

            const t = (renderTime - a.ts) / (b.ts - a.ts);

            return {
                x: pa.x + (pb.x - pa.x) * t,
                y: pa.y + (pb.y - pa.y) * t,
                score: pb.score
            };
        }
    }

    const last = buffer[buffer.length - 1];
    return last.players.find((p) => p.id === id);
}

// Rendering loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    const renderTime = now - INTERPOLATION_DELAY;

    if (buffer.length < 2) {
        requestAnimationFrame(draw);
        return;
    }

    const latest = buffer[buffer.length - 1];

    // Draw coins
    latest.coins.forEach((c) => {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw players
    latest.players.forEach((p) => {
        let pos = interpolatePlayer(p.id, renderTime);

        if (!pos) return;

        ctx.fillStyle = p.id === latest.players[0].id ? "cyan" : "red";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.fillText("P" + p.id + " (" + p.score + ")", pos.x + 15, pos.y - 15);
    });

    requestAnimationFrame(draw);
}
draw();
