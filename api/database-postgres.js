import { sql } from '@vercel/postgres';

// Database initialization for Vercel Postgres
const initDB = async () => {
  try {
    // Create profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        claim_token TEXT UNIQUE NOT NULL,
        created_at BIGINT NOT NULL,
        view_count INTEGER DEFAULT 0
      )
    `;

    // Create reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        ratings TEXT NOT NULL,
        feedback_text TEXT,
        consent_given INTEGER NOT NULL,
        submitted_at BIGINT NOT NULL,
        ip_hash TEXT,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      )
    `;

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        is_default INTEGER DEFAULT 1
      )
    `;

    // Insert default categories
    const defaultCategories = [
      'Communication',
      'Reliability',
      'Professionalism',
      'Quality of Work',
      'Collaboration'
    ];

    for (const category of defaultCategories) {
      await sql`
        INSERT INTO categories (name, is_default)
        VALUES (${category}, 1)
        ON CONFLICT (name) DO NOTHING
      `;
    }

    console.log('✅ Vercel Postgres database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Database adapter to match the SQLite interface
const db = {
  query: async (query, params = []) => {
    try {
      // Convert $1, $2 style params to work with Vercel Postgres
      const result = await sql.query(query, params);
      return result.rows || [];
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  },

  queryOne: async (query, params = []) => {
    try {
      const result = await sql.query(query, params);
      return result.rows && result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('QueryOne error:', error);
      throw error;
    }
  }
};

// Initialize database on first import
let initialized = false;
if (!initialized) {
  initDB().catch(console.error);
  initialized = true;
}

export default db;
