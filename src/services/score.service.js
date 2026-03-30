import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initializing the Supabase client with the Service Role Key 
// to allow the "Rolling Five" logic to bypass RLS policies.
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Implements the "Rolling Five" logic. 
 * If a user has < 5 scores, it inserts a new one. 
 * If they have 5, it overwrites the oldest one by played_at date.
 */
export const updateRollingScores = async (userId, scoreValue, playedAt) => {
  try {
    // 1. Fetch existing scores for this user, sorted by date
    const { data: currentScores, error: fetchError } = await supabase
      .from('user_scores')
      .select('id, played_at')
      .eq('user_id', userId)
      .order('played_at', { ascending: true });

    if (fetchError) throw fetchError;

    if (currentScores.length < 5) {
      // Logic: Just add if the buffer isn't full yet
      return await supabase.from('user_scores').insert({
        user_id: userId,
        score_value: scoreValue,
        played_at: playedAt
      });
    } else {
      // Logic: Replace the oldest one (first in our ascending list)
      const oldestScoreId = currentScores[0].id;
      
      return await supabase
        .from('user_scores')
        .update({
          score_value: scoreValue,
          played_at: playedAt
        })
        .eq('id', oldestScoreId)
        .select(); // Returns the updated row
    }
  } catch (error) {
    console.error('Rolling Score Service Error:', error);
    throw error;
  }
};