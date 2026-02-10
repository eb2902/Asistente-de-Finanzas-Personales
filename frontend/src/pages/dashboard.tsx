import React, { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import CashFlowChart from '../components/charts/CashFlowChart';
import GoalProjectionChart from '../components/charts/GoalProjectionChart';
import AISuggestionsCard from '../components/ai/AISuggestionsCard';
import DateRangeFilter from '../components/dashboard/DateRangeFilter';
import GoalSelector from '../components/dashboard/GoalSelector';
import TransactionList from '../components/transactions/TransactionList';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const {
    data,
    loading,
    error,
    dateRange,
    selectedGoal,
    fetchDashboardData,
    setDateRange,
    setSelectedGoal,
    updateGoalProjection,
    applyAISuggestion,
    dismissAISuggestion,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (selectedGoal) {
      updateGoalProjection(selectedGoal);
    }
  }, [selectedGoal, updateGoalProjection]);

  const handleDateRangeChange = (newDateRange: {
    startDate: Date;
    endDate: Date;
  }) => {
    setDateRange(newDateRange);
    // En una implementación real, esto filtraría los datos según el rango de fechas
  };

  const handleGoalChange = (goalId: string | null) => {
    setSelectedGoal(goalId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">No hay datos disponibles</div>
      </div>
    );
  }

  // Determinar qué datos mostrar según la meta seleccionada
  const displayData = selectedGoal 
    ? data.goalProjections 
    : data.goalProjections; // Para este ejemplo, mostramos las mismas proyecciones

  const selectedGoalData = data.goals.find((g) => g.id === selectedGoal);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard Financiero</h1>
              <p className="text-gray-400 mt-1">Visión general de tu situación financiera</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Última actualización</p>
                <p className="text-white font-semibold">
                  {new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
          <GoalSelector
            goals={data.goals}
            selectedGoal={selectedGoal}
            onGoalChange={handleGoalChange}
          />
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Resumen Rápido</h3>
              <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ingresos Totales</span>
                <span className="text-green-400 font-semibold">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(data.cashFlow.reduce((sum, item) => sum + item.income, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Gastos Totales</span>
                <span className="text-red-400 font-semibold">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(data.cashFlow.reduce((sum, item) => sum + item.expense, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                <span className="text-gray-400">Flujo Neto</span>
                <span className={`font-semibold ${
                  data.cashFlow.reduce((sum, item) => sum + item.income - item.expense, 0) >= 0 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(data.cashFlow.reduce((sum, item) => sum + item.income - item.expense, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cash Flow Chart */}
          <div>
            <CashFlowChart
              data={data.cashFlow}
              height={400}
              showTooltips={true}
              showLegend={true}
            />
          </div>

          {/* Goal Projection Chart */}
          <div>
            <GoalProjectionChart
              data={displayData}
              goalName={selectedGoalData?.name || 'Todas las Metas'}
              currentAmount={selectedGoalData?.currentAmount || 
                data.goals.reduce((sum, g) => sum + g.currentAmount, 0)}
              targetAmount={selectedGoalData?.targetAmount || 
                data.goals.reduce((sum, g) => sum + g.targetAmount, 0)}
              height={400}
              showTooltips={true}
              showLegend={true}
              showScatter={false}
            />
          </div>
        </div>

        {/* AI Suggestions and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Suggestions */}
          <div className="lg:col-span-1">
            <AISuggestionsCard
              suggestions={data.aiSuggestions}
              onApplySuggestion={applyAISuggestion}
              onDismissSuggestion={dismissAISuggestion}
            />
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <TransactionList
              onEditTransaction={(transaction) => {
                // En el dashboard, solo mostramos información, no permitimos edición directa
                console.log('Edit transaction:', transaction);
              }}
              onDeleteTransaction={(transactionId) => {
                // En el dashboard, solo mostramos información, no permitimos eliminación directa
                console.log('Delete transaction:', transactionId);
              }}
              onUpdateSuccess={() => {
                // Refrescar el dashboard cuando se actualicen transacciones
                fetchDashboardData();
              }}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;