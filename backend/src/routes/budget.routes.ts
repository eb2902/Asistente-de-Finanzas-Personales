import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const budgetController = new BudgetController();

router.use(authenticateToken);

router.post('/', budgetController.createBudget.bind(budgetController));
router.post('/bulk', budgetController.upsertBudgets.bind(budgetController));
router.get('/', budgetController.getBudgets.bind(budgetController));
router.get('/category/:category', budgetController.getBudgetByCategory.bind(budgetController));
router.put('/:id', budgetController.updateBudget.bind(budgetController));
router.delete('/:id', budgetController.deleteBudget.bind(budgetController));

export default router;
