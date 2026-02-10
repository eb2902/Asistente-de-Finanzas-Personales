import { create } from 'zustand';
import { DashboardData, DateRange, ApiError, GoalData } from '../interfaces/financial';
import { generateCompoundProjection } from '../utils/compoundInterest';
import { Transaction } from '../interfaces/financial';
import { transactionService } from '../services/transactionService';
import { CreateTransactionData, UpdateTransactionData } from '../interfaces/financial';
import toast from 'react-hot-toast';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  dateRange: DateRange;
  selectedGoal: string | null;
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  transactionsPage: number;
  transactionsTotalPages: number;
  
  // Actions
  setData: (data: DashboardData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDateRange: (dateRange: DateRange) => void;
  setSelectedGoal: (goalId: string | null) => void;
  fetchDashboardData: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateGoalProjection: (goalId: string) => void;
  getFilteredData: () => {
    cashFlow: { date: string; income: number; expense: number }[];
    goalProjections: { month: string; amount: number; target: number }[];
  };
  applyAISuggestion: (suggestionId: string) => void;
  dismissAISuggestion: (suggestionId: string) => void;
  
  // Transaction Actions
  setTransactions: (transactions: Transaction[]) => void;
  setTransactionsLoading: (loading: boolean) => void;
  setTransactionsError: (error: string | null) => void;
  setTransactionsPage: (page: number) => void;
  setTransactionsTotalPages: (totalPages: number) => void;
  fetchTransactions: (page?: number) => Promise<void>;
  createTransaction: (data: CreateTransactionData) => Promise<void>;
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  
  // Goal Actions
  createGoal: (data: GoalData) => Promise<void>;
  updateGoal: (id: string, data: Partial<GoalData>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  dateRange: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  },
  selectedGoal: null,
  transactions: [],
  transactionsLoading: false,
  transactionsError: null,
  transactionsPage: 1,
  transactionsTotalPages: 0,

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedGoal: (goalId) => set({ selectedGoal: goalId }),

  getFilteredData: () => {
    const state = get();
    if (!state.data) return { cashFlow: [], goalProjections: [] };

    const { startDate, endDate } = state.dateRange;
    
    // Filtrar cashFlow por rango de fechas
    const filteredCashFlow = state.data.cashFlow.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });

    // Filtrar goalProjections por rango de fechas (si es que tienen fechas)
    // Para este ejemplo, simplemente devolvemos las proyecciones completas
    const filteredGoalProjections = state.data.goalProjections;

    return {
      cashFlow: filteredCashFlow,
      goalProjections: filteredGoalProjections,
    };
  },

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // Obtener transacciones del usuario para calcular métricas
      const transactionsResponse = await fetch(`${apiUrl}/api/transactions?page=1&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!transactionsResponse.ok) {
        throw new Error('Error al obtener transacciones');
      }

      const transactionsData = await transactionsResponse.json();
      const transactions = transactionsData.data?.transactions || [];

      // Calcular métricas del dashboard
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filtrar transacciones del mes actual
      const monthlyTransactions = transactions.filter((t: Transaction) => {
        const txDate = new Date(t.date || t.createdAt);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      });

      // Calcular ingresos y gastos del mes
      const monthlyIncome = monthlyTransactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

      const monthlyExpenses = monthlyTransactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

      // Calcular balance total
      const allIncome = transactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

      const allExpenses = transactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

      // Generar datos de cashFlow (últimos 30 días)
      const cashFlow: { date: string; income: number; expense: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransactions = transactions.filter((t: Transaction) => {
          const txDate = (t.date || t.createdAt).split('T')[0];
          return txDate === dateStr;
        });

        const income = dayTransactions
          .filter((t: Transaction) => t.type === 'income')
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

        const expense = dayTransactions
          .filter((t: Transaction) => t.type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

        cashFlow.push({ date: dateStr, income, expense });
      }

      // Generar proyecciones de metas (placeholder hasta que exista el endpoint de metas)
      const goalProjections = [
        { month: 'Ene', amount: 1000, target: 5000 },
        { month: 'Feb', amount: 2100, target: 5000 },
        { month: 'Mar', amount: 3310, target: 5000 },
        { month: 'Abr', amount: 4641, target: 5000 },
        { month: 'May', amount: 6105, target: 5000 },
      ];

      // Obtener metas del usuario (placeholder hasta que exista el endpoint)
      const goals = [
        {
          id: '1',
          name: 'Ahorro para viaje',
          targetAmount: 5000,
          currentAmount: 1000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          interestRate: 0.05,
          compoundFrequency: 12,
        },
      ];

      // Construir objeto del dashboard
      const dashboardData: DashboardData = {
        cashFlow,
        goalProjections,
        recentTransactions: transactions.slice(0, 10),
        aiSuggestions: [],
        goals,
        // Métricas adicionales
        metrics: {
          monthlyIncome,
          monthlyExpenses,
          monthlyBalance: monthlyIncome - monthlyExpenses,
          totalIncome: allIncome,
          totalExpenses: allExpenses,
          totalBalance: allIncome - allExpenses,
          transactionCount: transactions.length,
        }
      };

      // Agregar métricas al objeto data
      set({ 
        data: dashboardData, 
        loading: false 
      });
    } catch {
      set({ error: 'Error al cargar los datos del dashboard', loading: false });
    }
  },

  refreshData: async () => {
    await get().fetchDashboardData();
  },

  updateGoalProjection: (goalId: string) => {
    const state = get();
    if (!state.data) return;

    const goal = state.data.goals.find(g => g.id === goalId);
    if (!goal) return;

    // Generar nueva proyección basada en la fórmula de interés compuesto
    const projection = generateCompoundProjection(
      goal.currentAmount,
      goal.interestRate,
      12, // 12 meses de proyección
      goal.targetAmount,
      goal.compoundFrequency
    );

    set({
      data: {
        ...state.data,
        goalProjections: projection,
      },
    });
  },

  applyAISuggestion: (suggestionId: string) => {
    const state = get();
    if (!state.data) return;

    const suggestion = state.data.aiSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // Actualizar la categoría de la transacción sugerida
    // En una implementación real, esto llamaría a un endpoint API
    const updatedTransactions = state.data.recentTransactions.map(t => {
      if (t.description === suggestion.description && t.amount === suggestion.amount) {
        return { ...t, category: suggestion.suggestedCategory };
      }
      return t;
    });

    // Eliminar la sugerencia aplicada
    const updatedSuggestions = state.data.aiSuggestions.filter(s => s.id !== suggestionId);

    set({
      data: {
        ...state.data,
        recentTransactions: updatedTransactions,
        aiSuggestions: updatedSuggestions,
      },
    });
  },

  dismissAISuggestion: (suggestionId: string) => {
    const state = get();
    if (!state.data) return;

    const updatedSuggestions = state.data.aiSuggestions.filter(s => s.id !== suggestionId);

    set({
      data: {
        ...state.data,
        aiSuggestions: updatedSuggestions,
      },
    });
  },

  // Transaction Actions Implementation
  setTransactions: (transactions) => set({ transactions }),
  setTransactionsLoading: (loading) => set({ transactionsLoading: loading }),
  setTransactionsError: (error) => set({ transactionsError: error }),
  setTransactionsPage: (page) => set({ transactionsPage: page }),
  setTransactionsTotalPages: (totalPages) => set({ transactionsTotalPages: totalPages }),

  fetchTransactions: async (page = 1) => {
    set({ transactionsLoading: true, transactionsError: null });
    try {
      const response = await transactionService.getUserTransactions(page, 10);
      if (response.success) {
        set({
          transactions: response.data.transactions,
          transactionsPage: response.data.pagination.page,
          transactionsTotalPages: response.data.pagination.pages,
          transactionsLoading: false,
        });
      } else {
        set({
          transactionsError: 'Error al cargar transacciones',
          transactionsLoading: false,
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      // Si es un error de autenticación, no mostrar error (el interceptor ya redirige)
      if (apiError.message && apiError.message.includes('401')) {
        set({ transactionsLoading: false });
        return;
      }
      
      set({
        transactionsError: apiError.message || 'Error de conexión al cargar transacciones',
        transactionsLoading: false,
      });
    }
  },

  createTransaction: async (data: CreateTransactionData) => {
    try {
      const response = await transactionService.createTransaction(data);
      if (response.success) {
        toast.success('Transacción creada exitosamente');
        // Refrescar la lista de transacciones
        await get().fetchTransactions(1);
        // También podríamos refrescar el dashboard completo
        await get().fetchDashboardData();
      } else {
        toast.error(response.message || 'Error al crear la transacción');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Error al crear la transacción');
    }
  },

  updateTransaction: async (id: string, data: UpdateTransactionData) => {
    try {
      const response = await transactionService.updateTransaction(id, data);
      if (response.success) {
        toast.success('Transacción actualizada exitosamente');
        // Refrescar la lista de transacciones
        await get().fetchTransactions(get().transactionsPage);
        // También podríamos refrescar el dashboard completo
        await get().fetchDashboardData();
      } else {
        toast.error(response.message || 'Error al actualizar la transacción');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Error al actualizar la transacción');
    }
  },

  deleteTransaction: async (id) => {
    try {
      const response = await transactionService.deleteTransaction(id);
      if (response.success) {
        toast.success('Transacción eliminada exitosamente');
        // Refrescar la lista de transacciones
        await get().fetchTransactions(get().transactionsPage);
        // También podríamos refrescar el dashboard completo
        await get().fetchDashboardData();
      } else {
        toast.error(response.message || 'Error al eliminar la transacción');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Error al eliminar la transacción');
    }
  },

  refreshTransactions: async () => {
    await get().fetchTransactions(get().transactionsPage);
  },

  // Goal Actions Implementation
  createGoal: async (data: GoalData) => {
    try {
      // En una implementación real, esto llamaría a un endpoint API
      const newGoal = {
        id: `goal_${Date.now()}`,
        ...data,
      };
      
      const state = get();
      const updatedGoals = [...state.data!.goals, newGoal];
      
      set({
        data: {
          ...state.data!,
          goals: updatedGoals,
        },
      });
      
      toast.success('Meta creada exitosamente');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Error al crear la meta');
    }
  },

  updateGoal: async (id: string, data: Partial<GoalData>) => {
    try {
      const state = get();
      const updatedGoals = state.data!.goals.map(goal => 
        goal.id === id ? { ...goal, ...data } : goal
      );
      
      set({
        data: {
          ...state.data!,
          goals: updatedGoals,
        },
      });
      
      toast.success('Meta actualizada exitosamente');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Error al actualizar la meta');
    }
  },

  deleteGoal: async (id: string) => {
    try {
      const state = get();
      const updatedGoals = state.data!.goals.filter(goal => goal.id !== id);
      
      set({
        data: {
          ...state.data!,
          goals: updatedGoals,
        },
      });
      
      toast.success('Meta eliminada exitosamente');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Error al eliminar la meta');
    }
  },
}));
