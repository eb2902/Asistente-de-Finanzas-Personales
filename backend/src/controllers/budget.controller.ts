import { Request, Response } from 'express';
import { BudgetService, BudgetDTO } from '../services/budget.service';
import Joi from 'joi';
import logger from '../utils/logger';

const createBudgetSchema = Joi.object({
  category: Joi.string().min(1).max(100).required(),
  amount: Joi.number().positive().required(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
});

const updateBudgetSchema = Joi.object({
  category: Joi.string().min(1).max(100).optional(),
  amount: Joi.number().positive().optional(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
});

const bulkBudgetSchema = Joi.array().items(
  Joi.object({
    category: Joi.string().min(1).max(100).required(),
    amount: Joi.number().positive().required(),
    month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
  })
).min(1);

export class BudgetController {
  private budgetService = new BudgetService();

  async createBudget(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createBudgetSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const userId = (req as { user?: { id: string } }).user?.id || '';
      const budgetData: BudgetDTO = value;

      const budget = await this.budgetService.createBudget(userId, budgetData);

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget
      });

    } catch (error) {
      logger.error('Error creating budget:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async upsertBudgets(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = bulkBudgetSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const userId = (req as { user?: { id: string } }).user?.id || '';
      const budgetsData: BudgetDTO[] = value;

      const budgets = await this.budgetService.upsertBudgets(userId, budgetsData);

      res.status(200).json({
        success: true,
        message: 'Budgets created/updated successfully',
        data: budgets
      });

    } catch (error) {
      logger.error('Error upserting budgets:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async updateBudget(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as { user?: { id: string } }).user?.id || '';

      const { error, value } = updateBudgetSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const budget = await this.budgetService.updateBudget(userId, id, value);

      res.json({
        success: true,
        message: 'Budget updated successfully',
        data: budget
      });

    } catch (error) {
      logger.error('Error updating budget:', error);
      if (error instanceof Error && error.message === 'Budget not found') {
        res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async deleteBudget(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as { user?: { id: string } }).user?.id || '';

      await this.budgetService.deleteBudget(userId, id);

      res.json({
        success: true,
        message: 'Budget deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting budget:', error);
      if (error instanceof Error && error.message === 'Budget not found') {
        res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getBudgets(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';
      const month = req.query.month as string | undefined;

      const budgets = await this.budgetService.getBudgets(userId, month);

      res.json({
        success: true,
        data: budgets
      });

    } catch (error) {
      logger.error('Error getting budgets:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getBudgetByCategory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';
      const { category } = req.params;
      const month = req.query.month as string | undefined;

      const budget = await this.budgetService.getBudgetByCategory(userId, category, month);

      if (!budget) {
        res.status(404).json({
          success: false,
          message: 'Budget not found for this category'
        });
        return;
      }

      res.json({
        success: true,
        data: budget
      });

    } catch (error) {
      logger.error('Error getting budget by category:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}
