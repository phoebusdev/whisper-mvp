import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// Rate limiting storage (in-memory for serverless)
const rateLimitStore = new Map();

// Helper functions
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const generateShortId = () => {
  return nanoid(10);
};

// Simple in-memory rate limiting
const checkRateLimit = (key, maxRequests, windowMs) => {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  rateLimitStore.set(key, record);

  return record.count <= maxRequests;
};

// Initialize database
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
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        ratings TEXT NOT NULL,
        feedback_text TEXT,
        consent_given INTEGER NOT NULL,
        submitted_at BIGINT NOT NULL,
        ip_hash TEXT
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
    const defaultCategories = ['Communication', 'Reliability', 'Professionalism', 'Quality of Work', 'Collaboration'];

    for (const category of defaultCategories) {
      await sql`
        INSERT INTO categories (name, is_default)
        VALUES (${category}, 1)
        ON CONFLICT (name) DO NOTHING
      `;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Initialize database once
let dbInitialized = false;

// Main handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Initialize database on first request
  if (!dbInitialized) {
    await initDB();
    dbInitialized = true;
  }

  const { url, method } = req;
  const path = url.replace(/^\/api/, '');

  try {
    // Health check
    if (path === '/health' && method === 'GET') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Get categories
    if (path === '/categories' && method === 'GET') {
      const { rows } = await sql`SELECT * FROM categories WHERE is_default = 1`;
      return res.json(rows);
    }

    // Create profile
    if (path === '/profiles' && method === 'POST') {
      const profileId = generateShortId();
      const claimToken = nanoid(32);
      const createdAt = Date.now();

      await sql`
        INSERT INTO profiles (id, claim_token, created_at)
        VALUES (${profileId}, ${claimToken}, ${createdAt})
      `;

      return res.json({
        profileId,
        claimToken,
        reviewLink: `/review/${profileId}`,
        viewLink: `/profile/${profileId}`
      });
    }

    // Get profile
    if (path.match(/^\/profiles\/[^/]+$/) && method === 'GET') {
      const profileId = path.split('/')[2];

      const { rows: profiles } = await sql`SELECT * FROM profiles WHERE id = ${profileId}`;

      if (profiles.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const profile = profiles[0];

      // Increment view count
      await sql`UPDATE profiles SET view_count = view_count + 1 WHERE id = ${profileId}`;

      // Get reviews
      const { rows: reviews } = await sql`
        SELECT id, ratings, feedback_text, submitted_at
        FROM reviews
        WHERE profile_id = ${profileId}
        ORDER BY submitted_at DESC
      `;

      const parsedReviews = reviews.map(review => ({
        ...review,
        ratings: typeof review.ratings === 'string' ? JSON.parse(review.ratings) : review.ratings,
        submitted_at: new Date(parseInt(review.submitted_at)).toISOString()
      }));

      // Calculate averages
      const categoryAverages = {};
      const categoryCounts = {};

      parsedReviews.forEach(review => {
        Object.entries(review.ratings).forEach(([category, rating]) => {
          if (!categoryAverages[category]) {
            categoryAverages[category] = 0;
            categoryCounts[category] = 0;
          }
          categoryAverages[category] += rating;
          categoryCounts[category]++;
        });
      });

      Object.keys(categoryAverages).forEach(category => {
        categoryAverages[category] = categoryAverages[category] / categoryCounts[category];
      });

      const overallAverage = Object.values(categoryAverages).length > 0
        ? Object.values(categoryAverages).reduce((a, b) => a + b, 0) / Object.values(categoryAverages).length
        : 0;

      return res.json({
        profileId,
        reviewCount: reviews.length,
        viewCount: profile.view_count + 1,
        overallAverage: parseFloat(overallAverage.toFixed(2)),
        categoryAverages,
        reviews: parsedReviews,
        createdAt: new Date(parseInt(profile.created_at)).toISOString()
      });
    }

    // Submit review
    if (path === '/reviews' && method === 'POST') {
      const ipHash = hashIP(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown');

      // Rate limiting
      if (!checkRateLimit(`review-${ipHash}`, 10, 60 * 60 * 1000)) {
        return res.status(429).json({ error: 'Too many review submissions, please try again later.' });
      }

      const { profileId, ratings, feedbackText, consentGiven } = req.body;

      if (!profileId || !ratings || !consentGiven) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if profile exists
      const { rows: profiles } = await sql`SELECT id FROM profiles WHERE id = ${profileId}`;
      if (profiles.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Validate ratings
      const ratingValues = Object.values(ratings);
      if (ratingValues.some(r => r < 1 || r > 5)) {
        return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
      }

      const reviewId = generateShortId();
      const submittedAt = Date.now();

      await sql`
        INSERT INTO reviews (id, profile_id, ratings, feedback_text, consent_given, submitted_at, ip_hash)
        VALUES (${reviewId}, ${profileId}, ${JSON.stringify(ratings)}, ${feedbackText || null}, ${consentGiven ? 1 : 0}, ${submittedAt}, ${ipHash})
      `;

      return res.json({
        success: true,
        reviewId,
        message: 'Review submitted successfully'
      });
    }

    // Verify claim token
    if (path === '/profiles/verify-claim' && method === 'POST') {
      const { profileId, claimToken } = req.body;

      if (!profileId || !claimToken) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { rows: profiles } = await sql`
        SELECT id FROM profiles WHERE id = ${profileId} AND claim_token = ${claimToken}
      `;

      return res.json({ valid: profiles.length > 0 });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
