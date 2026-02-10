import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const transactionsController = new TransactionsController();

// Public routes (no authentication required)
router.post('/categorize', transactionsController.categorizeTransaction.bind(transactionsController));
router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Transactions routes are working',
    timestamp: new Date().toISOString()
  });
});

// Apply authentication middleware to all routes that require it
router.use(authenticateToken);

// Transaction routes (require authentication)
router.post('/', transactionsController.createTransaction.bind(transactionsController));
router.get('/', transactionsController.getUserTransactions.bind(transactionsController));
router.get('/stats', transactionsController.getTransactionStats.bind(transactionsController));
router.get('/:id', transactionsController.getTransactionById.bind(transactionsController));
router.put('/:id', transactionsController.updateTransaction.bind(transactionsController));
router.delete('/:id', transactionsController.deleteTransaction.bind(transactionsController));

export default router;
