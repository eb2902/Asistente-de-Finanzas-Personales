import React from 'react';
import { Goal } from '../../interfaces/financial';

interface GoalSelectorProps {
  goals: Goal[];
  selectedGoal: string | null;
  onGoalChange: (goalId: string | null) => void;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({
  goals,
  selectedGoal,
  onGoalChange,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Seleccionar Meta</h3>
      
      <div className="space-y-3">
        <button
          onClick={() => onGoalChange(null)}
          className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
            selectedGoal === null
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Todas las Metas</div>
              <div className="text-sm text-gray-400">Proyección combinada</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Todas</div>
            </div>
          </div>
        </button>

        {goals.map((goal) => {
          const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
          
          return (
            <button
              key={goal.id}
              onClick={() => onGoalChange(goal.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                selectedGoal === goal.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-white">{goal.name}</div>
                  <div className="text-sm text-gray-400">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-400">{progress}%</div>
                  <div className="text-xs text-gray-500">
                    Tasa: {(goal.interestRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          No hay metas configuradas. Crea una nueva meta para comenzar.
        </div>
      )}
    </div>
  );
};

export default GoalSelector;