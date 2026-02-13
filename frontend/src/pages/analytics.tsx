import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Activity,
  PieChart,
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { MonthlyData, ProjectionData, AnomaliesData, AIInsight, BudgetComparison } from '../interfaces/financial';

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [projection, setProjection] = useState<ProjectionData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomaliesData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [budgetComparison, setBudgetComparison] = useState<BudgetComparison[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [
        trendResponse,
        projectionResponse,
        anomaliesResponse,
        insightsResponse,
        budgetResponse
      ] = await Promise.all([
        transactionService.getMonthlyTrend(6),
        transactionService.getExpenseProjection('weighted_average'),
        transactionService.detectAnomalies(),
        transactionService.getAIInsights(),
        transactionService.getBudgetComparison()
      ]);

      if (trendResponse.success) setMonthlyTrend(trendResponse.data);
      if (projectionResponse.success) setProjection(projectionResponse.data);
      if (anomaliesResponse.success) setAnomalies(anomaliesResponse.data);
      if (insightsResponse.success) setInsights(insightsResponse.data);
      if (budgetResponse.success) setBudgetComparison(budgetResponse.data);

    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching analytics data:', err);
      setError('Error al cargar los datos de análisis');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatMonth = (monthStr: any) => {
    if (!monthStr || typeof monthStr !== 'string') return '';
    const parts = monthStr.split('-');
    if (parts.length !== 2) return monthStr;
    const [year, month] = parts;
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className="w-4 h-4 text-red-400" />;
      case 'decreasing':
        return <ArrowDown className="w-4 h-4 text-green-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 border-red-500 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'low':
        return 'bg-blue-500/20 border-blue-500 text-blue-400';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'over_budget':
        return '#ef4444';
      case 'on_track':
        return '#f59e0b';
      case 'under_budget':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Análisis de Gastos</h1>
          <p className="text-gray-400">Descubre patrones y optimiza tus finanzas con IA</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* AI Insights Section */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />
              Insights de IA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight) => (
                <div 
                  key={insight.id}
                  className={`bg-gray-800 rounded-xl p-4 border-l-4 ${
                    insight.type === 'warning' ? 'border-yellow-500' :
                    insight.type === 'positive' ? 'border-green-500' : 'border-blue-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h3 className="text-white font-medium text-sm">{insight.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomalies Alerts */}
        {anomalies && anomalies.alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-400" />
              Alertas de Gastos Inusuales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anomalies.alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`rounded-xl p-4 border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{alert.category}</span>
                    <span className="text-sm">+{alert.percentageOver}%</span>
                  </div>
                  <div className="text-sm opacity-80">
                    <p>Actual: {formatCurrency(alert.currentAmount)}</p>
                    <p>Promedio: {formatCurrency(alert.averageAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Tendencia de Gasto Mensual
            </h3>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={formatMonth}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelFormatter={formatMonth}
                    formatter={(value: unknown) => [formatCurrency(Number(value) || 0), 'Gastos']}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="5 5" />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Gastos Totales"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No hay datos suficientes para mostrar la tendencia
              </div>
            )}
          </div>

          {/* Budget vs Actual Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Distribución Real vs. Presupuesto
            </h3>
            {budgetComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number"
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    type="category"
                    dataKey="category"
                    tick={{ fill: '#9ca3af' }}
                    stroke="#9ca3af"
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    formatter={(value: unknown, name?: string) => [
                      formatCurrency(Number(value) || 0), 
                      name === 'budgeted' ? 'Presupuesto' : 'Real'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="budgeted" name="Presupuesto" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Bar 
                    dataKey="actual" 
                    name="Real" 
                    radius={[0, 4, 4, 0]}
                  >
                    {budgetComparison.map((entry, _index) => (
                      <Cell key={`cell-${_index}`} fill={getBudgetStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No hay datos suficientes para mostrar la comparación
              </div>
            )}
          </div>
        </div>

        {/* Projection Stats */}
        {projection && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs text-gray-500">Proyección</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(projection.projection)}</p>
              <p className="text-sm text-gray-400">Gasto proyectado para el próximo mes</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  projection.trend === 'increasing' ? 'bg-red-500/20' :
                  projection.trend === 'decreasing' ? 'bg-green-500/20' : 'bg-gray-500/20'
                }`}>
                  {getTrendIcon(projection.trend)}
                </div>
                <span className="text-xs text-gray-500">Tendencia</span>
              </div>
              <p className="text-2xl font-bold text-white capitalize">{projection.trend}</p>
              <p className="text-sm text-gray-400">
                {projection.trend === 'increasing' ? 'Gastos en aumento' :
                 projection.trend === 'decreasing' ? 'Gastos en disminución' : 'Gastos estables'}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs text-gray-500">Confianza</span>
              </div>
              <p className="text-2xl font-bold text-white">{Math.round(projection.confidence * 100)}%</p>
              <p className="text-sm text-gray-400">Nivel de confianza de la proyección</p>
            </div>
          </div>
        )}

        {/* Historical Data Table */}
        {monthlyTrend.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-green-400" />
              Historial de Gastos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Mes</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Transacciones</th>
                    <th className="pb-3">Promedio</th>
                    <th className="pb-3">Cambio</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrend.map((month, _index) => (
                    <tr key={month.month} className="border-b border-gray-700/50">
                      <td className="py-3 text-white">{formatMonth(month.month)}</td>
                      <td className="py-3 text-white">{formatCurrency(month.total)}</td>
                      <td className="py-3 text-gray-400">{month.count}</td>
                      <td className="py-3 text-gray-400">
                        {formatCurrency(month.average || (month.count > 0 ? month.total / month.count : 0))}
                      </td>
                      <td className="py-3">
                        {month.percentageChange !== undefined && month.percentageChange !== 0 && (
                          <span className={`flex items-center ${
                            month.percentageChange > 0 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {month.percentageChange > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                            {Math.abs(month.percentageChange).toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs text-gray-500">Gasto promedio</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(
                monthlyTrend.length > 0 
                  ? monthlyTrend.reduce((sum, m) => sum + m.total, 0) / monthlyTrend.length 
                  : 0
              )}
            </p>
            <p className="text-sm text-gray-400">Por mes</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs text-gray-500">Mayor gasto</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(
                monthlyTrend.length > 0 
                  ? Math.max(...monthlyTrend.map(m => m.total)) 
                  : 0
              )}
            </p>
            <p className="text-sm text-gray-400">
              {monthlyTrend.length > 0 
                ? formatMonth(monthlyTrend.reduce((max, m) => m.total > max.total ? m : max, monthlyTrend[0]).month)
                : 'N/A'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs text-gray-500">Menor gasto</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(
                monthlyTrend.length > 0 
                  ? Math.min(...monthlyTrend.map(m => m.total)) 
                  : 0
              )}
            </p>
            <p className="text-sm text-gray-400">
              {monthlyTrend.length > 0 
                ? formatMonth(monthlyTrend.reduce((min, m) => m.total < min.total ? m : min, monthlyTrend[0]).month)
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
