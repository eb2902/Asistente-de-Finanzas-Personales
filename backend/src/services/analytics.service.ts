import { AppDataSource } from '../config/database';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import logger from '../utils/logger';

export interface MonthlyData {
  month: string;
  total: number;
  count: number;
}

export interface CategoryData {
  category: string;
  total: number;
  count: number;
  average: number;
}

export interface ProjectionData {
  currentMonth: string;
  projection: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  monthlyData: MonthlyData[];
  method: 'linear_regression' | 'weighted_average';
}

export interface AnomalyAlert {
  category: string;
  currentAmount: number;
  averageAmount: number;
  percentageOver: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface AnomaliesData {
  alerts: AnomalyAlert[];
  analyzedTransactions: number;
  analysisPeriod: string;
}

export interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  difference: number;
  percentageUsed: number;
  status: 'under_budget' | 'on_track' | 'over_budget';
  isCustomBudget?: boolean;
}

export interface MonthlyTrendData {
  month: string;
  total: number;
  count: number;
  average: number;
  previousMonthDiff: number;
  percentageChange: number;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'positive' | 'info';
  title: string;
  message: string;
  category?: string;
  priority: number;
}

/**
 * Servicio de análisis financiero con IA
 * Proporciona proyecciones, detección de anomalías e insights
 */
export class AnalyticsService {
  private transactionRepository = AppDataSource.getRepository(Transaction);

  /**
   * Obtiene los datos mensuales de gastos para los últimos N meses
   */
  async getMonthlyExpenses(userId: string, months: number = 3): Promise<MonthlyData[]> {
    try {
      // Calcular la fecha de inicio en JavaScript para evitar problemas con INTERVAL en TypeORM
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      const startDateStr = startDate.toISOString().slice(0, 10); // YYYY-MM-DD
      
      const result = await this.transactionRepository
        .createQueryBuilder('t')
        .select("TO_CHAR(t.date, 'YYYY-MM')", 'month')
        .addSelect('SUM(t.amount)', 'total')
        .addSelect('COUNT(t.id)', 'count')
        .where('t.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: 'expense' })
        .andWhere('t.date >= :startDate', { startDate: startDateStr })
        .andWhere('t.date IS NOT NULL')
        .groupBy("TO_CHAR(t.date, 'YYYY-MM')")
        .orderBy('month', 'ASC')
        .getRawMany();

      return result.map((row: { month: string; total: string; count: string }) => ({
        month: row.month,
        total: parseFloat(row.total) || 0,
        count: parseInt(row.count) || 0,
      }));
    } catch (error) {
      logger.error('Error getting monthly expenses:', error);
      throw error;
    }
  }

  /**
   * Obtiene los datos de gastos por categoría para el mes actual
   */
  async getCurrentMonthCategoryExpenses(userId: string): Promise<CategoryData[]> {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      
      // Calcular el último día del mes actual
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      const result = await this.transactionRepository
        .createQueryBuilder('t')
        .select('t.category', 'category')
        .addSelect('SUM(t.amount)', 'total')
        .addSelect('COUNT(t.id)', 'count')
        .addSelect('AVG(t.amount)', 'average')
        .where('t.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: 'expense' })
        .andWhere('t.date >= :startDate', { startDate })
        .andWhere('t.date <= :endDate', { endDate })
        .andWhere('t.category IS NOT NULL')
        .groupBy('t.category')
        .orderBy('total', 'DESC')
        .getRawMany();

      return result.map((row: { category: string; total: string; count: string; average: string }) => ({
        category: row.category,
        total: parseFloat(row.total) || 0,
        count: parseInt(row.count) || 0,
        average: parseFloat(row.average) || 0,
      }));
    } catch (error) {
      logger.error('Error getting category expenses:', error);
      throw error;
    }
  }

  /**
   * Obtiene los datos históricos de gastos por categoría (últimos 3 meses)
   */
  async getHistoricalCategoryExpenses(userId: string): Promise<CategoryData[]> {
    try {
      // Calcular la fecha de inicio (hace 3 meses) en JavaScript
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const startDateStr = startDate.toISOString().slice(0, 10); // YYYY-MM-DD
      
      const result = await this.transactionRepository
        .createQueryBuilder('t')
        .select('t.category', 'category')
        .addSelect('SUM(t.amount)', 'total')
        .addSelect('COUNT(t.id)', 'count')
        .addSelect('AVG(t.amount)', 'average')
        .where('t.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: 'expense' })
        .andWhere('t.date >= :startDate', { startDate: startDateStr })
        .andWhere('t.category IS NOT NULL')
        .groupBy('t.category')
        .orderBy('total', 'DESC')
        .getRawMany();

      return result.map((row: { category: string; total: string; count: string; average: string }) => ({
        category: row.category,
        total: parseFloat(row.total) || 0,
        count: parseInt(row.count) || 0,
        average: parseFloat(row.average) || 0,
      }));
    } catch (error) {
      logger.error('Error getting historical category expenses:', error);
      throw error;
    }
  }

  /**
   * Calcula la proyección del gasto para el mes siguiente
   * Usa regresión lineal simple o promedio móvil ponderado
   */
  async calculateProjection(userId: string, method: 'linear_regression' | 'weighted_average' = 'weighted_average'): Promise<ProjectionData> {
    try {
      const monthlyData = await this.getMonthlyExpenses(userId, 3);
      
      if (monthlyData.length < 2) {
        // No hay suficientes datos para proyectar
        const currentMonth = new Date().toISOString().slice(0, 7);
        return {
          currentMonth,
          projection: monthlyData[0]?.total || 0,
          trend: 'stable',
          confidence: 0,
          monthlyData,
          method,
        };
      }

      let projection: number;
      let trend: 'increasing' | 'decreasing' | 'stable';
      let confidence: number;

      if (method === 'linear_regression') {
        const regression = this.linearRegression(monthlyData);
        projection = regression.prediction;
        trend = regression.trend;
        confidence = regression.rSquared;
      } else {
        const weighted = this.weightedMovingAverage(monthlyData);
        projection = weighted.prediction;
        trend = weighted.trend;
        confidence = weighted.confidence;
      }

      const currentMonth = new Date().toISOString().slice(0, 7);

      return {
        currentMonth,
        projection: Math.round(projection * 100) / 100,
        trend,
        confidence: Math.round(confidence * 100) / 100,
        monthlyData,
        method,
      };
    } catch (error) {
      logger.error('Error calculating projection:', error);
      throw error;
    }
  }

  /**
   * Regresión lineal simple para proyección
   */
  private linearRegression(data: MonthlyData[]): { prediction: number; trend: 'increasing' | 'decreasing' | 'stable'; rSquared: number } {
    const n = data.length;
    if (n < 2) {
      return { prediction: data[0]?.total || 0, trend: 'stable', rSquared: 0 };
    }

    // Asignar valores numéricos a los meses (0, 1, 2, ...)
    const x = data.map((_, i) => i);
    const y = data.map(d => d.total);

    // Calcular promedios
    const avgX = x.reduce((a, b) => a + b, 0) / n;
    const avgY = y.reduce((a, b) => a + b, 0) / n;

    // Calcular pendiente (m) e intercept (b)
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - avgX) * (y[i] - avgY);
      denominator += (x[i] - avgX) ** 2;
    }

    const m = denominator !== 0 ? numerator / denominator : 0;
    const b = avgY - m * avgX;

    // Proyectar para el siguiente mes (x = n)
    const prediction = m * n + b;

    // Calcular R² para la confianza
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = m * x[i] + b;
      ssRes += (y[i] - predicted) ** 2;
      ssTot += (y[i] - avgY) ** 2;
    }
    const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

