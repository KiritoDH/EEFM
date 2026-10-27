const express = require('express');
const router = express.Router();
const budgetsController = require('../controllers/budgets.controller');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', budgetsController.getBudgets);
router.post('/', budgetsController.upsertBudget);
router.delete('/:id', budgetsController.deleteBudget);

module.exports = router;
