import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('mydb.sqlite', (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);", (err) => {
      if (err) {
        console.error("Table creation error:", err.message);
      } else {
        console.log("Table 'users' created or already exists.");
      }
    });
  }
});
