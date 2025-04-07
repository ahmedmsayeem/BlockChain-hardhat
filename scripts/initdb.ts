import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('mydb.sqlite', (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
    return;
  }

  console.log("✅ Connected to the SQLite database.");

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      age INTEGER NOT NULL
    );
  `;

  db.run(createUsersTable, (err) => {
    if (err) {
      console.error("❌ Table creation error:", err.message);
    } else {
      console.log("🛠️ Table 'users' created or already exists.");
    }
  });
});
