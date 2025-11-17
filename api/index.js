import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// For Vercel deployment, we'll use Vercel Postgres instead of SQLite
// Import the database connection (will be created separately)
let db;

// Try to import Postgres database, fall back to SQLite for local dev
try {
  // This will be the Postgres version for Vercel
  const dbModule = await import('./database-postgres.js');
  db = dbModule.default;
} catch (error) {
  // Fall back to SQLite for local development
  const dbModule = await import('../server/database.js');
  db = dbModule.default;
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many review submissions, please try again later.'
});

app.use('/api/', limiter);

// Helper functions
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const generateShortId = () => {
  return nanoid(10);
};

// API Routes

// Get default categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories WHERE is_default = 1');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create a new profile
app.post('/api/profiles', async (req, res) => {
  try {
    const profileId = generateShortId();
    const claimToken = nanoid(32);
    const createdAt = Date.now();

    await db.query(
      'INSERT INTO profiles (id, claim_token, created_at) VALUES ($1, $2, $3)',
      [profileId, claimToken, createdAt]
    );

    res.json({
      profileId,
      claimToken,
      reviewLink: `/review/${profileId}`,
      viewLink: `/profile/${profileId}`
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Get profile with aggregated reviews
app.get('/api/profiles/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await db.queryOne('SELECT * FROM profiles WHERE id = $1', [profileId]);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Increment view count
    await db.query('UPDATE profiles SET view_count = view_count + 1 WHERE id = $1', [profileId]);

    const reviews = await db.query(
      'SELECT id, ratings, feedback_text, submitted_at FROM reviews WHERE profile_id = $1 ORDER BY submitted_at DESC',
      [profileId]
    );

    const parsedReviews = reviews.map(review => ({
      ...review,
      ratings: typeof review.ratings === 'string' ? JSON.parse(review.ratings) : review.ratings,
      submitted_at: new Date(parseInt(review.submitted_at)).toISOString()
    }));

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

    res.json({
      profileId,
      reviewCount: reviews.length,
      viewCount: profile.view_count + 1,
      overallAverage: parseFloat(overallAverage.toFixed(2)),
      categoryAverages,
      reviews: parsedReviews,
      createdAt: new Date(parseInt(profile.created_at)).toISOString()
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Submit a review
app.post('/api/reviews', reviewLimiter, async (req, res) => {
  try {
    const { profileId, ratings, feedbackText, consentGiven } = req.body;

    if (!profileId || !ratings || !consentGiven) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const profile = await db.queryOne('SELECT id FROM profiles WHERE id = $1', [profileId]);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const ratingValues = Object.values(ratings);
    if (ratingValues.some(r => r < 1 || r > 5)) {
      return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
    }

    const reviewId = generateShortId();
    const submittedAt = Date.now();
    const ipHash = hashIP(req.ip || 'unknown');

    await db.query(
      'INSERT INTO reviews (id, profile_id, ratings, feedback_text, consent_given, submitted_at, ip_hash) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [reviewId, profileId, JSON.stringify(ratings), feedbackText || null, consentGiven ? 1 : 0, submittedAt, ipHash]
    );

    res.json({
      success: true,
      reviewId,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Verify claim token
app.post('/api/profiles/verify-claim', async (req, res) => {
  try {
    const { profileId, claimToken } = req.body;

    if (!profileId || !claimToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const profile = await db.queryOne(
      'SELECT id FROM profiles WHERE id = $1 AND claim_token = $2',
      [profileId, claimToken]
    );

    res.json({ valid: !!profile });
  } catch (error) {
    console.error('Error verifying claim token:', error);
    res.status(500).json({ error: 'Failed to verify claim token' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the Express app for Vercel serverless
export default app;
