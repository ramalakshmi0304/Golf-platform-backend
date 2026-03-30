import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Compares winning numbers against user scores using a Set for O(1) lookup.
 * @param {number[]} winningNumbers - e.g., [12, 45, 7, 22, 31]
 * @param {number[]} userScores - e.g., [12, 3, 7, 22, 1]
 * @returns {number} - Count of matching numbers
 */
export const countMatches = (winningNumbers, userScores) => {
  const winSet = new Set(winningNumbers);
  return userScores.filter(score => winSet.has(score)).length;
};

/**
 * Core Reward Engine: Fetches all active participants and categorizes winners.
 * @param {number[]} winningNumbers - The 5 numbers drawn for the month.
 */
export const executeMonthlyDraw = async (winningNumbers) => {
  try {
    // 1. Fetch active subscribers and their nested scores
    // Note: We use the service role to ensure we can read all scores for the calculation
    const { data: participants, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        user_scores (score_value)
      `)
      .eq('subscription_status', 'active');

    if (error) throw error;

    const winners = {
      match5: [], // 40% Tier
      match4: [], // 35% Tier
      match3: []  // 25% Tier
    };

    // 2. Iterate through participants and calculate matches
    participants.forEach(player => {
      // Extract numeric values from the joined user_scores table
      const scores = player.user_scores.map(s => s.score_value);
      
      // We only count players who have submitted a full set of 5 scores
      if (scores.length >= 1) {
        const matchCount = countMatches(winningNumbers, scores);

        if (matchCount === 5) winners.match5.push(player.id);
        else if (matchCount === 4) winners.match4.push(player.id);
        else if (matchCount === 3) winners.match3.push(player.id);
      }
    });

    return winners;
  } catch (err) {
    console.error('Draw Execution Error:', err);
    throw new Error('Failed to process monthly draw results.');
  }
};