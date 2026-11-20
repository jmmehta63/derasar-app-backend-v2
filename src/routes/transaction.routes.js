const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { validateTransaction, validateTransactionUpdate } = require('../validators/transaction.validator');
const { cacheResponse, invalidateCache } = require('../middleware/responseCache');

const cacheTransactions = cacheResponse('transactions');
const invalidateTransactions = invalidateCache('transactions');

// GET all transactions
router.get('/', cacheTransactions, transactionController.getAllTransactions);

// GET next transaction number
router.get('/next-number/generate', cacheTransactions, transactionController.getNextTransactionNumber);

// GET unique non-members
router.get('/non-members/unique', cacheTransactions, transactionController.getUniqueNonMembers);

// GET single transaction by ID
router.get('/:id', cacheTransactions, transactionController.getTransactionById);

// POST create new transaction
router.post('/', validateTransaction, invalidateTransactions, transactionController.createTransaction);

// PUT update transaction
router.put('/:id', validateTransactionUpdate, invalidateTransactions, transactionController.updateTransaction);

// DELETE transaction
router.delete('/:id', invalidateTransactions, transactionController.deleteTransaction);

// GET transactions by member
router.get('/member/:memberId', cacheTransactions, transactionController.getTransactionsByMember);

// GET transactions by date range
router.get('/date-range/:startDate/:endDate', cacheTransactions, transactionController.getTransactionsByDateRange);

// GET transactions statistics
router.get('/stats/summary', cacheTransactions, transactionController.getTransactionStats);

module.exports = router;
