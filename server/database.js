import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'whisper.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const initDB = () => {
  // Profiles table - stores anonymous user profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      claim_token TEXT UNIQUE NOT NULL,
      created_at INTEGER NOT NULL,
      view_count INTEGER DEFAULT 0
    )
  `);

  // Reviews table - stores individual reviews
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      ratings TEXT NOT NULL,
      feedback_text TEXT,
      consent_given INTEGER NOT NULL,
      submitted_at INTEGER NOT NULL,
      ip_hash TEXT,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  // Review categories table - stores available rating categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_default INTEGER DEFAULT 1
    )
  `);

  // Insert default categories if they don't exist
  const defaultCategories = [
    'Communication',
    'Reliability',
    'Professionalism',
    'Quality of Work',
    'Collaboration'
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (name, is_default) VALUES (?, 1)
  `);

  defaultCategories.forEach(category => {
    insertCategory.run(category);
  });

  console.log('✅ Database initialized successfully');
};

// Initialize database on import
initDB();

export default db;
