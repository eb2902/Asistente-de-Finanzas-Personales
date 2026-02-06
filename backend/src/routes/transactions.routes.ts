import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const transactionsController = new TransactionsController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Transaction routes
router.post('/', transactionsController.createTransaction.bind(transactionsController));
router.get('/', transactionsController.getUserTransactions.bind(transactionsController));
router.get('/stats', transactionsController.getTransactionStats.bind(transactionsController));
router.get('/:id', transactionsController.getTransactionById.bind(transactionsController));
router.put('/:id', transactionsController.updateTransaction.bind(transactionsController));
router.delete('/:id', transactionsController.deleteTransaction.bind(transactionsController));

// Categorization route (can be used standalone)
router.post('/categorize', transactionsController.categorizeTransaction.bind(transactionsController));

export default router;