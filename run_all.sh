#!/bin/bash

# Run bun server.ts in the background
bun server.ts &

# Navigate to the frontend directory and start the React app in the background
cd FRONTEND-react && bun start &

echo "Server and frontend started in the background."
