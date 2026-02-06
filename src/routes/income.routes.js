const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const incomeCtrl = require("../controllers/income.controller");

router.post("/", auth, incomeCtrl.addIncome);
router.get("/", auth, incomeCtrl.listIncome);
router.delete("/:id", auth, incomeCtrl.deleteIncome);
router.put("/:id", auth, incomeCtrl.updateIncome);
router.get("/by-date", auth, incomeCtrl.incomeByDate);

module.exports = router;