    // Determinar tendencia
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (m > 10) {
      trend = 'increasing';
    } else if (m < -10) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      prediction: Math.max(0, prediction), // No permitir valores negativos
      trend,
      rSquared: Math.max(0, Math.min(1, rSquared)),
    };
  }

  /**
   * Promedio móvil ponderado para proyección
   * Da más peso a los meses más recientes
   */
  private weightedMovingAverage(data: MonthlyData[]): { prediction: number; trend: 'increasing' | 'decreasing' | 'stable'; confidence: number } {
    const n = data.length;
    if (n < 2) {
      return { prediction: data[0]?.total || 0, trend: 'stable', confidence: 0 };
    }

    // Pesos: más peso a meses recientes (0.2, 0.3, 0.5 para 3 meses)
    const weights = n === 2 ? [0.4, 0.6] : [0.2, 0.3, 0.5];
    const reversedData = [...data].reverse(); // Más reciente primero

    let weightedSum = 0;
    let weightSum = 0;
    
    for (let i = 0; i < n; i++) {
      weightedSum += reversedData[i].total * weights[i];
      weightSum += weights[i];
    }

    const prediction = weightedSum / weightSum;

    // Calcular tendencia basada en la diferencia entre el último y primer mes
    const firstMonth = data[0].total;
    const lastMonth = data[data.length - 1].total;
    const diff = lastMonth - firstMonth;
    const percentChange = firstMonth !== 0 ? (diff / firstMonth) * 100 : 0;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (percentChange > 5) {
      trend = 'increasing';
    } else if (percentChange < -5) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    // La confianza es mayor cuando hay menos variación
    const avg = data.reduce((a, b) => a + b.total, 0) / n;
    const variance = data.reduce((a, b) => a + (b.total - avg) ** 2, 0) / n;
    const cv = avg !== 0 ? Math.sqrt(variance) / avg : 1; // Coeficiente de variación
    const confidence = Math.max(0, Math.min(1, 1 - cv));

    return {
      prediction: Math.round(prediction * 100) / 100,
      trend,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  /**
   * Detecta anomalías en los gastos actuales vs promedio histórico
   * Compara el mes actual con el promedio de los últimos 3 meses
   */
  async detectAnomalies(userId: string): Promise<AnomaliesData> {
    try {
      const currentMonthData = await this.getCurrentMonthCategoryExpenses(userId);
      const historicalData = await this.getHistoricalCategoryExpenses(userId);

      const alerts: AnomalyAlert[] = [];
      const analyzedTransactions = currentMonthData.reduce((sum, cat) => sum + cat.count, 0);

      for (const current of currentMonthData) {
        const historical = historicalData.find(h => h.category === current.category);
        
        if (historical && historical.average > 0) {
          const percentageOver = ((current.average - historical.average) / historical.average) * 100;

          // Solo generar alerta si supera el 20% del promedio
          if (percentageOver > 20) {
            let severity: 'low' | 'medium' | 'high';
            if (percentageOver > 50) {
              severity = 'high';
            } else if (percentageOver > 35) {
              severity = 'medium';
            } else {
              severity = 'low';
            }

            alerts.push({
              category: current.category,
              currentAmount: Math.round(current.average * 100) / 100,
              averageAmount: Math.round(historical.average * 100) / 100,
              percentageOver: Math.round(percentageOver),
              severity,
              message: `Gasto inusual en ${current.category}: ${Math.round(percentageOver)}% por encima del promedio`,
            });
          }
        }
      }

      // Ordenar alertas por severidad
      alerts.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      const analysisPeriod = 'Últimos 3 meses';

      return {
        alerts,
        analyzedTransactions,
        analysisPeriod,
      };
    } catch (error) {
      logger.error('Error detecting anomalies:', error);
      throw error;
    }
  }

  /**
   * Genera insights de IA basados en el análisis de gastos
   */
  async generateAIInsights(userId: string): Promise<AIInsight[]> {
    try {
      const insights: AIInsight[] = [];

      // Obtener datos necesarios
      const projection = await this.calculateProjection(userId);
      const anomalies = await this.detectAnomalies(userId);
      const monthlyData = await this.getMonthlyExpenses(userId, 3);
      const currentMonthData = await this.getCurrentMonthCategoryExpenses(userId);
      const historicalData = await this.getHistoricalCategoryExpenses(userId);

      // Insight 1: Proyección de presupuesto
      if (projection.trend === 'increasing' && projection.confidence > 0.5) {
        insights.push({
          id: '1',
          type: 'warning',
          title: 'Tendencia de gasto en aumento',
          message: `Al ritmo actual, tus gastos podrían aumentar un ${Math.round((projection.monthlyData[projection.monthlyData.length - 1]?.total || 0) / (projection.monthlyData[0]?.total || 1) * 100 - 100)}% respecto al mes más antiguo.`,
          priority: 2,
        });
      }

      // Insight 2: Comparación con mes anterior
      if (monthlyData.length >= 2) {
        const lastMonth = monthlyData[monthlyData.length - 1];
        const prevMonth = monthlyData[monthlyData.length - 2];
        const percentChange = prevMonth.total !== 0 
          ? ((lastMonth.total - prevMonth.total) / prevMonth.total) * 100 
          : 0;

        if (percentChange < -10) {
          insights.push({
            id: '2',
            type: 'positive',
            title: 'Buen progreso en ahorro',
            message: `Has gastado un ${Math.abs(Math.round(percentChange))}% menos que el mes pasado. ¡Sigue así!`,
            priority: 1,
          });
        } else if (percentChange > 10) {
          insights.push({
            id: '3',
            type: 'warning',
            title: 'Aumento de gastos',
            message: `Has gastado un ${Math.round(percentChange)}% más que el mes pasado.`,
            priority: 2,
          });
        }
      }

      // Insight 3: Alertas de anomalías
      for (const alert of anomalies.alerts.slice(0, 2)) {
        if (alert.severity === 'high') {
          insights.push({
            id: `alert-${alert.category}`,
            type: 'warning',
            title: `Gasto inusual en ${alert.category}`,
            message: alert.message,
            category: alert.category,
            priority: 1,
          });
        }
      }

      // Insight 4: Análisis por categoría
      for (const current of currentMonthData) {
        const historical = historicalData.find(h => h.category === current.category);
        
        if (historical) {
          const percentChange = historical.total !== 0
            ? ((current.total - historical.total) / historical.total) * 100
            : 0;

          if (percentChange > 30) {
            insights.push({
              id: `cat-${current.category}`,
              type: 'warning',
              title: `Aumento en ${current.category}`,
              message: `Tu gasto en ${current.category} aumentó un ${Math.round(percentChange)}% respecto al promedio histórico.`,
              category: current.category,
              priority: 3,
            });
          } else if (percentChange < -20) {
            insights.push({
              id: `cat-save-${current.category}`,
              type: 'positive',
              title: `Ahorro en ${current.category}`,
              message: `Has gastado un ${Math.abs(Math.round(percentChange))}% menos en ${current.category} este mes.`,
              category: current.category,
              priority: 4,
            });
          }
        }
      }

      // Insight 5: Días hasta agotar presupuesto (si hay proyección)
      if (projection.projection > 0 && currentMonthData.length > 0) {
        const totalCurrentMonth = currentMonthData.reduce((sum, cat) => sum + cat.total, 0);
        const dailyAverage = totalCurrentMonth / new Date().getDate();
        const daysLeftInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
        const projectedTotal = dailyAverage * daysLeftInMonth;

        if (projectedTotal > projection.projection * 1.2) {
          insights.push({
            id: 'budget-warning',
            type: 'warning',
            title: 'Ritmo de gasto elevado',
            message: `Al ritmo actual, podrías superar tu proyección de gastos para el mes.`,
            priority: 2,
          });
        }
      }

      // Ordenar por prioridad
      insights.sort((a, b) => a.priority - b.priority);

      // Limitar a los 5 insights más importantes
      return insights.slice(0, 5);
    } catch (error) {
      logger.error('Error generating AI insights:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos para gráfico de tendencia mensual
   */
  async getMonthlyTrend(userId: string, months: number = 6): Promise<MonthlyTrendData[]> {
    try {
      const monthlyData = await this.getMonthlyExpenses(userId, months);

      return monthlyData.map((month, index) => {
        const previousMonth = index > 0 ? monthlyData[index - 1].total : month.total;
        const previousMonthDiff = month.total - previousMonth;
        const percentageChange = previousMonth !== 0 
          ? (previousMonthDiff / previousMonth) * 100 
          : 0;

        return {
          month: month.month,
          total: month.total,
          count: month.count,
          average: month.count > 0 ? month.total / month.count : 0,
          previousMonthDiff,
          percentageChange: Math.round(percentageChange * 100) / 100,
        };
      });
    } catch (error) {
      logger.error('Error getting monthly trend:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos de comparación presupuesto vs real
   * Usa presupuestos personalizados del usuario, o fallback histórico si no existen
   */
  async getBudgetComparison(userId: string): Promise<BudgetComparison[]> {
    try {
      const currentMonthData = await this.getCurrentMonthCategoryExpenses(userId);
      const historicalData = await this.getHistoricalCategoryExpenses(userId);
      const budgetRepository = AppDataSource.getRepository(Budget);

      // Obtener el mes actual en formato YYYY-MM
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Obtener presupuestos personalizados del usuario (del mes actual o generales)
      const customBudgets = await budgetRepository
        .createQueryBuilder('b')
        .where('b.userId = :userId', { userId })
        .andWhere('(b.month = :month OR b.month IS NULL)', { month: currentMonth })
        .getMany();

      // Crear mapa de presupuestos personalizados
      const customBudgetMap = new Map<string, number>();
      for (const budget of customBudgets) {
        // Si hay presupuesto del mes específico, usarlo; si no, usar el general
        if (!customBudgetMap.has(budget.category) || (budget.month === currentMonth)) {
          customBudgetMap.set(budget.category, Number(budget.amount));
        }
      }

      // Construir comparación
      return currentMonthData.map(current => {
        // Usar presupuesto personalizado si existe, sino usar fallback histórico
        const customBudget = customBudgetMap.get(current.category);
        const historical = historicalData.find(h => h.category === current.category);
        
        let budgeted: number;
        let isCustom = false;

        if (customBudget !== undefined) {
          budgeted = customBudget;
          isCustom = true;
        } else if (historical) {
          // Fallback: 10% más que el promedio histórico
          budgeted = historical.total * 1.1;
        } else {
          // Último recurso: 10% más que el gasto actual
          budgeted = current.total * 1.1;
        }

        const difference = budgeted - current.total;
        const percentageUsed = budgeted > 0 ? (current.total / budgeted) * 100 : 0;

        let status: 'under_budget' | 'on_track' | 'over_budget';
        if (percentageUsed > 100) {
          status = 'over_budget';
        } else if (percentageUsed > 80) {
          status = 'on_track';
        } else {
          status = 'under_budget';
        }

        return {
          category: current.category,
          budgeted: Math.round(budgeted * 100) / 100,
          actual: Math.round(current.total * 100) / 100,
          difference: Math.round(difference * 100) / 100,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          status,
          isCustomBudget: isCustom,
        };
      });
    } catch (error) {
      logger.error('Error getting budget comparison:', error);
      throw error;
    }
  }
}

export default AnalyticsService;
