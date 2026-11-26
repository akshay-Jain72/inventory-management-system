
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {

    const userRole = req.user?.role?.trim().toLowerCase();

    const normalizedRoles = allowedRoles.map(role =>
      role.trim().toLowerCase()
    );

    console.log("User Role:", userRole);
    console.log("Allowed Roles:", normalizedRoles);

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};





module.exports = roleMiddleware;
