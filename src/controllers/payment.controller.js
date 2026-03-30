import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.config.js';
import { supabaseAdmin } from '../config/supabas.config.js';

export const createOrder = async (req, res) => {
  try {
    const options = {
      // Use Math.round to avoid floating point issues with paise
      amount: Math.round(Number(req.body.amount) * 100), 
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    userId,
    amount // Optionally pass the amount from frontend
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      // 1. Update Profile to 'active'
      const profileUpdate = supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          role: 'subscriber', 
          last_payment_id: razorpay_payment_id 
        })
        .eq('id', userId);

      // 2. Log the payment in the 'transactions' table
      const transactionLog = supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userId,
          amount: amount || 500, // Default to 500 if not sent
          razorpay_order_id,
          razorpay_payment_id,
          status: 'success'
        });

      // Execute both concurrently for speed
      const [profileRes, transRes] = await Promise.all([profileUpdate, transactionLog]);

      if (profileRes.error) throw profileRes.error;
      if (transRes.error) throw transRes.error;

      res.status(200).json({ 
        success: true, 
        message: "Payment Verified, Profile Updated & Transaction Logged" 
      });

    } catch (error) {
      console.error("Supabase Operation Failed:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Database Update Failed", 
        details: error.message 
      });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid Signature" });
  }
};