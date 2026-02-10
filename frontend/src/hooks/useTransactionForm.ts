import React, { useState, useCallback } from 'react';
import { CreateTransactionData } from '../services/transactionService';

interface UseTransactionFormProps {
  onSubmit: (data: CreateTransactionData) => Promise<void>;
  initialData?: Partial<CreateTransactionData>;
}

interface ValidationResult {
  isValid: boolean;
  errors: {
    description?: string;
    amount?: string;
    type?: string;
    date?: string;
  };
}

export const useTransactionForm = ({ onSubmit, initialData }: UseTransactionFormProps) => {
  const [data, setData] = useState<CreateTransactionData>({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    type: initialData?.type || 'expense',
    category: initialData?.category || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    merchant: initialData?.merchant || '',
  });

  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validate = useCallback((): ValidationResult => {
    const newErrors: ValidationResult['errors'] = {};

    // Validación de descripción
    if (!data.description || data.description.trim().length === 0) {
      newErrors.description = 'La descripción es requerida';
    } else if (data.description.trim().length < 2) {
      newErrors.description = 'La descripción debe tener al menos 2 caracteres';
    }

    // Validación de monto
    if (!data.amount || data.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    } else if (data.amount > 1000000) {
      newErrors.amount = 'El monto no puede ser mayor a 1,000,000';
    }

    // Validación de tipo
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      newErrors.type = 'Tipo de transacción inválido';
    }

    // Validación de fecha
    if (!data.date) {
      newErrors.date = 'La fecha es requerida';
    } else {
      const date = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) {
        newErrors.date = 'La fecha no puede ser futura';
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }, [data]);

  const updateField = useCallback((field: keyof CreateTransactionData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Validación en tiempo real para el campo específico
    const fieldErrors = { ...errors };
    switch (field) {
      case 'description':
        if (!value || value.trim().length === 0) {
          fieldErrors.description = 'La descripción es requerida';
        } else if (value.trim().length < 2) {
          fieldErrors.description = 'La descripción debe tener al menos 2 caracteres';
        } else {
          delete fieldErrors.description;
        }
        break;
      case 'amount':
        if (!value || value <= 0) {
          fieldErrors.amount = 'El monto debe ser mayor a 0';
        } else if (value > 1000000) {
          fieldErrors.amount = 'El monto no puede ser mayor a 1,000,000';
        } else {
          delete fieldErrors.amount;
        }
        break;
      case 'type':
        if (!value || !['income', 'expense'].includes(value)) {
          fieldErrors.type = 'Tipo de transacción inválido';
        } else {
          delete fieldErrors.type;
        }
        break;
      case 'date':
        if (!value) {
          fieldErrors.date = 'La fecha es requerida';
        } else {
          const date = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (date > today) {
            fieldErrors.date = 'La fecha no puede ser futura';
          } else {
            delete fieldErrors.date;
          }
        }
        break;
    }
    setErrors(fieldErrors);
  }, [errors]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const validation = validate();
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      setIsDirty(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Podrías manejar errores específicos aquí
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validate, onSubmit]);

  const resetForm = useCallback((newInitialData?: Partial<CreateTransactionData>) => {
    setData({
      description: newInitialData?.description || '',
      amount: newInitialData?.amount || 0,
      type: newInitialData?.type || 'expense',
      category: newInitialData?.category || '',
      date: newInitialData?.date || new Date().toISOString().split('T')[0],
      merchant: newInitialData?.merchant || '',
    });
    setErrors({});
    setIsDirty(false);
  }, []);

  const clearErrors = useCallback((field?: keyof CreateTransactionData) => {
    if (field) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  return {
    data,
    errors,
    isSubmitting,
    isDirty,
    updateField,
    handleSubmit,
    resetForm,
    clearErrors,
    validate,
  };
};