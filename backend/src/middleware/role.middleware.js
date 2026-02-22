const allowRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    
    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Access denied. You do not have permission." });
    }
    next();
  };
};

module.exports = allowRoles;