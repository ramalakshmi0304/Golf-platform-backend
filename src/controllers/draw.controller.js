export const simulateDraw = async (req, res) => {
  const { winningNumbers } = req.body;

  try {
    if (!winningNumbers || winningNumbers.length !== 5) {
      return res.status(400).json({ error: "Please provide 5 winning numbers." });
    }

    // Call the matching logic from the service
    const results = await drawService.executeMonthlyDraw(winningNumbers);
    
    // Optional: Get subscriber count for prize estimation
    const { count: subscriberCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    return res.status(200).json({
      message: "Simulation successful",
      winnersFound: results,
      activeSubscribers: subscriberCount
    });
  } catch (err) {
    console.error("Simulation Error:", err);
    return res.status(500).json({ error: "Failed to run draw simulation." });
  }
};

export const finalizeDraw = async (req, res) => {
  const { winningNumbers, drawMonth } = req.body;

  try {
    // 1. Identify winners using the Reward Engine service
    const winners = await drawService.executeMonthlyDraw(winningNumbers);

    // 2. Prepare data for 'draw_results' (The Hall of Fame table)
    const allWinnerIds = [
      ...winners.match5, 
      ...winners.match4, 
      ...winners.match3
    ];

    if (allWinnerIds.length > 0) {
      // Fetch profile details to get real names for the history log
      const { data: winnerProfiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', allWinnerIds);

      const resultsToInsert = winnerProfiles.map(profile => {
        // Determine prize based on which tier they landed in
        let prize = "£50.00";
        if (winners.match5.includes(profile.id)) prize = "£500.00";
        else if (winners.match4.includes(profile.id)) prize = "£100.00";

        return {
          winner_id: profile.id,
          winner_name: profile.name || 'Lucky Player',
          winner_email: profile.email,
          draw_date: new Date().toISOString(),
          prize_amount: prize,
          winning_score: 5 // You can adjust this logic if needed
        };
      });

      // 3. INSERT into draw_results
      const { error: logError } = await supabase
        .from('draw_results')
        .insert(resultsToInsert);

      if (logError) throw logError;

      // 4. Update profiles table for "Recent Winner" status
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          last_win_date: new Date().toISOString(),
          is_recent_winner: true 
        })
        .in('id', allWinnerIds);

      if (profileUpdateError) throw profileUpdateError;
    }

    return res.status(201).json({
      message: "Draw finalized! Winners recorded and Hall of Fame updated.",
      winnersFound: allWinnerIds.length
    });
  } catch (err) {
    console.error("Finalize Error:", err);
    return res.status(500).json({ error: "Critical error finalizing draw." });
  }
};