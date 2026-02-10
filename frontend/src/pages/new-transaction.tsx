import React, { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import Layout from '../components/common/Layout';
import TransactionModal from '../components/transactions/TransactionModal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const NewTransactionPage: React.FC = () => {
  const {
    createTransaction,
    fetchDashboardData,
  } = useDashboardStore();

  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleSubmit = async (data: any) => {
    try {
      await createTransaction(data);
      toast.success('Transacción creada exitosamente');
      // Redirigir al historial de transacciones
      window.location.href = '/transactions';
    } catch (error) {
      toast.error('Error al crear la transacción');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Nueva Transacción</h1>
          <p className="text-gray-400">Agrega un nuevo ingreso o gasto a tu registro financiero</p>
        </div>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            // Redirigir al dashboard si se cierra sin crear
            window.location.href = '/transactions';
          }}
          onSubmit={handleSubmit}
          transaction={null}
          isLoading={false}
        />
      </div>
    </Layout>
  );
};

export default NewTransactionPage;