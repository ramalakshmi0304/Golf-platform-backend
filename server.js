import express from 'express';
import cors from 'cors'; // 1. Import CORS
import dotenv from 'dotenv';
import userRoutes from './src/routes/user.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import scoreRoutes from './src/routes/score.routes.js';
import paymentRoutes from './src/routes/payment.routes.js'

dotenv.config();

const app = express();

// 2. Initialize CORS 
// In development, this allows your Vite/React app to communicate with this API.
const allowedOrigins = [
  'http://localhost:5173', 
  'https://your-frontend-name.vercel.app' // You'll update this after Step 3
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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