# Whisper - Anonymous Feedback Platform

An anonymous partner feedback platform that allows users to share reviews through a standardized form system.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/phoebusdev/whisper-mvp&project-name=whisper-mvp&repository-name=whisper-mvp)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/phoebusdev/whisper-mvp)

## 🚀 Quick Deploy

- **[Deploy to Vercel →](./DEPLOY_VERCEL.md)** - Deploy with Vercel + Postgres (10 minutes)
- **[Deploy to Railway →](./DEPLOY_NOW.md)** - Deploy with Railway + SQLite (5 minutes)

## 📚 Documentation

- **[Quick Start Guide →](./QUICKSTART.md)** - Run locally in 2 minutes
- **[All Deployment Options →](./DEPLOYMENT.md)** - Railway, Render, Fly.io guides

## Features

- 🔒 **Completely Anonymous** - No email or phone number required
- 📊 **Aggregated Insights** - View averaged ratings and all feedback in one place
- 🔗 **Easy Sharing** - Shareable links optimized for SMS and social media
- 📱 **Mobile-First Design** - Fully responsive interface
- 🔐 **Privacy-Focused** - No PII collection, with rate limiting protection
- 💾 **Claim Tokens** - Secure token system for future profile ownership verification

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Tailwind CSS for styling
- Vite for build tooling

### Backend
- Node.js with Express
- SQLite with better-sqlite3
- nanoid for unique ID generation
- express-rate-limit for abuse prevention

## Project Structure

```
whisper-mvp/
├── client/           # React frontend
│   ├── src/
│   │   ├── pages/   # Page components
│   │   ├── components/
│   │   └── utils/
│   └── package.json
├── server/          # Express backend
│   ├── database.js  # Database schema and initialization
│   ├── index.js     # API server
│   └── package.json
└── package.json     # Root package
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd whisper-mvp
```

2. Install dependencies
```bash
npm install
```

This will install dependencies for both client and server.

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend (runs on port 5000)
npm run server

# Frontend (runs on port 3000)
npm run client
```

### Building for Production

Build the frontend:
```bash
npm run build
```

### Production Deployment

The application is designed to be deployed on platforms like Railway, Vercel, or similar.

For Railway:
1. Connect your GitHub repository
2. Set the root directory to `/`
3. Railway will auto-detect and deploy both services

## API Endpoints

### Profiles
- `POST /api/profiles` - Create a new anonymous profile
- `GET /api/profiles/:profileId` - Get profile with aggregated reviews

### Reviews
- `POST /api/reviews` - Submit a review
- `GET /api/categories` - Get available rating categories

### Utilities
- `POST /api/profiles/verify-claim` - Verify claim token
- `GET /api/health` - Health check

## Database Schema

### profiles
- `id` - Unique profile identifier
- `claim_token` - Secret token for future claiming
- `created_at` - Timestamp
- `view_count` - Number of profile views

### reviews
- `id` - Unique review identifier
- `profile_id` - Associated profile
- `ratings` - JSON object of category ratings
- `feedback_text` - Optional text feedback
- `consent_given` - Consent confirmation
- `submitted_at` - Timestamp
- `ip_hash` - Hashed IP for rate limiting

### categories
- `id` - Category identifier
- `name` - Category name
- `is_default` - Whether it's a default category

## Privacy & Security

- No personally identifiable information is collected
- IP addresses are hashed for rate limiting only
- Rate limiting prevents spam (100 requests/15min, 10 reviews/hour)
- Reviews are immutable after submission
- Claim tokens allow future profile ownership verification

## License

ISC

## Support

For issues and feature requests, please open an issue in the repository.
