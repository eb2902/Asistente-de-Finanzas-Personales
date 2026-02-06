import React from 'react';
import { AISuggestion } from '../../interfaces/financial';

interface AISuggestionsCardProps {
  suggestions: AISuggestion[];
  onApplySuggestion?: (suggestionId: string) => void;
  onDismissSuggestion?: (suggestionId: string) => void;
}

const AISuggestionsCard: React.FC<AISuggestionsCardProps> = ({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  const getCategoryColor = (category: string) => {
    const colors = {
      'Alimentos': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Transporte': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Entretenimiento': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Servicios': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Salud': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Educación': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Otros': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[category as keyof typeof colors] || colors['Otros'];
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Sugerencias de la IA</h3>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No hay sugerencias disponibles</div>
          <p className="text-sm text-gray-500">
            La IA analizará tus transacciones para ofrecer sugerencias de categorización
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Sugerencias de la IA</h3>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            {suggestions.length} sugerencia{ suggestions.length > 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{suggestion.description}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(suggestion.suggestedCategory)}`}>
                    {suggestion.suggestedCategory}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-300">
                    <span>{formatCurrency(suggestion.amount)}</span>
                    <span>{formatDate(suggestion.date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      Confianza: {getConfidenceText(suggestion.confidence)}
                    </span>
                    <div className="w-16 bg-gray-600 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${suggestion.confidence * 100}%`,
                          backgroundColor: suggestion.confidence >= 0.9 ? '#22c55e' :
                                        suggestion.confidence >= 0.7 ? '#eab308' :
                                        suggestion.confidence >= 0.5 ? '#f97316' : '#ef4444',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onApplySuggestion?.(suggestion.id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>✓</span>
                  <span>Aplicar</span>
                </button>
                <button
                  onClick={() => onDismissSuggestion?.(suggestion.id)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>✕</span>
                  <span>Descartar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-xs text-gray-400">
          Las sugerencias se basan en el análisis de tus transacciones anteriores y patrones de gasto.
        </p>
      </div>
    </div>
  );
};

export default AISuggestionsCard;