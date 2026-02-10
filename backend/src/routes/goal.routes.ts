import { Router } from 'express';
import { GoalsController } from '../controllers/goal.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const goalsController = new GoalsController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Goal routes
router.post('/', goalsController.createGoal.bind(goalsController));
router.get('/', goalsController.getUserGoals.bind(goalsController));
router.get('/:id', goalsController.getGoalById.bind(goalsController));
router.put('/:id', goalsController.updateGoal.bind(goalsController));
router.delete('/:id', goalsController.deleteGoal.bind(goalsController));

export default router;
