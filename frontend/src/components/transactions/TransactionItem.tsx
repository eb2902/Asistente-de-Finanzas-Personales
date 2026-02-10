import React from 'react';
import { Transaction } from '../../interfaces/financial';
import { formatCurrency, formatDate } from '../../utils/format';
import { Edit, Trash2, Tag, Calendar, DollarSign } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete
}) => {
  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-400' : 'text-red-400';
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? '↑' : '↓';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Alimentos': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Transporte': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Entretenimiento': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Servicios': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Salud': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Educación': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Vivienda': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Ropa': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Ahorro': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Inversiones': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Regalos': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'Otros': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'Ingresos': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return colors[category as keyof typeof colors] || colors['Otros'];
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 group">
      {/* Left side: Transaction details */}
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          {/* Type indicator */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            transaction.type === 'income' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <span className="text-sm font-bold">{getTypeIcon(transaction.type)}</span>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-white">{transaction.description}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                {transaction.category}
              </span>
              {transaction.merchant && (
                <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full border border-gray-600">
                  {transaction.merchant}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(transaction.date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(transaction.amount)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>{transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={onEdit}
          className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 transition-all duration-200 hover:border-blue-500/50"
          title="Editar transacción"
        >
          <Edit className="w-4 h-4" />
        </button>
        
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-all duration-200 hover:border-red-500/50"
          title="Eliminar transacción"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Amount display */}
      <div className="ml-4">
        <div className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;