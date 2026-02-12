import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import Layout from '../components/common/Layout';
import { Goal } from '../interfaces/financial';
import { Plus, Edit, Trash2, TrendingUp, Calculator, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateCompoundInterest, calculateTimeToGoal } from '../utils/compoundInterest';

interface GoalFormData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  interestRate: number;
  compoundFrequency: number;
}

const GoalsPage: React.FC = () => {
  const {
    data,
    loading,
    fetchDashboardData,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useDashboardStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    startDate: '',
    endDate: '',
    interestRate: 0.05,
    compoundFrequency: 12,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      startDate: '',
      endDate: '',
      interestRate: 0.05,
      compoundFrequency: 12,
    });
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      startDate: goal.startDate,
      endDate: goal.endDate,
      interestRate: goal.interestRate,
      compoundFrequency: goal.compoundFrequency,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const goalData = {
      ...formData,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount),
      interestRate: Number(formData.interestRate),
      compoundFrequency: Number(formData.compoundFrequency),
    };

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
        toast.success('Meta actualizada exitosamente');
      } else {
        await createGoal(goalData);
        toast.success('Meta creada exitosamente');
      }
      
      setIsModalOpen(false);
      setEditingGoal(null);
      fetchDashboardData();
    } catch {
      toast.error(editingGoal ? 'Error al actualizar la meta' : 'Error al crear la meta');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta meta?')) {
      return;
    }

    try {
      await deleteGoal(goalId);
      toast.success('Meta eliminada exitosamente');
      fetchDashboardData();
    } catch {
      toast.error('Error al eliminar la meta');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateProjection = (goal: Goal) => {
    const { currentAmount, targetAmount, interestRate, compoundFrequency, endDate } = goal;
    const startDate = new Date();
    const end = new Date(endDate);
    const years = Math.max((end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365), 0);
    
    const futureValue = calculateCompoundInterest({
      principal: Number(currentAmount),
      rate: Number(interestRate),
      time: years,
      frequency: Number(compoundFrequency),
    });

    const monthsToGoal = calculateTimeToGoal(
      Number(currentAmount),
      Number(targetAmount),
      Number(interestRate),
      Number(compoundFrequency)
    );

    const totalInterest = futureValue - Number(currentAmount);

    return {
      futureValue: Math.round(futureValue * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      years: Math.round(years * 10) / 10,
      monthsToGoal: Math.round(monthsToGoal),
      willSurpass: futureValue >= Number(targetAmount),
    };
  };

  const firstGoal = data?.goals?.[0];
  const projection = firstGoal ? calculateProjection(firstGoal) : null;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-white">Cargando metas...</div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Configuración de Metas</h1>
            <p className="text-gray-400">Gestiona tus objetivos financieros y proyecciones</p>
          </div>
          <button
            onClick={handleCreateGoal}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Meta</span>
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            
            return (
              <div
                key={goal.id}
                className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(goal.startDate).toLocaleDateString('es-ES')} - {new Date(goal.endDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progreso</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Actual</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Objetivo</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-700 pt-3">
                  <span>Tasa de interés: {(goal.interestRate * 100).toFixed(2)}%</span>
                  <span>Capitalización: {goal.compoundFrequency} veces/año</span>
                </div>

                {/* Status Badge */}
                {isCompleted && (
                  <div className="mt-3 flex items-center justify-center">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">
                      ¡Meta alcanzada!
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {data?.goals && data.goals.length > 0 && projection && (
          <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-green-500/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-green-400" />
              Proyección de Interés Compuesto
            </h2>
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Fórmula: A = P(1 + r/n)^(nt)
              </p>
              <p className="text-xs text-gray-500">
                P={formatCurrency(firstGoal!.currentAmount)}, r={(firstGoal!.interestRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-sm text-gray-400">Valor Futuro</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(projection.futureValue)}</p>
                <p className="text-xs text-gray-500">{projection.years} años</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-sm text-gray-400">Interés Ganado</p>
                <p className="text-2xl font-bold text-blue-400">+{formatCurrency(projection.totalInterest)}</p>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <p className="text-sm text-gray-400">Tiempo a Meta</p>
                <p className="text-2xl font-bold text-purple-400">{projection.monthsToGoal} meses</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <span className="text-green-400 font-medium">
                {projection.willSurpass ? '🎉 ¡Alcanzarás tu meta!' : '⚠️ Necesitas aumentar ahorros'}
              </span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!data || data.goals.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No tienes metas configuradas</h3>
            <p className="text-gray-400 mb-6">Crea tu primera meta financiera para comenzar a planificar tu futuro</p>
            <button
              onClick={handleCreateGoal}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
            >
              Crear Primera Meta
            </button>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la Meta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Viaje a Europa"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto Objetivo
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto Actual
                  </label>
                  <input
                    type="number"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tasa de Interés (%)
                  </label>
                  <input
                    type="number"
                    value={formData.interestRate * 100}
                    onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) / 100 })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frecuencia
                  </label>
                  <select
                    value={formData.compoundFrequency}
                    onChange={(e) => setFormData({ ...formData, compoundFrequency: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Anual</option>
                    <option value={2}>Semestral</option>
                    <option value={4}>Trimestral</option>
                    <option value={12}>Mensual</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
                >
                  {editingGoal ? 'Actualizar Meta' : 'Crear Meta'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGoal(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GoalsPage;