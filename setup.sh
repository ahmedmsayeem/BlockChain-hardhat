#!/bin/bash

# Compile the smart contract
bunx hardhat compile

# Start a local Hardhat node in the background
# bunx hardhat node &

# Wait for a few seconds to ensure the Hardhat node is running
# sleep 5

# Deploy the contract using Hardhat Ignition
bunx hardhat ignition deploy ignition/modules/logger.js --network localhost

# Copy the content of DBLogger.json to the React frontend directory
cp artifacts/contracts/DBLogger.sol/DBLogger.json FRONTEND-react/src/DBLogger.json