import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'coffee.db');
const db = new Database(dbPath);

const username = 'admin';
const password = 'password123'; // Default password

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);


const stmt = db.prepare('SELECT id FROM users WHERE username = ?');
const user = stmt.get(username);

if (!user) {
  const hash = bcrypt.hashSync(password, 10);
  const insert = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  insert.run(username, hash);
  console.log(`Admin user created with username: ${username} and password: ${password}`);
} else {
  console.log('Admin user already exists.');
}

db.close();
