const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/dashboard.controller');

router.get('/expenses-today', auth, controller.todayTotal);
router.get('/expenses-month', auth, controller.monthTotal);
router.get('/expenses-chart', auth, controller.monthExpenses);

router.get('/income-today', auth, controller.todayIncome);
router.get('/income-month', auth, controller.monthIncome);
router.get('/income-chart', auth, controller.incomeChart);

router.get('/savings-today', auth, controller.todaySavings);
router.get('/savings-month', auth, controller.monthSavings);
router.get('/savings-chart', auth, controller.savingsChart);
// router.post("/change-password", auth, controller.changePassword);
module.exports = router;
