const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let token;

    /* ✅ 1️⃣ From Authorization header */
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    /* ✅ 2️⃣ From query param (for downloads) */
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
