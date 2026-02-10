import { create } from 'zustand';
import { DashboardData, DateRange } from '../interfaces/financial';
import { generateCompoundProjection } from '../utils/compoundInterest';
import { Transaction } from '../interfaces/financial';
import { transactionService } from '../services/transactionService';
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
  applyAISuggestion: (suggestionId: string) => void;
  dismissAISuggestion: (suggestionId: string) => void;
  
  // Transaction Actions
  setTransactions: (transactions: Transaction[]) => void;
  setTransactionsLoading: (loading: boolean) => void;
  setTransactionsError: (error: string | null) => void;
  setTransactionsPage: (page: number) => void;
  setTransactionsTotalPages: (totalPages: number) => void;
  fetchTransactions: (page?: number) => Promise<void>;
  createTransaction: (data: any) => Promise<void>;
  updateTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
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

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedGoal: (goalId) => set({ selectedGoal: goalId }),

  fetchDashboardData: async () => {
    set({ loading: true });
    try {
      // Simulación de llamada API
      const mockData: DashboardData = {
        cashFlow: [
          { date: '2024-01-01', income: 5000, expense: 3000 },
          { date: '2024-01-02', income: 4500, expense: 3500 },
          { date: '2024-01-03', income: 6000, expense: 2500 },
          { date: '2024-01-04', income: 5500, expense: 4000 },
          { date: '2024-01-05', income: 7000, expense: 3200 },
        ],
        goalProjections: [
          { month: 'Ene', amount: 1000, target: 5000 },
          { month: 'Feb', amount: 2100, target: 5000 },
          { month: 'Mar', amount: 3310, target: 5000 },
          { month: 'Abr', amount: 4641, target: 5000 },
          { month: 'May', amount: 6105, target: 5000 },
        ],
        recentTransactions: [
          {
            id: '1',
            description: 'Supermercado',
            amount: 150,
            type: 'expense',
            category: 'Alimentos',
            date: '2024-01-05',
            createdAt: '2024-01-05T10:00:00Z',
            updatedAt: '2024-01-05T10:00:00Z',
          },
          {
            id: '2',
            description: 'Sueldo',
            amount: 3000,
            type: 'income',
            category: 'Salario',
            date: '2024-01-01',
            createdAt: '2024-01-01T09:00:00Z',
            updatedAt: '2024-01-01T09:00:00Z',
          },
        ],
        aiSuggestions: [
          {
            id: '1',
            description: 'Cafetería del trabajo',
            amount: 25,
            suggestedCategory: 'Alimentos',
            confidence: 0.95,
            date: '2024-01-05',
          },
          {
            id: '2',
            description: 'Transporte público',
            amount: 12,
            suggestedCategory: 'Transporte',
            confidence: 0.88,
            date: '2024-01-04',
          },
        ],
        goals: [
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
        ],
      };

      set({ data: mockData, loading: false });
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
      set({
        transactionsError: 'Error de conexión al cargar transacciones',
        transactionsLoading: false,
      });
    }
  },

  createTransaction: async (data) => {
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
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la transacción');
    }
  },

  updateTransaction: async (id, data) => {
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
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la transacción');
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
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la transacción');
    }
  },

  refreshTransactions: async () => {
    await get().fetchTransactions(get().transactionsPage);
  },
}));
