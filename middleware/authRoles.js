export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

    const hasAccess = userRoles.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
      return res.status(403).json({
        message: "You are not allowed to perform this operation"
      });
    }

    next();
  };
};
