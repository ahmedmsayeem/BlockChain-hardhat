import express from "express";
import {type Request,type Response } from "express";
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

// Database setup
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
