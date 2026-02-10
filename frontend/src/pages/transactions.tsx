import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import TransactionModal from '../components/transactions/TransactionModal';
import TransactionList from '../components/transactions/TransactionList';
import Layout from '../components/common/Layout';
import { Filter, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Transaction, CreateTransactionData, UpdateTransactionData } from '../interfaces/financial';

const TransactionsPage: React.FC = () => {
  const {
    transactions,
    transactionsLoading,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    refreshTransactions,
  } = useDashboardStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleCreateTransaction = async (data: CreateTransactionData) => {
    setLoading(true);
    try {
      await createTransaction(data);
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch {
      // Error handling is managed by the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleUpdateTransaction = async (data: UpdateTransactionData) => {
    if (!editingTransaction) return;
    
    setLoading(true);
    try {
      await updateTransaction(editingTransaction.id, data);
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch {
      // Error handling is managed by the parent component
    } finally {
      setLoading(false);
    }
  };


  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshTransactions();
      toast.success('Datos actualizados');
    } catch {
      toast.error('Error al actualizar datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Transacciones</p>
                <p className="text-2xl font-bold text-white">
                  {transactionsLoading ? '...' : transactions.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Filter className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-400">
                  {transactionsLoading ? '...' : 
                    transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Gastos Totales</p>
                <p className="text-2xl font-bold text-red-400">
                  {transactionsLoading ? '...' : 
                    transactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <TransactionList
          onEditTransaction={handleEditTransaction}
          onUpdateSuccess={handleRefresh}
          isLoading={loading}
        />
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
        transaction={editingTransaction}
        isLoading={loading}
      />
    </Layout>
  );
};

export default TransactionsPage;