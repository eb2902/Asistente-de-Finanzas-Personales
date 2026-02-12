import React from 'react';
import Layout from '../components/common/Layout';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Análisis de Gastos</h1>
          <p className="text-gray-400">Descubre patrones y optimiza tus finanzas</p>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Análisis Avanzado Próximamente</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            Esta sección te permitirá visualizar patrones de gasto, tendencias a lo largo del tiempo 
            y recibir recomendaciones personalizadas basadas en tu historial financiero.
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center"><PieChart className="w-4 h-4 mr-1" /> Gráficos circulares</span>
            <span className="flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> Tendencias</span>
            <span className="flex items-center"><TrendingDown className="w-4 h-4 mr-1" /> Predicciones</span>
          </div>
        </div>

        {/* Placeholder Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Distribución por Categoría</h3>
            <div className="h-48 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Gráfico de pastel en desarrollo</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Evolución Mensual</h3>
            <div className="h-48 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Gráfico de barras en desarrollo</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs text-gray-500">Gasto promedio</span>
            </div>
            <p className="text-2xl font-bold text-white">$0.00</p>
            <p className="text-sm text-gray-400">Por transacción</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs text-gray-500">Mayor gasto</span>
            </div>
            <p className="text-2xl font-bold text-white">$0.00</p>
            <p className="text-sm text-gray-400">Este mes</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs text-gray-500">Días sin gastos</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-400">Consecutivos</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
