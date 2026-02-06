import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { NLPCategorizationService } from '../services/nlp.service';
import Joi from 'joi';

// Validation schemas
const createTransactionSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  merchant: Joi.string().optional(),
});

const categorizeTransactionSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
});

export class TransactionsController {
  private nlpService = new NLPCategorizationService();

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

      const { description, amount, type, merchant } = value;
      const userId = (req as any).user.id; // From auth middleware

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

      // Create transaction
      const transaction = new Transaction();
      transaction.description = description;
      transaction.amount = amount;
      transaction.type = type;
      transaction.merchant = merchant || null;
      transaction.userId = userId;

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
          console.error('Categorization failed:', error);
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
      const transactionRepository = getRepository(Transaction);
      const savedTransaction = await transactionRepository.save(transaction);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: savedTransaction.toJSON()
      });

    } catch (error) {
      console.error('Error creating transaction:', error);
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
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const transactionRepository = getRepository(Transaction);
      const [transactions, total] = await transactionRepository.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset
      });

      res.json({
        success: true,
        data: {
          transactions: transactions.map(t => t.toJSON()),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting transactions:', error);
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
      const userId = (req as any).user.id;

      const transactionRepository = getRepository(Transaction);
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
      console.error('Error getting transaction:', error);
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
      const userId = (req as any).user.id;

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

      const transactionRepository = getRepository(Transaction);
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

      // Re-categorize if description changed and it's an expense
      if (transaction.type === 'expense' && transaction.description !== value.description) {
        try {
          const categorization = await this.nlpService.categorizeTransaction(value.description);
          transaction.category = categorization.category;
          transaction.confidence = categorization.confidence;
        } catch (error) {
          console.error('Re-categorization failed:', error);
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
      console.error('Error updating transaction:', error);
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
      const userId = (req as any).user.id;

      const transactionRepository = getRepository(Transaction);
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
      console.error('Error deleting transaction:', error);
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
      console.error('Error categorizing transaction:', error);
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
      const userId = (req as any).user.id;
      const transactionRepository = getRepository(Transaction);

      // Get total income and expenses
      const [totalIncome, totalExpenses] = await Promise.all([
        transactionRepository
          .createQueryBuilder('t')
          .select('SUM(t.amount)', 'total')
          .where('t.userId = :userId', { userId })
          .andWhere('t.type = :type', { type: 'income' })
          .getRawOne(),
        transactionRepository
          .createQueryBuilder('t')
          .select('SUM(t.amount)', 'total')
          .where('t.userId = :userId', { userId })
          .andWhere('t.type = :type', { type: 'expense' })
          .getRawOne()
      ]);

      // Get category breakdown for expenses
      const categoryBreakdown = await transactionRepository
        .createQueryBuilder('t')
        .select('t.category', 'category')
        .addSelect('SUM(t.amount)', 'total')
        .addSelect('COUNT(t.id)', 'count')
        .where('t.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: 'expense' })
        .andWhere('t.category IS NOT NULL')
        .groupBy('t.category')
        .orderBy('total', 'DESC')
        .getRawMany();

      res.json({
        success: true,
        data: {
          totalIncome: parseFloat(totalIncome?.total || '0'),
          totalExpenses: parseFloat(totalExpenses?.total || '0'),
          balance: parseFloat(totalIncome?.total || '0') - parseFloat(totalExpenses?.total || '0'),
          categoryBreakdown
        }
      });

    } catch (error) {
      console.error('Error getting transaction stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}