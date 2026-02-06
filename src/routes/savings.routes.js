const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/savings.controller');

router.post('/', auth, controller.addSavings);
router.get('/', auth, controller.listSavings);
router.get('/by-date', auth, controller.savingsByDate);
router.put('/:id', auth, controller.updateSavings);
module.exports = router;
