import { createClient } from '@supabase/supabase-js';
import * as scoreService from '../services/score.service.js';
import dotenv from 'dotenv';

dotenv.config();

// Using the name 'supabase' consistently throughout the file
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/scores/hall-of-fame
 * Public: Fetches the top 3 recent active subscribers for the Winners Gallery.
 */
export const getWinners = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, subscription_status, role, updated_at')
      .eq('role', 'subscriber') 
      .eq('subscription_status', 'active') 
      // Ensure we only get profiles that actually have a timestamp
      .not('updated_at', 'is', null) 
      .order('updated_at', { ascending: false }) 
      .limit(3);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Could not load winners" });
  }
};

/**
 * POST /api/user/submit-score
 * Private: Submits a score and triggers the rolling buffer logic.
 */
export const handleScoreSubmit = async (req, res) => {
  const { score_value, played_at } = req.body;
  const userId = req.user.id; 

  try {
    // 1. Validation
    if (!score_value || score_value < 1 || score_value > 45) {
      return res.status(400).json({ error: "Score must be between 1 and 45." });
    }

    if (!played_at) {
      return res.status(400).json({ error: "Date of play is required." });
    }

    // 2. Rolling Five logic
    const { data, error } = await scoreService.updateRollingScores(userId, score_value, played_at);

    if (error) throw error;

    return res.status(201).json({ 
      message: "Score submitted successfully", 
      activeScores: data 
    });
  } catch (err) {
    console.error("Score Submission Error:", err);
    return res.status(500).json({ error: "Internal server error updating scores." });
  }
};

/**
 * GET /api/user/my-scores
 */
export const getMyScores = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('user_scores')
      .select('id, score_value, played_at')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch scores." });
  }
};

/**
 * GET /api/admin/profiles-with-scores
 * Admin Only: Used for the Oversight panel.
 */
export const getProfilesWithScores = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        role,
        user_scores(score_value, played_at)
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
};