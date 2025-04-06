import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import LoggerABI from "../artifacts/contracts/DBLogger.sol/DBLogger.json";

// Setup SQLite
const db = await open({
  filename: "./mydb.sqlite",
  driver: sqlite3.Database,
});

// Ethereum Setup
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
const logger = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", LoggerABI.abi, signer);

// Main unified CRUD function
async function dbAction(
  action: "INSERT" | "UPDATE" | "DELETE" | "SELECT",
  table: string,
  rowData: Record<string, any> = {},
  rowId?: number
) {
  if (!["INSERT", "UPDATE", "DELETE", "SELECT"].includes(action)) {
    throw new Error(`Unsupported action: ${action}`);
  }

  if (action === "INSERT") {
    const keys = Object.keys(rowData);
    const values = Object.values(rowData);
    const placeholders = keys.map(() => "?").join(", ");
    const stmt = await db.prepare(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`);
    const result = await stmt.run(values);

    const newId = result.lastID;
    if (newId === undefined) {
      throw new Error("Failed to retrieve the last inserted ID.");
    }
    const dataHash = ethers.id(JSON.stringify(rowData));
    await logger.logChange("INSERT", table, newId.toString(), dataHash);
    console.log(`✅ INSERTED into ${table}: ID ${newId}`);
    return newId;
  }

  if (action === "UPDATE") {
    if (!rowId) throw new Error("UPDATE requires rowId");
    const keys = Object.keys(rowData);
    const values = Object.values(rowData);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const stmt = await db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`);
    await stmt.run([...values, rowId]);

    const dataHash = ethers.id(JSON.stringify(rowData));
    await logger.logChange("UPDATE", table, rowId.toString(), dataHash);
    console.log(`✏️ UPDATED ${table} ID ${rowId}`);
    return rowId;
  }

  if (action === "DELETE") {
    if (!rowId) throw new Error("DELETE requires rowId");
    const stmt = await db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    await stmt.run([rowId]);

    const dataHash = ethers.id("DELETED");
    await logger.logChange("DELETE", table, rowId.toString(), dataHash);
    console.log(`🗑️ DELETED ${table} ID ${rowId}`);
    return rowId;
  }

  if (action === "SELECT") {
    const rows = await db.all(`SELECT * FROM ${table}`);
    console.log(`📋 Selected ${rows.length} rows from ${table}`);
    return rows;
  }
}


await dbAction("DELETE", "users", {}, 1);