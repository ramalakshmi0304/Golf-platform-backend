import { supabaseAdmin } from '../config/supabas.config.js'

/**
 * @desc    Get current user profile
 * @route   GET /api/user/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // ✅ change here

    // If profile doesn't exist → create one
    if (!data) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: req.user.email, // 👈 Get from Auth metadata
          name: req.user.user_metadata?.full_name || 'New Player',
          role: 'subscriber',
          subscription_status: 'inactive'
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      return res.status(200).json(newProfile);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ error: "Server error fetching profile" });
  }
};

/**
 * @desc    Update user profile (e.g., handicap, club, name)
 * @route   PATCH /api/user/update-profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: userId, ...updates }) // ✅ use upsert
      .select()
      .maybeSingle();

    if (error) throw error;

    res.status(200).json({
      message: "Profile updated successfully",
      profile: data
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

