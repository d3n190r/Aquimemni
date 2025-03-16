#!/bin/bash

# Run Flask backend (port 5000)
cd src/backend && flask run --port 5000 &

# Run React frontend (port 3000)
cd src/frontend && npm start

# Kill both processes when script exits
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT