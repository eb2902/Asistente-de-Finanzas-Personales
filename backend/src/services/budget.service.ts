import { AppDataSource } from '../config/database';
import { Budget } from '../models/Budget';
import logger from '../utils/logger';

export interface BudgetDTO {
  category: string;
  amount: number;
  month?: string;
}

export interface BudgetResponse {
  id: string;
  category: string;
  amount: number;
  month: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Servicio de gestión de presupuestos por categoría
 */
export class BudgetService {
  private budgetRepository = AppDataSource.getRepository(Budget);

  /**
   * Crear un nuevo presupuesto para una categoría
   */
  async createBudget(userId: string, budgetData: BudgetDTO): Promise<BudgetResponse> {
    try {
      // Verificar si ya existe un presupuesto para esta categoría y mes
      const existingBudget = await this.budgetRepository.findOne({
        where: {
          userId,
          category: budgetData.category,
          month: budgetData.month || undefined
        }
      });

      if (existingBudget) {
        // Actualizar el presupuesto existente
        existingBudget.amount = budgetData.amount;
        const updated = await this.budgetRepository.save(existingBudget);
        logger.info(`Budget updated for user ${userId}, category ${budgetData.category}`);
        return updated.toJSON();
      }

      // Crear nuevo presupuesto
      const budget = new Budget();
      budget.category = budgetData.category;
      budget.amount = budgetData.amount;
      budget.month = budgetData.month;
      budget.userId = userId;

      // Validar
      const validationErrors = budget.validate();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const saved = await this.budgetRepository.save(budget);
      logger.info(`Budget created for user ${userId}, category ${budgetData.category}`);
      
      return saved.toJSON();
    } catch (error) {
      logger.error('Error creating budget:', error);
      throw error;
    }
  }

  /**
   * Actualizar un presupuesto existente
   */
  async updateBudget(userId: string, budgetId: string, budgetData: Partial<BudgetDTO>): Promise<BudgetResponse> {
    try {
      const budget = await this.budgetRepository.findOne({
        where: { id: budgetId, userId }
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      // Actualizar campos
      if (budgetData.category !== undefined) {
        budget.category = budgetData.category;
      }
      if (budgetData.amount !== undefined) {
        budget.amount = budgetData.amount;
      }
      if (budgetData.month !== undefined) {
        budget.month = budgetData.month;
      }

      // Validar
      const validationErrors = budget.validate();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const updated = await this.budgetRepository.save(budget);
      logger.info(`Budget ${budgetId} updated for user ${userId}`);
      
      return updated.toJSON();
    } catch (error) {
      logger.error('Error updating budget:', error);
      throw error;
    }
  }

  /**
   * Eliminar un presupuesto
   */
  async deleteBudget(userId: string, budgetId: string): Promise<void> {
    try {
      const result = await this.budgetRepository.delete({
        id: budgetId,
        userId
      });

      if (result.affected === 0) {
        throw new Error('Budget not found');
      }

      logger.info(`Budget ${budgetId} deleted for user ${userId}`);
    } catch (error) {
      logger.error('Error deleting budget:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los presupuestos del usuario
   */
  async getBudgets(userId: string, month?: string): Promise<BudgetResponse[]> {
    try {
      const where: { userId: string; month?: string } = { userId };
      
      if (month) {
        where.month = month;
      }

      const budgets = await this.budgetRepository.find({
        where,
        order: { category: 'ASC' }
      });

      return budgets.map(b => b.toJSON());
    } catch (error) {
      logger.error('Error getting budgets:', error);
      throw error;
    }
  }

  /**
   * Obtener un presupuesto específico por categoría
   */
  async getBudgetByCategory(userId: string, category: string, month?: string): Promise<BudgetResponse | null> {
    try {
      let budget = await this.budgetRepository.findOne({
        where: { userId, category, month: month || undefined }
      });

      if (!budget && month) {
        budget = await this.budgetRepository.findOne({
          where: { userId, category, month: undefined }
        });
      }

      return budget ? budget.toJSON() : null;
    } catch (error) {
      logger.error('Error getting budget by category:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los presupuestos como mapa para comparación rápida
   */
  async getBudgetsMap(userId: string, month?: string): Promise<Map<string, number>> {
    try {
      const budgets = await this.getBudgets(userId, month);
      const budgetMap = new Map<string, number>();

      for (const budget of budgets) {
        budgetMap.set(budget.category, budget.amount);
      }

      return budgetMap;
    } catch (error) {
      logger.error('Error getting budgets map:', error);
      throw error;
    }
  }

  /**
   * Crear o actualizar múltiples presupuestos a la vez
   */
  async upsertBudgets(userId: string, budgetsData: BudgetDTO[]): Promise<BudgetResponse[]> {
    try {
      const results: BudgetResponse[] = [];

      for (const budgetData of budgetsData) {
        const result = await this.createBudget(userId, budgetData);
        results.push(result);
      }

      logger.info(`Upserted ${results.length} budgets for user ${userId}`);
      return results;
    } catch (error) {
      logger.error('Error upserting budgets:', error);
      throw error;
    }
  }
}

export default BudgetService;
