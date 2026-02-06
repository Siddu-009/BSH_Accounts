const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

// ================= AUTH =================
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/admin-signup", authController.adminSignup);
router.post(
  "/change-password",
  authMiddleware,
  authController.changePassword
);


// ================= CHECK SUPER ADMIN EXISTS =================

router.get("/admin-exists", async (req, res) => {
  try {
    const { data, error } = await db
      .from("users")
      .select("id")
      .eq("role", "ADMIN")
      .limit(1);

    if (error) {
      console.error("ADMIN EXISTS ERROR:", error);
      return res.json({ adminExists: false });
    }

    res.json({ adminExists: data.length > 0 });

  } catch (err) {
    console.error("ADMIN EXISTS ERROR:", err);
    res.json({ adminExists: false });
  }
});




module.exports = router;
