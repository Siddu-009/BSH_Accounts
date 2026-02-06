const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/download.controller");

console.log("AUTH TYPE:", typeof auth);
console.log("DOWNLOAD TYPE:", typeof controller.downloadExcel);

router.get("/excel", auth, controller.downloadExcel);
router.get("/template", auth, controller.downloadTemplate);
module.exports = router;
