import express, { type Request, type Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import dotenv from "dotenv";
import cors from "cors"; // Import the cors middleware
import { dbAction } from "./scripts/interaction"; // Import the dbAction function
dotenv.config();

const app = express();
const port = 4000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Database setup - mydb.sqlite for existing CRUD operations
const dbPromise = open({
  filename: "./mydb.sqlite",
  driver: sqlite3.Database,
});

// Middleware to attach the database connection to the request object
app.use(async (req, res, next) => {
  try {
    const db = await dbPromise;
    (req as any).db = db; // Attach the db object to the request
    next();
  } catch (error) {
    console.error("Failed to open database:", error);
    res.status(500).send("Failed to connect to the database");
  }
});

// New endpoint to execute a list of SQL commands - secondDb.sqlite
app.post("/execute-commands", async (req: Request, res: Response) => {
  const commands: string[] = req.body.commands;

  if (!Array.isArray(commands)) {
    return res.status(400).send("Invalid request body: commands must be an array of strings.");
  }

  let secondDb;
  try {
    secondDb = await open({
      filename: "./secondDb.sqlite",
      driver: sqlite3.Database,
    });

    // Reset the database: drop and recreate the `users` table
    await secondDb.exec(`
      DROP TABLE IF EXISTS users;
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `);

    const results: { command: string; status: string; error?: string }[] = [];

    // Reverse the order of the commands
    const reversedCommands = commands.slice().reverse();

    for (const command of reversedCommands) {
      try {
        await secondDb.exec(command);
        results.push({ command, status: "success" });
      } catch (error: any) {
        console.error(`Error executing: ${command}`, error.message);
        results.push({ command, status: "error", error: error.message });
        continue; // skip to next command
      }
    }

    res.status(200).json({
      message: "Executed all commands with success/error tracking.",
      results,
    });
  } catch (error) {
    console.error("Failed to open secondDb:", error);
    res.status(500).send(`Failed to open secondDb: ${error}`);
  } finally {
    if (secondDb) {
      await secondDb.close();
    }
  }
});
// CRUD operations
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const newId = await dbAction("INSERT", "users", { name, email });
    res.status(201).json({ id: newId, message: "User created successfully" });
  } catch (error) {
    console.error("Failed to insert user:", error);
    res.status(500).send("Failed to create user");
  }
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await dbAction("SELECT", "users");
    res.json(users);
  } catch (error) {
    console.error("Failed to select users:", error);
    res.status(500).send("Failed to retrieve users");
  }
});

app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const users = await dbAction("SELECT", "users");
    const user = users.find((user: any) => user.id === parseInt(id));
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Failed to get user:", error);
    res.status(500).send("Failed to retrieve user");
  }
});

app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    await dbAction("UPDATE", "users", { name, email }, parseInt(id));
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).send("Failed to update user");
  }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await dbAction("DELETE", "users", {}, parseInt(id));
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).send("Failed to delete user");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
