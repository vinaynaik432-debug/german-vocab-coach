#!/bin/zsh
cd "$(dirname "$0")"

echo "Starting German Vocab Coach..."
echo
echo "Keep this window open while using the app."
echo "Press Ctrl+C here when you want to stop it."
echo

python3 -m http.server 4173 --bind 127.0.0.1 &
SERVER_PID=$!

sleep 1
open "http://127.0.0.1:4173/"

wait $SERVER_PID
