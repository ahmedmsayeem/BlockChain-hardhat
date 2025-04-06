import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import LoggerABI from "../artifacts/contracts/DBLogger.sol/DBLogger.json";

// Setup provider and signer (for querying, only provider is needed)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Create contract instance (read-only)
const logger = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  LoggerABI.abi,
  provider
);

async function getLogs() {
  const filter = logger.filters.DBChange(); // No filter args = get all DBChange events
  const logs = await logger.queryFilter(filter);

  if (logs.length === 0) {
    console.log("No logs found.");
    return;
  }

  console.log(`\n🧾 Found ${logs.length} logs:\n`);
  for (const log of logs) {

    const { operation, table, rowId, dataHash } = log.args;
    console.log(`🔹 Operation: ${operation}`);
    console.log(`📦 Table: ${log.args[1]}`);
    console.log(`🆔 Row ID: ${rowId}`);
    console.log(`🔐 Hash: ${dataHash}`);
    console.log("-----------------------------");
    // console.log(log.args);
  }
}

getLogs().catch(console.error);
