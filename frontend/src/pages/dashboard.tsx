import React, { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import CashFlowChart from '../components/charts/CashFlowChart';
import GoalProjectionChart from '../components/charts/GoalProjectionChart';
import AISuggestionsCard from '../components/ai/AISuggestionsCard';
import DateRangeFilter from '../components/dashboard/DateRangeFilter';
import GoalSelector from '../components/dashboard/GoalSelector';
import TransactionList from '../components/transactions/TransactionList';
import Layout from '../components/common/Layout';
import StatusIndicator from '../components/dashboard/StatusIndicator';

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
    getFilteredData,
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
    // El filtrado se maneja automáticamente en el store
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
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-white">No hay datos disponibles</div>
        </div>
      </Layout>
    );
  }

  // Obtener datos filtrados por fecha y meta seleccionada
  const { cashFlow: filteredCashFlow, goalProjections: displayData } = getFilteredData(selectedGoal);

  const selectedGoalData = selectedGoal 
    ? data.goals.find((g) => g.id === selectedGoal) 
    : null;

  return (
    <Layout>
      {/* Status Indicator Bar */}
      <div className="flex justify-end px-4 py-2">
        <StatusIndicator />
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
                  }).format(filteredCashFlow.reduce((sum, item) => sum + item.income, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Gastos Totales</span>
                <span className="text-red-400 font-semibold">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(filteredCashFlow.reduce((sum, item) => sum + item.expense, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                <span className="text-gray-400">Flujo Neto</span>
                <span className={`font-semibold ${
                  filteredCashFlow.reduce((sum, item) => sum + item.income - item.expense, 0) >= 0 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(filteredCashFlow.reduce((sum, item) => sum + item.income - item.expense, 0))}
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
              data={filteredCashFlow}
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
              onEditTransaction={() => {
                // En el dashboard, solo mostramos información, no permitimos edición directa
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
    </Layout>
  );
};

export default Dashboard;
