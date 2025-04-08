import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import LoggerABI from "../artifacts/contracts/DBLogger.sol/DBLogger.json";
import { id } from "../ignition/modules/logger";

// Setup SQLite
const db = await open({
  filename: "./mydb.sqlite",
  driver: sqlite3.Database,
});

// Ethereum Setup
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = new ethers.Wallet(
  process.env.PRIVATE_KEY || "0xxac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);
const logger = new ethers.Contract(
  process.env.CONTRACT_ADDRESS|| "0xx5FbDB2315678afecb367f032d93F642f64180aa3",
  LoggerABI.abi,
  signer
);

// Main unified CRUD function
export async function dbAction(
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
    const stmt = await db.prepare(
      `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`
    );
    const result = await stmt.run(values);

    const newId = result.lastID;
    if (newId === undefined) {
      throw new Error("Failed to retrieve the last inserted ID.");
    }

    const jsonString = JSON.stringify(rowData);
    const dataHash = ethers.id(jsonString);

    await logger.logChange("INSERT", table, newId.toString(), dataHash, jsonString);
    console.log(`✅ INSERTED into ${table}: ID ${newId}`);
    return newId;
  }

  if (action === "UPDATE") {
    // console.log(rowId, "rowId");
    if (!rowId) throw new Error("UPDATE requires rowId");

    const keys = Object.keys(rowData);
    const values = Object.values(rowData);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const stmt = await db.prepare(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`
    );
    await stmt.run([...values, rowId]);

    const jsonString = JSON.stringify(rowData);
    const dataHash = ethers.id(jsonString);

    await logger.logChange("UPDATE", table, rowId.toString(), dataHash, jsonString);
    console.log(`✏️ UPDATED ${table} ID ${rowId}`);
    return rowId;
  }

  if (action === "DELETE") {
    if (!rowId) throw new Error("DELETE requires rowId");

    const stmt = await db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    await stmt.run([rowId]);

    const deletePlaceholder = JSON.stringify({ command: `DELETE FROM ${table} WHERE id = ?` });
    const dataHash = ethers.id("DELETED");

    await logger.logChange("DELETE", table, rowId.toString(), dataHash, deletePlaceholder);
    console.log(`🗑️ DELETED ${table} ID ${rowId}`);
    return rowId;
  }

  if (action === "SELECT") {
    const rows = await db.all(`SELECT * FROM ${table}`);
    console.log(`📋 Selected ${rows.length} rows from ${table}`);
    return rows;
  }
}

// Example call

// await dbAction("INSERT", "users", {
//   name: "Sayeem Ahmed",
//   email: "joe.mama@example.com"
// });



await dbAction("UPDATE", "users", {
  name: "POTATO TOMATO"
}, 1);


// await dbAction("DELETE", "users", {}, 1);