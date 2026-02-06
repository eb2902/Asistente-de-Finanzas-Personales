import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DateRange } from '../../interfaces/financial';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  const handleStartDateChange = (date: Date) => {
    onDateRangeChange({
      ...dateRange,
      startDate: date,
    });
  };

  const handleEndDateChange = (date: Date) => {
    onDateRangeChange({
      ...dateRange,
      endDate: date,
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Filtrar por Fecha</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fecha de Inicio
          </label>
          <DatePicker
            selected={dateRange.startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccionar fecha de inicio"
            maxDate={dateRange.endDate}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fecha de Fin
          </label>
          <DatePicker
            selected={dateRange.endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            minDate={dateRange.startDate}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccionar fecha de fin"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <span>
          Rango seleccionado: {dateRange.startDate.toLocaleDateString('es-ES')} - {dateRange.endDate.toLocaleDateString('es-ES')}
        </span>
        <button
          onClick={() => onDateRangeChange({
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date()
          })}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors duration-200"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilter;