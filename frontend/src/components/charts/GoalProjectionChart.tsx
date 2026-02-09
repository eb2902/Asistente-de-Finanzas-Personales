import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts';
import { GoalProjectionData } from '../../interfaces/financial';
import { 
  formatCurrency, 
  getProgressColor 
} from '../../utils/compoundInterest';

interface GoalProjectionChartProps {
  data: GoalProjectionData[];
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  height?: number;
  showTooltips?: boolean;
  showLegend?: boolean;
  showScatter?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      month: string;
      amount: number;
      target: number;
    };
  }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(value);
    };
    
    return (
      <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
        <p className="text-sm text-gray-300 mb-2">{dataPoint.month}</p>
        <div className="space-y-1">
          <p className="text-blue-400 text-sm">
            Proyección: {formatCurrency(dataPoint.amount)}
          </p>
          <p className="text-purple-400 text-sm">
            Meta: {formatCurrency(dataPoint.target)}
          </p>
          <p className="text-sm font-semibold text-white">
            Progreso: {((dataPoint.amount / dataPoint.target) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const GoalProjectionChart: React.FC<GoalProjectionChartProps> = ({
  data,
  goalName,
  currentAmount,
  targetAmount,
  height = 400,
  showTooltips = true,
  showLegend = true,
  showScatter = false,
}) => {
  // Calcular estadísticas
  const lastMonthData = data[data.length - 1];
  const progressPercentage = (lastMonthData.amount / targetAmount) * 100;
  const timeToGoal = data.length; // Meses proyectados

  const renderChart = () => {
    if (showScatter) {
      return (
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#9ca3af' }}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fill: '#9ca3af' }}
            tickFormatter={formatCurrency}
            stroke="#9ca3af"
          />
          <ZAxis dataKey="amount" range={[60, 120]} />
          {showTooltips && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => (
                <span className="text-gray-300">{value}</span>
              )}
            />
          )}
          
          <ReferenceLine 
            y={targetAmount} 
            stroke="#8b5cf6" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ value: 'Meta', position: 'insideTopRight', fill: '#c084fc' }}
          />
          
          <Scatter
            name="Proyección"
            data={data}
            fill="#60a5fa"
            line={{ stroke: '#60a5fa', strokeWidth: 2 }}
          />
        </ScatterChart>
      );
    }

    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#9ca3af' }}
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
            formatter={(value) => (
              <span className="text-gray-300">{value}</span>
            )}
          />
        )}
        
        {/* Línea de meta */}
        <ReferenceLine 
          y={targetAmount} 
          stroke="#8b5cf6" 
          strokeDasharray="5 5" 
          strokeWidth={2}
          label={{ value: 'Meta', position: 'insideTopRight', fill: '#c084fc' }}
        />
        
        {/* Línea de proyección */}
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#60a5fa"
          strokeWidth={3}
          dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#93c5fd', strokeWidth: 2 }}
          name="Proyección"
        />
        
        {/* Línea de meta (para comparación) */}
        <Line
          type="monotone"
          dataKey="target"
          stroke="#8b5cf6"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          name="Meta"
          isAnimationActive={false}
        />
      </LineChart>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{goalName}</h3>
          <p className="text-sm text-gray-400">Proyección con Interés Compuesto</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-400">Actual</p>
              <p className="text-white font-semibold">{formatCurrency(currentAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Meta</p>
              <p className="text-purple-400 font-semibold">{formatCurrency(targetAmount)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progreso</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
              backgroundColor: getProgressColor(progressPercentage),
            }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Tiempo proyectado: {timeToGoal} meses para alcanzar la meta
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
      
      {/* Leyenda personalizada */}
      <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Proyección</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-px bg-purple-500"></div>
          <span>Meta</span>
        </div>
        {showScatter && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Datos reales</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalProjectionChart;