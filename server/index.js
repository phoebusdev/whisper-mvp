import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 review submissions per hour
  message: 'Too many review submissions, please try again later.'
});

app.use('/api/', limiter);

// Helper functions
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const generateShortId = () => {
  return nanoid(10); // Generates a 10-character ID
};

// API Routes

// Get default categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories WHERE is_default = 1').all();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create a new profile
app.post('/api/profiles', (req, res) => {
  try {
    const profileId = generateShortId();
    const claimToken = nanoid(32); // Longer token for claiming
    const createdAt = Date.now();

    const stmt = db.prepare(`
      INSERT INTO profiles (id, claim_token, created_at)
      VALUES (?, ?, ?)
    `);

    stmt.run(profileId, claimToken, createdAt);

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
app.get('/api/profiles/:profileId', (req, res) => {
  try {
    const { profileId } = req.params;

    // Check if profile exists
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Increment view count
    db.prepare('UPDATE profiles SET view_count = view_count + 1 WHERE id = ?').run(profileId);

    // Get all reviews for this profile
    const reviews = db.prepare(`
      SELECT id, ratings, feedback_text, submitted_at
      FROM reviews
      WHERE profile_id = ?
      ORDER BY submitted_at DESC
    `).all(profileId);

    // Parse ratings and calculate aggregates
    const parsedReviews = reviews.map(review => ({
      ...review,
      ratings: JSON.parse(review.ratings),
      submitted_at: new Date(review.submitted_at).toISOString()
    }));

    // Calculate average ratings per category
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

    // Calculate overall average
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
      createdAt: new Date(profile.created_at).toISOString()
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Submit a review
app.post('/api/reviews', reviewLimiter, (req, res) => {
  try {
    const { profileId, ratings, feedbackText, consentGiven } = req.body;

    // Validate input
    if (!profileId || !ratings || !consentGiven) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if profile exists
    const profile = db.prepare('SELECT id FROM profiles WHERE id = ?').get(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Validate ratings
    const ratingValues = Object.values(ratings);
    if (ratingValues.some(r => r < 1 || r > 5)) {
      return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
    }

    const reviewId = generateShortId();
    const submittedAt = Date.now();
    const ipHash = hashIP(req.ip || 'unknown');

    const stmt = db.prepare(`
      INSERT INTO reviews (id, profile_id, ratings, feedback_text, consent_given, submitted_at, ip_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      reviewId,
      profileId,
      JSON.stringify(ratings),
      feedbackText || null,
      consentGiven ? 1 : 0,
      submittedAt,
      ipHash
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

// Verify claim token (for future claiming feature)
app.post('/api/profiles/verify-claim', (req, res) => {
  try {
    const { profileId, claimToken } = req.body;

    if (!profileId || !claimToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const profile = db.prepare(`
      SELECT id FROM profiles WHERE id = ? AND claim_token = ?
    `).get(profileId, claimToken);

    if (profile) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error('Error verifying claim token:', error);
    res.status(500).json({ error: 'Failed to verify claim token' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  // Handle client-side routing - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});

export default app;
