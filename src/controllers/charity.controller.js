import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/charities
 * Public: List all active charities for users to browse and select.
 */
export const getAllCharities = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('id, name, description, logo_url, website_url, category')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error('Fetch Charities Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve charities' });
  }
};

/**
 * GET /api/charities/:id
 * Public: Get specific details for a charity profile page.
 */
export const getCharityById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Charity not found' });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching charity details' });
  }
};

/**
 * POST /api/charities
 * Admin Only: Add a new charity partner to the platform.
 */
export const createCharity = async (req, res) => {
  const { name, description, logo_url, category } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('charities')
      .insert([{ name, description, logo_url, category, is_active: true }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ message: 'Charity added successfully', data });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to create charity record' });
  }
};

/**
 * PATCH /api/charities/:id
 * Admin Only: Toggle a charity's active status or update details.
 */
export const updateCharity = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('charities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: 'Charity updated', data });
  } catch (err) {
    return res.status(400).json({ error: 'Update failed' });
  }
};