import axios from 'axios';
import { Transaction, ApiError, CreateTransactionData, ProjectionData, AnomaliesData, AIInsight, BudgetComparison, MonthlyData } from '../interfaces/financial';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

// Configurar axios con interceptores para manejo de auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export interface TransactionResponse {
  success: boolean;
  message: string;
  data: Transaction;
}

export interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface TransactionStatsResponse {
  success: boolean;
  data: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    categoryBreakdown: Array<{
      category: string;
      total: string;
      count: string;
    }>;
  };
}

export const transactionService = {
  // Crear una nueva transacción
  async createTransaction(data: CreateTransactionData): Promise<TransactionResponse> {
    try {
      const response = await api.post<TransactionResponse>('/transactions', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al crear la transacción');
    }
  },

  // Obtener transacciones del usuario
  async getUserTransactions(page: number = 1, limit: number = 10): Promise<TransactionsResponse> {
    try {
      const response = await api.get<TransactionsResponse>('/transactions', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener transacciones');
    }
  },

  // Obtener una transacción específica
  async getTransactionById(id: string): Promise<TransactionResponse> {
    try {
      const response = await api.get<TransactionResponse>(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener la transacción');
    }
  },

  // Actualizar una transacción
  async updateTransaction(id: string, data: Partial<CreateTransactionData>): Promise<TransactionResponse> {
    try {
      const response = await api.put<TransactionResponse>(`/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al actualizar la transacción');
    }
  },

  // Eliminar una transacción
  async deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al eliminar la transacción');
    }
  },

  // Obtener estadísticas de transacciones
  async getTransactionStats(): Promise<TransactionStatsResponse> {
    try {
      const response = await api.get<TransactionStatsResponse>('/transactions/stats');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Categorizar una transacción (para sugerencias de IA)
  async categorizeTransaction(description: string): Promise<{
    success: boolean;
    data: {
      category: string;
      confidence: number;
    };
  }> {
    try {
      const response = await api.post('/transactions/categorize', { description });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al categorizar la transacción');
    }
  },

  // Obtener transacciones por rango de fechas
  async getTransactionsByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10
  ): Promise<TransactionsResponse> {
    try {
      const response = await api.get<TransactionsResponse>('/transactions', {
        params: {
          startDate,
          endDate,
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener transacciones por rango de fechas');
    }
  },

  // Obtener proyección de gastos para el mes siguiente
  async getExpenseProjection(method: 'linear_regression' | 'weighted_average' = 'weighted_average'): Promise<{
    success: boolean;
    data: ProjectionData;
  }> {
    try {
      const response = await api.get<{ success: boolean; data: ProjectionData }>('/transactions/analytics/projection', {
        params: { method }
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener proyección');
    }
  },

  // Detectar anomalías en gastos
  async detectAnomalies(): Promise<{
    success: boolean;
    data: AnomaliesData;
  }> {
    try {
      const response = await api.get<{ success: boolean; data: AnomaliesData }>('/transactions/analytics/anomalies');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al detectar anomalías');
    }
  },

  // Obtener insights de IA
  async getAIInsights(): Promise<{
    success: boolean;
    data: AIInsight[];
  }> {
    try {
      const response = await api.get<{ success: boolean; data: AIInsight[] }>('/transactions/analytics/insights');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener insights');
    }
  },

  // Obtener tendencia mensual
  async getMonthlyTrend(months: number = 6): Promise<{
    success: boolean;
    data: MonthlyData[];
  }> {
    try {
      const response = await api.get<{ success: boolean; data: MonthlyData[] }>('/transactions/analytics/trend', {
        params: { months }
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener tendencia');
    }
  },

  // Obtener comparación presupuesto vs real
  async getBudgetComparison(): Promise<{
    success: boolean;
    data: BudgetComparison[];
  }> {
    try {
      const response = await api.get<{ success: boolean; data: BudgetComparison[] }>('/transactions/analytics/budget');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.response?.data?.message || 'Error al obtener comparación de presupuesto');
    }
  }
};
