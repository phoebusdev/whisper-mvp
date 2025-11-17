# Whisper MVP - Quick Start Guide

Get your Whisper MVP up and running in minutes!

## 🎯 What You're Building

An anonymous feedback platform where:
1. Users create anonymous profiles
2. Share review links via SMS/social
3. Collect anonymous ratings and feedback
4. View aggregated results

## 🏃 Quick Start (Development)

### 1. Install Dependencies
```bash
npm install
```

This installs dependencies for both frontend and backend.

### 2. Start Development Server
```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:5000`
- Frontend app on `http://localhost:3000`

### 3. Test the Application

Open `http://localhost:3000` in your browser and:

1. **Create a Profile**
   - Click "Create Your Feedback Profile"
   - Save your claim token (displayed after creation)
   - Copy your review link

2. **Submit a Review**
   - Open the review link in a new tab/incognito window
   - Rate all categories (1-5 stars)
   - Add optional feedback
   - Check consent box and submit

3. **View Feedback**
   - Go to your profile view link
   - See aggregated scores
   - View individual reviews

## 📱 Test on Mobile

To test on your phone:

1. Find your local IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Update `client/vite.config.js`:
   ```javascript
   server: {
     host: '0.0.0.0',  // Add this line
     port: 3000,
     // ... rest of config
   }
   ```

3. Access on phone: `http://YOUR-IP:3000`

## 🔍 Project Structure

```
whisper-mvp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Main pages
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── CreateReview.jsx   # After profile creation
│   │   │   ├── SubmitReview.jsx   # Review form
│   │   │   └── ViewProfile.jsx    # View feedback
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── server/                # Express backend
│   ├── database.js        # SQLite setup
│   ├── index.js          # API server
│   └── whisper.db        # SQLite database (created on first run)
│
└── package.json          # Root package
```

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm start` - Start production server

### Backend (`cd server`)
- `npm run dev` - Start with auto-reload
- `npm start` - Start production mode

### Frontend (`cd client`)
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔧 Configuration

### Backend Port
Default: `5000`

Change in `server/index.js`:
```javascript
const PORT = process.env.PORT || 5000;
```

### Frontend Port
Default: `3000`

Change in `client/vite.config.js`:
```javascript
server: {
  port: 3000,
  // ...
}
```

### API Proxy
Frontend proxies `/api` requests to backend automatically (configured in Vite).

## 🎨 Customization

### Rating Categories
Edit `server/database.js`:
```javascript
const defaultCategories = [
  'Communication',
  'Reliability',
  'Professionalism',
  'Quality of Work',
  'Collaboration',
  // Add your own!
];
```

### Styling
All styles use Tailwind CSS. Edit:
- `client/tailwind.config.js` - Theme configuration
- `client/src/index.css` - Custom styles

### Brand Colors
Edit `client/tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Change these values
    600: '#0284c7',
    // ...
  }
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Database Errors
Delete the database and restart:
```bash
rm server/whisper.db
npm run server
```

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules client/node_modules server/node_modules
npm install
```

### CORS Errors
Make sure backend is running and frontend proxy is configured.

## 📦 Database

SQLite database is created automatically at `server/whisper.db`.

### View Database
```bash
# Install sqlite3
npm install -g sqlite3

# Open database
sqlite3 server/whisper.db

# View tables
.tables

# View profiles
SELECT * FROM profiles;

# View reviews
SELECT * FROM reviews;

# Exit
.exit
```

### Reset Database
```bash
rm server/whisper.db
# Restart server to recreate
```

## 🚀 Ready for Production?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

### Quick Deploy to Railway
1. Push code to GitHub
2. Connect Railway to your repo
3. Deploy automatically
4. Get your public URL

## 💡 Tips

1. **Test Anonymously**: Use incognito windows to simulate different users
2. **Save Claim Tokens**: Store in browser localStorage or copy elsewhere
3. **Share Links**: Use the SMS-optimized message format
4. **Mobile First**: Test on mobile early and often
5. **Rate Limiting**: Backend limits 10 reviews/hour per IP

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)

## ⚡ Next Steps

Once you have it running:

1. ✅ Test all user flows
2. ✅ Customize categories for your use case
3. ✅ Adjust styling/branding
4. ✅ Deploy to production
5. ✅ Share with real users
6. ✅ Collect feedback and iterate!

---

**Questions?** Check the [README.md](./README.md) or [DEPLOYMENT.md](./DEPLOYMENT.md)
