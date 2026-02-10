import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Save, Loader2, Sparkles } from 'lucide-react';
import { CreateTransactionData } from '../../interfaces/financial';
import { transactionService } from '../../services/transactionService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionData) => Promise<void>;
  transaction?: {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    merchant?: string;
  } | null;
  isLoading?: boolean;
}

const CATEGORIES = [
  'Alimentos',
  'Transporte',
  'Entretenimiento',
  'Servicios',
  'Salud',
  'Educación',
  'Vivienda',
  'Ropa',
  'Ahorro',
  'Inversiones',
  'Regalos',
  'Otros'
];

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  isLoading = false
}) => {
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    confidence: number;
  } | null>(null);
  
  const [isCategorizing, setIsCategorizing] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateTransactionData>({
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.amount || 0,
      type: transaction?.type || 'expense',
      category: transaction?.category || '',
      date: transaction?.date || new Date().toISOString().split('T')[0],
      merchant: transaction?.merchant || ''
    }
  });

  const watchedDescription = watch('description');
  const watchedType = watch('type');

  // Reset form when modal opens/closes or transaction changes
  useEffect(() => {
    if (isOpen) {
      reset({
        description: transaction?.description || '',
        amount: transaction?.amount || 0,
        type: transaction?.type || 'expense',
        category: transaction?.category || '',
        date: transaction?.date || new Date().toISOString().split('T')[0],
        merchant: transaction?.merchant || ''
      });
      setAiSuggestion(null);
    }
  }, [isOpen, transaction, reset]);

  // AI categorization effect
  useEffect(() => {
    const categorizeDescription = async () => {
      if (watchedDescription && watchedDescription.length > 3 && watchedType === 'expense') {
        setIsCategorizing(true);
        try {
          const result = await transactionService.categorizeTransaction(watchedDescription);
          if (result.success) {
            setAiSuggestion({
              category: result.data.category,
              confidence: result.data.confidence
            });
          }
        } catch (error) {
          console.log('AI categorization failed:', error);
          setAiSuggestion(null);
        } finally {
          setIsCategorizing(false);
        }
      } else {
        setAiSuggestion(null);
      }
    };

    const timeoutId = setTimeout(categorizeDescription, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchedDescription, watchedType]);

  const onSubmitForm = async (data: CreateTransactionData) => {
    try {
      await onSubmit(data);
      // El cierre del modal será manejado por el componente padre
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const handleApplyAISuggestion = () => {
    if (aiSuggestion) {
      setValue('category', aiSuggestion.category);
      setAiSuggestion(null);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    if (confidence >= 0.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Muy Alta';
    if (confidence >= 0.7) return 'Alta';
    if (confidence >= 0.5) return 'Media';
    return 'Baja';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {transaction ? 'Editar Transacción' : 'Nueva Transacción'}
              </h2>
              <p className="text-sm text-gray-400">
                {transaction ? 'Modifica los detalles de la transacción' : 'Agrega una nueva transacción'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
          {/* Tipo de Transacción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Transacción
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register('type')}
                  type="radio"
                  value="income"
                  className="form-radio text-green-500"
                />
                <span className="text-white">Ingreso</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register('type')}
                  type="radio"
                  value="expense"
                  className="form-radio text-red-500"
                />
                <span className="text-white">Gasto</span>
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <input
              {...register('description', {
                required: 'La descripción es requerida',
                minLength: {
                  value: 2,
                  message: 'La descripción debe tener al menos 2 caracteres'
                }
              })}
              type="text"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Supermercado, Sueldo, Regalo..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monto *
            </label>
            <input
              {...register('amount', {
                required: 'El monto es requerido',
                min: {
                  value: 0.01,
                  message: 'El monto debe ser mayor a 0'
                },
                valueAsNumber: true
              })}
              type="number"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha *
            </label>
            <Controller
              name="date"
              control={control}
              rules={{ required: 'La fecha es requerida' }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date: Date | null) => field.onChange(date?.toISOString().split('T')[0])}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Seleccionar fecha"
                  maxDate={new Date()}
                />
              )}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-400">{errors.date.message as string}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar categoría...</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* AI Suggestion */}
          {aiSuggestion && watchedType === 'expense' && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Sugerencia de IA</span>
                  <span className={`text-xs font-medium ${getConfidenceColor(aiSuggestion.confidence)}`}>
                    Confianza: {getConfidenceText(aiSuggestion.confidence)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleApplyAISuggestion}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors duration-200"
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSuggestion(null)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors duration-200"
                  >
                    Descartar
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                Categoría sugerida: <span className="font-medium text-blue-400">{aiSuggestion.category}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                <div
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${aiSuggestion.confidence * 100}%`,
                    backgroundColor: aiSuggestion.confidence >= 0.9 ? '#22c55e' :
                                  aiSuggestion.confidence >= 0.7 ? '#eab308' :
                                  aiSuggestion.confidence >= 0.5 ? '#f97316' : '#ef4444',
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Merchant (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comercio (Opcional)
            </label>
            <input
              {...register('merchant')}
              type="text"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Supermercado XYZ, Tienda ABC..."
            />
          </div>

          {/* Loading State */}
          {isCategorizing && (
            <div className="flex items-center space-x-2 text-blue-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analizando descripción...</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{transaction ? 'Actualizar' : 'Guardar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;