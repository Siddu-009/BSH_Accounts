const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// 🔐 Protect all admin routes
router.use(auth);
router.use(isAdmin);

router.post("/users", adminController.createUser);
router.get("/users", adminController.listUsers);
router.delete("/users/:id", adminController.deleteUser);
router.patch("/users/:id/pause", adminController.pauseUser);
router.patch("/users/:id/resume", adminController.resumeUser);

module.exports = router;


