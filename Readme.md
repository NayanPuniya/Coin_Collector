# Coin Collector – Multiplayer State Synchronization

This project implements a simple real-time multiplayer game using a lightweight client–server model with no networking middleware. 
The goal is to demonstrate latency handling, interpolation, and authoritative game state control.

---
## How the Game Works

### Server (`server/server.js`)
- Maintains the authoritative world state.
- Tracks player positions, coin positions, and scores.
- Processes only movement intent from clients.
- Updates game state at a fixed tick rate (50 ms).
- Spawns coins at random intervals.
- Validates coin collisions and scoring.
- Simulates ~200 ms artificial network latency for both incoming and outgoing messages.
- Broadcasts state snapshots to all connected clients.

### Client (`client/client.js`)
- Connects to the server via WebSocket.
- Sends user input (W/A/S/D) as directional intent.
- Does not calculate game state locally.
- Renders the server-provided state on an HTML5 canvas.
- Uses interpolation by buffering snapshots and rendering slightly behind real time to smooth remote player movement under latency.

---

## How to Run

From the project root:

1. Initiate npm:
$ cd server
$ npm init -y   # optional, if you want a package.json
$ npm install ws
$ cd ..

2. Make the script executable:
$ chmod +x game_run.sh

3. Run the script:
$ ./run_game.sh

This will:
- Start the server
- Start the client static server
- Open two browser windows representing Player 1 and Player 2

---

## Notes

- The game uses a simple 2D map with randomly spawning coins.
- The server is fully authoritative, preventing client-side cheating.
- Interpolation ensures smooth motion even with simulated network delay.
- This setup is intended for demonstration purposes as part of a multiplayer networking assignment.

