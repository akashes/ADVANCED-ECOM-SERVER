export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('user roles are',req.user.role)
    
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

    const hasAccess = userRoles.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
      console.log("requested user roles are ", userRoles);
      return res.status(403).json({
        message: "You are not allowed to perform this operation"
      });
    }

    next();
  };
};
