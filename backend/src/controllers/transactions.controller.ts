import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { NLPCategorizationService } from '../services/nlp.service';
import AnalyticsService from '../services/analytics.service';
import Joi from 'joi';
import logger from '../utils/logger';

// Validation schemas
const createTransactionSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().optional(),
  merchant: Joi.string().optional(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const categorizeTransactionSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
});

// Date range validation schema for query params
const dateRangeSchema = Joi.object({
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).with('startDate', 'endDate');

// Helper function to validate date range query params
function validateDateRange(query: Record<string, unknown>): { 
  valid: boolean; 
  startDate?: string; 
  endDate?: string; 
  error?: string;
} {
  const { error, value } = dateRangeSchema.validate(query);
  
  if (error) {
    return { 
      valid: false, 
      error: error.details.map(d => d.message).join(', ') 
    };
  }
  
  return { 
    valid: true, 
    startDate: value.startDate, 
    endDate: value.endDate 
  };
}

export class TransactionsController {
  private nlpService = new NLPCategorizationService();
  private analyticsService = new AnalyticsService();

  /**
   * Create a new transaction with optional AI categorization
   */
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = createTransactionSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const { description, amount, type, merchant, date } = value;
      const userId = (req as { user?: { id: string } }).user?.id ?? ''; // From auth middleware

      // Check if user exists
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Create transaction
      const transaction = new Transaction();
      transaction.description = description;
      transaction.amount = amount;
      transaction.type = type;
      transaction.merchant = merchant || null;
      transaction.userId = userId;
      // Use provided date or default to today's date (YYYY-MM-DD format)
      transaction.date = date || new Date().toISOString().split('T')[0];

      // Validate transaction data
      const validationErrors = transaction.validate();
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
        return;
      }

      // Try to categorize if it's an expense
      if (type === 'expense') {
        try {
          const categorization = await this.nlpService.categorizeTransaction(description);
          transaction.category = categorization.category;
          transaction.confidence = categorization.confidence;
        } catch (error) {
          logger.error('Categorization failed:', error);
          // Continue without categorization
          transaction.category = 'Otros';
          transaction.confidence = 0.5;
        }
      } else {
        // For income, set default category
        transaction.category = 'Ingresos';
        transaction.confidence = 1.0;
      }

      // Save transaction
      const transactionRepository = AppDataSource.getRepository(Transaction);
      const savedTransaction = await transactionRepository.save(transaction);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: savedTransaction.toJSON()
      });

    } catch (error) {
      logger.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all transactions for the authenticated user
   */
  async getUserTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Validate date range query params
      const dateValidation = validateDateRange(req.query as Record<string, unknown>);
      if (!dateValidation.valid) {
        res.status(400).json({
          success: false,
          message: 'Invalid date range',
          error: dateValidation.error
        });
        return;
      }

      const { startDate, endDate } = dateValidation;

      // Build query with optional date filtering
      const transactionRepository = AppDataSource.getRepository(Transaction);
      const queryBuilder = transactionRepository.createQueryBuilder('t')
        .where('t.userId = :userId', { userId });

      if (startDate && endDate) {
        queryBuilder.andWhere('t.date >= :startDate AND t.date <= :endDate', { 
          startDate, 
          endDate 
        });
      }

      const [transactions, total] = await queryBuilder
        .orderBy('t.createdAt', 'DESC')
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      res.json({
        success: true,
        data: {
          transactions: transactions.map(t => t.toJSON()),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          dateRange: startDate && endDate ? { startDate, endDate } : undefined
        }
      });

    } catch (error) {
      logger.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as { user?: { id: string } }).user?.id || '';

      const transactionRepository = AppDataSource.getRepository(Transaction);
      const transaction = await transactionRepository.findOne({
        where: { id, userId }
      });

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
        return;
      }

      res.json({
        success: true,
        data: transaction.toJSON()
      });

    } catch (error) {
      logger.error('Error getting transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update a transaction
   */
  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as { user?: { id: string } }).user?.id || '';

      // Validate input
      const { error, value } = createTransactionSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const transactionRepository = AppDataSource.getRepository(Transaction);
      const transaction = await transactionRepository.findOne({
        where: { id, userId }
      });

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
        return;
      }

      // Update transaction fields
      transaction.description = value.description;
      transaction.amount = value.amount;
      transaction.type = value.type;
      transaction.merchant = value.merchant || null;
      // Update date if provided
      if (value.date) {
        transaction.date = value.date;
      }

      // Re-categorize if description changed and it's an expense
      if (transaction.type === 'expense' && transaction.description !== value.description) {
        try {
          const categorization = await this.nlpService.categorizeTransaction(value.description);
          transaction.category = categorization.category;
          transaction.confidence = categorization.confidence;
        } catch (error) {
          logger.error('Re-categorization failed:', error);
          // Keep existing category
        }
      }

      // Validate updated transaction
      const validationErrors = transaction.validate();
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
        return;
      }

      const updatedTransaction = await transactionRepository.save(transaction);

      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: updatedTransaction.toJSON()
      });

    } catch (error) {
      logger.error('Error updating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as { user?: { id: string } }).user?.id || '';

      const transactionRepository = AppDataSource.getRepository(Transaction);
      const result = await transactionRepository.delete({
        id,
        userId
      });

      if (result.affected === 0) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Categorize a transaction description without saving
   */
  async categorizeTransaction(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = categorizeTransactionSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const { description } = value;
      const categorization = await this.nlpService.categorizeTransaction(description);

      res.json({
        success: true,
        data: categorization
      });

    } catch (error) {
      logger.error('Error categorizing transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get transaction statistics for the user
   */
  async getTransactionStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';

      // Validate date range query params
      const dateValidation = validateDateRange(req.query as Record<string, unknown>);
      if (!dateValidation.valid) {
        res.status(400).json({
          success: false,
          message: 'Invalid date range',
          error: dateValidation.error
        });
        return;
      }

      const { startDate, endDate } = dateValidation;

      // Build base query conditions
      const getDateCondition = () => {
        if (startDate && endDate) {
          return 'AND t.date >= :startDate AND t.date <= :endDate';
        }
        return '';
      };

      const params: Record<string, string> = { userId };
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const transactionRepository = AppDataSource.getRepository(Transaction);

      // Get total income and expenses with optional date filtering
      const [totalIncome, totalExpenses] = await Promise.all([
        transactionRepository
          .createQueryBuilder('t')
          .select('SUM(t.amount)', 'total')
          .where('t.userId = :userId', { userId })
          .andWhere('t.type = :type', { type: 'income' })
          .andWhere(`t.date IS NOT NULL ${getDateCondition()}`, params)
          .getRawOne(),
        transactionRepository
          .createQueryBuilder('t')
          .select('SUM(t.amount)', 'total')
          .where('t.userId = :userId', { userId })
          .andWhere('t.type = :type', { type: 'expense' })
          .andWhere(`t.date IS NOT NULL ${getDateCondition()}`, params)
          .getRawOne()
      ]);

      // Get category breakdown for expenses with optional date filtering
      const categoryBreakdown = await transactionRepository
        .createQueryBuilder('t')
        .select('t.category', 'category')
        .addSelect('SUM(t.amount)', 'total')
        .addSelect('COUNT(t.id)', 'count')
        .where('t.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: 'expense' })
        .andWhere('t.category IS NOT NULL')
        .andWhere(`t.date IS NOT NULL ${getDateCondition()}`, params)
        .groupBy('t.category')
        .orderBy('total', 'DESC')
        .getRawMany();

      res.json({
        success: true,
        data: {
          totalIncome: parseFloat(totalIncome?.total || '0'),
          totalExpenses: parseFloat(totalExpenses?.total || '0'),
          balance: parseFloat(totalIncome?.total || '0') - parseFloat(totalExpenses?.total || '0'),
          categoryBreakdown,
          dateRange: startDate && endDate ? { startDate, endDate } : undefined
        }
      });

    } catch (error) {
      logger.error('Error getting transaction stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get expense projection for the next month
   */
  async getExpenseProjection(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';
      const method = (req.query.method as 'linear_regression' | 'weighted_average') || 'weighted_average';

      const projection = await this.analyticsService.calculateProjection(userId, method);

      res.json({
        success: true,
        data: projection
      });

    } catch (error) {
      logger.error('Error getting expense projection:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Detect anomalies in spending
   */
  async detectAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';

      // Validate date range query params
      const dateValidation = validateDateRange(req.query as Record<string, unknown>);
      if (!dateValidation.valid) {
        res.status(400).json({
          success: false,
          message: 'Invalid date range',
          error: dateValidation.error
        });
        return;
      }

      const { startDate, endDate } = dateValidation;

      const anomalies = await this.analyticsService.detectAnomalies(userId, startDate, endDate);

      res.json({
        success: true,
        data: anomalies,
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      });

    } catch (error) {
      logger.error('Error detecting anomalies:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get AI-powered insights
   */
  async getAIInsights(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';

      const insights = await this.analyticsService.generateAIInsights(userId);

      res.json({
        success: true,
        data: insights
      });

    } catch (error) {
      logger.error('Error getting AI insights:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get monthly trend data for charts
   */
  async getMonthlyTrend(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';
      const months = parseInt(req.query.months as string) || 6;

      // Validate date range query params
      const dateValidation = validateDateRange(req.query as Record<string, unknown>);
      if (!dateValidation.valid) {
        res.status(400).json({
          success: false,
          message: 'Invalid date range',
          error: dateValidation.error
        });
        return;
      }

      const { startDate, endDate } = dateValidation;

      const trend = await this.analyticsService.getMonthlyTrend(userId, months, startDate, endDate);

      res.json({
        success: true,
        data: trend,
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      });

    } catch (error) {
      logger.error('Error getting monthly trend:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get budget vs actual comparison
   */
  async getBudgetComparison(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id || '';

      // Validate date range query params
      const dateValidation = validateDateRange(req.query as Record<string, unknown>);
      if (!dateValidation.valid) {
        res.status(400).json({
          success: false,
          message: 'Invalid date range',
          error: dateValidation.error
        });
        return;
      }

      const { startDate, endDate } = dateValidation;

      const comparison = await this.analyticsService.getBudgetComparison(userId, startDate, endDate);

      res.json({
        success: true,
        data: comparison,
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      });

    } catch (error) {
      logger.error('Error getting budget comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
