const express = require("express");
const router = express.Router();
const multer = require("multer");

const auth = require("../middlewares/auth.middleware");
const uploadController = require("../controllers/upload.controller");


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post(
  "/excel",
  auth,
  upload.single("file"),
  uploadController.uploadExcel
);

module.exports = router;
