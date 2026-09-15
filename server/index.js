require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./config/db');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');

const app = express();

// Connect to MongoDB
connectDB();

// DB connection middleware for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    next();
  }
});


// Dynamic CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'https://scoutway-pi.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow origin dynamically
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'scoutway_session_secret_dev',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes — Support both /api/auth and /auth, /api/stories and /stories
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/stories', storyRoutes);
app.use('/stories', storyRoutes);

// Health check endpoints
const healthHandler = (req, res) => {
  res.json({ status: 'ok', message: 'ScoutWay API is running', timestamp: new Date().toISOString() });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/', healthHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack || err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 ScoutWay server running on port ${PORT}`);
  });
}

module.exports = app;

