const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions.controller');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', transactionsController.getTransactions);
router.get('/:id', transactionsController.getTransactionById);
router.post('/', transactionsController.createTransaction);
router.put('/:id', transactionsController.updateTransaction);
router.delete('/:id', transactionsController.deleteTransaction);

module.exports = router;
