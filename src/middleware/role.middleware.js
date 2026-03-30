export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user was already populated by auth.middleware
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied: ${req.user.role} role does not have permission.` 
      });
    }
    next();
  };
};