import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CashFlowData } from '../../interfaces/financial';

interface CashFlowChartProps {
  data: CashFlowData[];
  height?: number;
  showTooltips?: boolean;
  showLegend?: boolean;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  height = 400,
  showTooltips = true,
  showLegend = true,
}) => {
  // Calcular el flujo neto para cada punto
  const chartData = data.map(item => ({
    ...item,
    net: item.income - item.expense,
  }));

  // Calcular estadísticas
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const netFlow = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-sm text-gray-300 mb-2">{formatDate(dataPoint.date)}</p>
          <div className="space-y-1">
            <p className="text-green-400 text-sm">
              Ingresos: {formatCurrency(dataPoint.income)}
            </p>
            <p className="text-red-400 text-sm">
              Gastos: {formatCurrency(dataPoint.expense)}
            </p>
            <p className={`text-sm font-semibold ${
              dataPoint.net >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              Neto: {formatCurrency(dataPoint.net)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Flujo de Caja</h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">Resumen</p>
          <p className="text-green-400 font-semibold">{formatCurrency(netFlow)}</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#9ca3af' }}
            tickFormatter={formatDate}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fill: '#9ca3af' }}
            tickFormatter={formatCurrency}
            stroke="#9ca3af"
          />
          {showTooltips && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value, entry) => (
                <span className="text-gray-300">{value}</span>
              )}
            />
          )}
          
          {/* Línea de referencia en cero */}
          <ReferenceLine 
            y={0} 
            stroke="#6b7280" 
            strokeDasharray="5 5" 
            strokeWidth={1}
          />
          
          {/* Área de ingresos */}
          <Area
            type="monotone"
            dataKey="income"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
            strokeWidth={2}
            name="Ingresos"
          />
          
          {/* Área de gastos (invertida para mostrar debajo del eje) */}
          <Area
            type="monotone"
            dataKey="expense"
            stackId="1"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
            strokeWidth={2}
            name="Gastos"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Leyenda personalizada */}
      <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Ingresos</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Gastos</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-px bg-gray-500"></div>
          <span>Break-even</span>
        </div>
      </div>
    </div>
  );
};

export default CashFlowChart;