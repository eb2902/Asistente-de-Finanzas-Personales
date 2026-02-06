import { create } from 'zustand';
import { DashboardData, DateRange } from '../interfaces/financial';
import { generateCompoundProjection } from '../utils/compoundInterest';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  dateRange: DateRange;
  selectedGoal: string | null;
  
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
    set({ loading: true, error: null });
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
    } catch (error) {
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
}));
