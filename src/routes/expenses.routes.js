const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");
const controller = require("../controllers/expenses.controller");

router.post(
  "/",
  auth,
  upload.fields([
    { name: "bill", maxCount: 1 },
    { name: "warranty", maxCount: 1 }
  ]),
  controller.addExpense
);

router.get("/", auth, controller.listExpenses);
router.delete("/:id", auth, controller.deleteExpense);
router.put("/:id", auth, controller.updateExpense);

module.exports = router;
