import express from 'express';
import cors from 'cors'; // 1. Import CORS
import dotenv from 'dotenv';
import userRoutes from './src/routes/user.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import scoreRoutes from './src/routes/score.routes.js';
import paymentRoutes from './src/routes/payment.routes.js'

dotenv.config();

const app = express();

// 1. Explicitly list your production and local origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://golf-platform-frontend-pi.vercel.app' // 👈 Added your exact Vercel URL
];

// 2. Use a simplified CORS configuration
app.use(cors({
  origin: function (origin, callback) {
  
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS Blocked for origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/payment', paymentRoutes);

// Health Check
app.get('/health', (req, res) => res.send('Platform is live!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));