import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

import { config, validateConfig } from './config/index.js';
import { configurePassport } from './config/passport.js';
import { getDb } from './db/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Validate configuration
validateConfig();

// Initialize database
getDb();

// Configure Passport
configurePassport();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Passport initialization
app.use(passport.initialize());

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Backend server running on http://localhost:${config.port}`);
  console.log(`Frontend URL: ${config.frontendUrl}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
