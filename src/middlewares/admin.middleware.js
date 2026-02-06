module.exports = (req, res, next) => {
  // 🔐 auth.middleware MUST run before this
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // 🔒 Only ADMIN can proceed
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next(); // ✅ allow request
};
