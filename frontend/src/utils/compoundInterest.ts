export interface CompoundInterestParams {
  principal: number;
  rate: number;
  time: number;
  frequency: number;
}

export interface ProjectionPoint {
  month: string;
  amount: number;
  target: number;
  monthNumber: number;
}

/**
 * Calcula el monto futuro usando la fórmula de interés compuesto: A = P(1 + r/n)^(nt)
 */
export const calculateCompoundInterest = ({
  principal,
  rate,
  time,
  frequency,
}: CompoundInterestParams): number => {
  return principal * Math.pow(1 + rate / frequency, frequency * time);
};

/**
 * Genera una proyección mensual de crecimiento con interés compuesto
 */
export const generateCompoundProjection = (
  principal: number,
  annualRate: number,
  months: number,
  targetAmount: number,
  frequency: number = 12
): ProjectionPoint[] => {
  const projection: ProjectionPoint[] = [];
  
  for (let month = 1; month <= months; month++) {
    // Convertir meses a años para la fórmula
    const years = month / 12;
    
    // Calcular el monto para este mes
    const amount = calculateCompoundInterest({
      principal,
      rate: annualRate,
      time: years,
      frequency,
    });
    
    // Formatear el nombre del mes
    const date = new Date();
    date.setMonth(date.getMonth() + month - 1);
    const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
    
    projection.push({
      month: monthName,
      amount: Math.round(amount),
      target: targetAmount,
      monthNumber: month,
    });
  }
  
  return projection;
};

/**
 * Calcula cuánto tiempo se necesita para alcanzar una meta específica
 */
export const calculateTimeToGoal = (
  principal: number,
  targetAmount: number,
  annualRate: number,
  frequency: number = 12
): number => {
  if (principal >= targetAmount) return 0;
  
  // Despejando t de la fórmula: A = P(1 + r/n)^(nt)
  // t = ln(A/P) / (n * ln(1 + r/n))
  const timeInYears = Math.log(targetAmount / principal) / 
                     (frequency * Math.log(1 + annualRate / frequency));
  
  return timeInYears * 12; // Convertir a meses
};

/**
 * Calcula cuánto se necesita ahorrar mensualmente para alcanzar una meta
 */
export const calculateMonthlySavingsNeeded = (
  currentAmount: number,
  targetAmount: number,
  months: number,
  annualRate: number
): number => {
  if (months <= 0) return 0;
  
  const monthlyRate = annualRate / 12;
  const periods = months;
  
  // Fórmula para anualidades: PMT = (FV - PV(1+r)^n) * r / ((1+r)^n - 1)
  const futureValueFactor = Math.pow(1 + monthlyRate, periods);
  const payment = (targetAmount - currentAmount * futureValueFactor) * 
                 monthlyRate / (futureValueFactor - 1);
  
  return payment > 0 ? payment : 0;
};

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Obtiene el color del progreso basado en el porcentaje alcanzado
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return '#10b981'; // Verde
  if (percentage >= 75) return '#f59e0b'; // Amarillo
  if (percentage >= 50) return '#ef4444'; // Rojo
  return '#6366f1'; // Azul
};