const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const aiRoutes = require('./routes/aiRoutes');
const projectMentorRoutes = require('./routes/projectMentorRoutes');
const historyRoutes = require('./routes/historyRoutes');
const profileManagementRoutes = require('./routes/profileManagementRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security HTTP Headers Middleware
app.use(helmet());

// 2. HTTP Request Logger Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 3. Request Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/project-mentor', projectMentorRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profile-management', profileManagementRoutes);

// Health check endpoint for API testing & uptime monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DevPath AI Backend Production API is online and healthy.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 6. Handle 404 Undefined Routes
app.use(notFoundHandler);

// 7. Global Centralized Error Handler
app.use(errorHandler);

// Start Server and verify DB Connection
app.listen(PORT, async () => {
  console.log(`\n========================================`);
  console.log(`🚀 DevPath AI Backend Server Online [Port ${PORT}]`);
  console.log(`🔒 Security (Helmet, CORS, HTTP-Only Cookies) Enabled`);
  console.log(`========================================\n`);
  await testConnection();
});

module.exports = app;
