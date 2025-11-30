#!/bin/bash

echo "Starting Coin Collector server..."
cd server
node server.js &
SERVER_PID=$!
cd ..

echo "Starting client server on http://localhost:8081..."
cd client
python3 -m http.server 8081 &
CLIENT_PID=$!
cd ..

sleep 2

echo "Opening Player A and Player B in browser..."
xdg-open "http://localhost:8081" &
sleep 1
xdg-open "http://localhost:8081" &

echo ""
echo "==========================================="
echo "  Server PID : $SERVER_PID"
echo "  Client PID : $CLIENT_PID"
echo "==========================================="
echo "Press CTRL+C to stop all processes."
echo ""

wait
