/**
 * Role based authorization middleware
 * Usage:
 *   role(["ADMIN"])
 *   role(["ADMIN", "USER"])
 */

module.exports = function role(allowedRoles = []) {

  return (req, res, next) => {

    // 🔐 auth.middleware must run before this
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    // ❌ role not allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // ✅ allowed
    next();
  };
};
