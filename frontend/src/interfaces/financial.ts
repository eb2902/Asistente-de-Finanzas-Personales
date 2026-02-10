export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  merchant?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowData {
  date: string;
  income: number;
  expense: number;
}

export interface DashboardMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  transactionCount: number;
}

export interface GoalProjectionData {
  month: string;
  amount: number;
  target: number;
}

export interface AISuggestion {
  id: string;
  description: string;
  amount: number;
  suggestedCategory: string;
  confidence: number;
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  interestRate: number;
  compoundFrequency: number;
}

export interface DashboardData {
  cashFlow: CashFlowData[];
  goalProjections: GoalProjectionData[];
  recentTransactions: Transaction[];
  aiSuggestions: AISuggestion[];
  goals: Goal[];
  metrics: DashboardMetrics;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
  status?: number;
}

export interface GoalData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  interestRate: number;
  compoundFrequency: number;
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  merchant?: string;
}

export interface UpdateTransactionData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  merchant?: string;
}
