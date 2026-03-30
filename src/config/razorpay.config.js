import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Using ESM export
export default razorpayInstance;