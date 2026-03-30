import { supabaseAdmin } from '../config/supabas.config.js'; // ✅ Import existing client

/**
 * Middleware to protect routes based on Supabase JWT and custom roles.
 */
export const protect = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];

      // 1. Verify Token with Supabase (Using the imported admin client)
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      // 2. Fetch Role from the 'profiles' table
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role, subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error("Profile Look-up Error:", profileError);
        return res.status(403).json({ error: 'User profile not found in database' });
      }

      // 3. RBAC Check
      if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
        return res.status(403).json({ 
          error: `Forbidden: Requires ${allowedRoles.join(' or ')}` 
        });
      }

      // 4. Attach to request
      req.user = { 
        ...user, 
        role: profile.role, 
        sub_status: profile.subscription_status 
      };

      next();
    } catch (err) {
      console.error('Auth Middleware Error:', err.message);
      res.status(500).json({ error: 'Internal Auth error' });
    }
  };
};