import React, { useState, useEffect } from 'react';
import { Transaction } from '../../interfaces/financial';
import { transactionService } from '../../services/transactionService';
import TransactionItem from './TransactionItem';
import ConfirmDialog from '../common/ConfirmDialog';

interface TransactionListProps {
  onEditTransaction: (transaction: Transaction) => void;
  onUpdateSuccess: () => void;
  isLoading?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  onEditTransaction,
  onUpdateSuccess,
  isLoading = false
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const fetchTransactions = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionService.getUserTransactions(page, 10);
      if (response.success) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(response.data.pagination.page);
      } else {
        setError('Error al cargar transacciones');
      }
    } catch {
      // Ignoramos el error intencionalmente
      setError('Error de conexión al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar si hay token de autenticación antes de cargar transacciones
    const token = localStorage.getItem('token');
    if (!token) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    
    fetchTransactions(currentPage);
  }, [currentPage]);

  const handleDeleteTransaction = async (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      await transactionService.deleteTransaction(transactionToDelete);
      // Refrescar la lista después de eliminar
      await fetchTransactions(currentPage);
      onUpdateSuccess();
    } catch {
      // Ignoramos el error intencionalmente
      setError('Error al eliminar la transacción');
    } finally {
      setTransactionToDelete(null);
      setShowConfirmDialog(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    onEditTransaction(transaction);
  };


  if (loading || isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Transacciones Recientes</h3>
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Cargando...</span>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Transacciones Recientes</h3>
        <div className="text-sm text-gray-400">
          Página {currentPage} de {totalPages}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => fetchTransactions(currentPage)}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {transactions.length === 0 && !error ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-white mb-2">Sin transacciones</div>
          <p className="text-gray-400 mb-4">No hay transacciones para mostrar</p>
          <div className="text-sm text-gray-500">
            {localStorage.getItem('token') 
              ? "Agrega tu primera transacción para comenzar a gestionar tus finanzas"
              : "Inicia sesión para acceder a tus transacciones"
            }
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={() => handleEditTransaction(transaction)}
                onDelete={() => handleDeleteTransaction(transaction.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors duration-200"
              >
                Anterior
              </button>
              
              <div className="text-sm text-gray-400">
                Página {currentPage} de {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors duration-200"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDeleteTransaction}
        title="Eliminar Transacción"
        description="¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default TransactionList;