import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Goal } from '../models/Goal';
import { User } from '../models/User';
import Joi from 'joi';
import logger from '../utils/logger';

// Validation schemas
const createGoalSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  targetAmount: Joi.number().positive().required(),
  currentAmount: Joi.number().min(0).default(0),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  interestRate: Joi.number().min(0).max(1).default(0.05),
  compoundFrequency: Joi.number().integer().min(1).default(12),
});

const updateGoalSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  targetAmount: Joi.number().positive().optional(),
  currentAmount: Joi.number().min(0).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  interestRate: Joi.number().min(0).max(1).optional(),
  compoundFrequency: Joi.number().integer().min(1).optional(),
}).min(1);

export class GoalsController {
  /**
   * Create a new goal
   */
  async createGoal(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = createGoalSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const { name, targetAmount, currentAmount, startDate, endDate, interestRate, compoundFrequency } = value;
      const userId = (req as { user?: { id: string } }).user?.id ?? '';

      // Check if user exists
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Create goal
      const goal = new Goal();
      goal.name = name;
      goal.targetAmount = targetAmount;
      goal.currentAmount = currentAmount || 0;
      goal.startDate = new Date(startDate).toISOString().split('T')[0];
      goal.endDate = new Date(endDate).toISOString().split('T')[0];
      goal.interestRate = interestRate || 0.05;
      goal.compoundFrequency = compoundFrequency || 12;
      goal.userId = userId;

      // Validate goal data
      const validationErrors = goal.validate();
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
        return;
      }

      // Save goal
      const goalRepository = getRepository(Goal);
      const savedGoal = await goalRepository.save(goal);

      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: savedGoal.toJSON()
      });

    } catch (error) {
      logger.error('Error creating goal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all goals for the authenticated user
   */
  async getUserGoals(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';

      const goalRepository = getRepository(Goal);
      const goals = await goalRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
      });

      res.json({
        success: true,
        data: goals.map(g => g.toJSON())
      });

    } catch (error) {
      logger.error('Error getting goals:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get a specific goal by ID
   */
  async getGoalById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as { user?: { id: string } }).user?.id || '';

      const goalRepository = getRepository(Goal);
      const goal = await goalRepository.findOne({
        where: { id, userId }
      });

      if (!goal) {
        res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
        return;
      }

      res.json({
        success: true,
        data: goal.toJSON()
      });

    } catch (error) {
      logger.error('Error getting goal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update a goal
   */
  async updateGoal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as { user?: { id: string } }).user?.id || '';

      // Validate input
      const { error, value } = updateGoalSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const goalRepository = getRepository(Goal);
      const goal = await goalRepository.findOne({
        where: { id, userId }
      });

      if (!goal) {
        res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
        return;
      }

      // Update goal fields
      if (value.name) {
        goal.name = value.name;
      }
      if (value.targetAmount) {
        goal.targetAmount = value.targetAmount;
      }
      if (value.currentAmount !== undefined) {
        goal.currentAmount = value.currentAmount;
      }
      if (value.startDate) {
        goal.startDate = new Date(value.startDate).toISOString().split('T')[0];
      }
      if (value.endDate) {
        goal.endDate = new Date(value.endDate).toISOString().split('T')[0];
      }
      if (value.interestRate !== undefined) {
        goal.interestRate = value.interestRate;
      }
      if (value.compoundFrequency !== undefined) {
        goal.compoundFrequency = value.compoundFrequency;
      }

      // Validate updated goal
      const validationErrors = goal.validate();
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
        return;
      }

      const updatedGoal = await goalRepository.save(goal);

      res.json({
        success: true,
        message: 'Goal updated successfully',
        data: updatedGoal.toJSON()
      });

    } catch (error) {
      logger.error('Error updating goal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete a goal
   */
  async deleteGoal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as { user?: { id: string } }).user?.id || '';

      const goalRepository = getRepository(Goal);
      const result = await goalRepository.delete({
        id,
        userId
      });

      if (result.affected === 0) {
        res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Goal deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting goal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
