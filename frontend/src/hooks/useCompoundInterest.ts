import { useState, useCallback } from 'react';
import { 
  calculateCompoundInterest,
  generateCompoundProjection,
  calculateTimeToGoal,
  calculateMonthlySavingsNeeded,
  formatCurrency,
  getProgressColor
} from '../utils/compoundInterest';

export interface CompoundInterestInputs {
  principal: number;
  annualRate: number;
  compoundFrequency: number;
  timeYears: number;
  regularContribution?: number;
}

export interface CompoundInterestResults {
  finalAmount: number;
  totalInterest: number;
  projection?: any[];
}

export function useCompoundInterest() {
  const [inputs, setInputs] = useState<CompoundInterestInputs>({
    principal: 1000,
    annualRate: 0.05,
    compoundFrequency: 12,
    timeYears: 10,
    regularContribution: 0
  });

  const [results, setResults] = useState<CompoundInterestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculate = useCallback((inputData?: Partial<CompoundInterestInputs>) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentInputs = { ...inputs, ...inputData };
      setInputs(currentInputs);

      // Validate inputs
      if (currentInputs.principal <= 0) {
        throw new Error('El monto principal debe ser mayor que 0');
      }
      
      if (currentInputs.annualRate < 0) {
        throw new Error('La tasa de interés anual no puede ser negativa');
      }
      
      if (currentInputs.compoundFrequency <= 0) {
        throw new Error('La frecuencia de capitalización debe ser mayor que 0');
      }
      
      if (currentInputs.timeYears < 0) {
        throw new Error('El tiempo no puede ser negativo');
      }

      // Calculate results
      let finalAmount: number;
      
      if (currentInputs.regularContribution && currentInputs.regularContribution > 0) {
        // For now, just use basic compound interest if contributions are provided
        // TODO: Implement proper compound interest with contributions
        finalAmount = calculateCompoundInterest({
          principal: currentInputs.principal,
          rate: currentInputs.annualRate,
          time: currentInputs.timeYears,
          frequency: currentInputs.compoundFrequency
        });
      } else {
        finalAmount = calculateCompoundInterest({
          principal: currentInputs.principal,
          rate: currentInputs.annualRate,
          time: currentInputs.timeYears,
          frequency: currentInputs.compoundFrequency
        });
      }

      const totalInterest = finalAmount - currentInputs.principal;

      // Generate projection
      const projection = generateCompoundProjection(
        currentInputs.principal,
        currentInputs.annualRate,
        currentInputs.timeYears * 12,
        10000 // dummy target amount for now
      );

      setResults({
        finalAmount,
        totalInterest,
        projection
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular el interés compuesto');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [inputs]);

  const calculateGoal = useCallback((targetAmount: number, inputData?: Partial<CompoundInterestInputs>) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentInputs = { ...inputs, ...inputData };
      
      const timeToGoal = calculateTimeToGoal(
        currentInputs.principal,
        targetAmount,
        currentInputs.annualRate,
        currentInputs.compoundFrequency
      );

      return {
        timeToGoal
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular la meta');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [inputs]);

  const reset = useCallback(() => {
    setInputs({
      principal: 1000,
      annualRate: 0.05,
      compoundFrequency: 12,
      timeYears: 10,
      regularContribution: 0
    });
    setResults(null);
    setError(null);
  }, []);

  const updateInput = useCallback((field: keyof CompoundInterestInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return {
    inputs,
    results,
    error,
    isLoading,
    calculate,
    calculateGoal,
    reset,
    updateInput
  };
}

// Utility functions for common calculations
export const compoundInterestUtils = {
  /**
   * Calculate how much you need to invest monthly to reach a goal
   */
  calculateMonthlyContribution: (
    principal: number,
    targetAmount: number,
    annualRate: number,
    years: number
  ): number => {
    // This is a simplified calculation
    // In reality, you'd need to solve for PMT in the future value formula
    const totalNeeded = targetAmount - principal;
    const monthlyRate = annualRate / 12;
    const totalMonths = years * 12;
    
    // Approximate calculation
    const monthlyContribution = totalNeeded / (totalMonths * (1 + monthlyRate) ** totalMonths);
    
    return Math.max(0, Math.round(monthlyContribution * 100) / 100);
  },

  /**
   * Calculate the impact of starting early vs late
   */
  compareStartTimes: (
    principal: number,
    annualRate: number,
    compoundFrequency: number,
    earlyYears: number,
    lateYears: number
  ): {
    earlyAmount: number;
    lateAmount: number;
    difference: number;
    percentageDifference: number;
  } => {
    const earlyAmount = calculateCompoundInterest({
      principal,
      rate: annualRate,
      time: earlyYears,
      frequency: compoundFrequency
    });
    
    const lateAmount = calculateCompoundInterest({
      principal,
      rate: annualRate,
      time: lateYears,
      frequency: compoundFrequency
    });
    
    const difference = earlyAmount - lateAmount;
    const percentageDifference = (difference / lateAmount) * 100;

    return {
      earlyAmount,
      lateAmount,
      difference: Math.round(difference * 100) / 100,
      percentageDifference: Math.round(percentageDifference * 100) / 100
    };
  },

  /**
   * Calculate inflation-adjusted returns
   */
  calculateInflationAdjusted: (
    principal: number,
    annualRate: number,
    inflationRate: number,
    compoundFrequency: number,
    timeYears: number
  ): {
    nominalAmount: number;
    realAmount: number;
    inflationLoss: number;
  } => {
    const nominalAmount = calculateCompoundInterest({
      principal,
      rate: annualRate,
      time: timeYears,
      frequency: compoundFrequency
    });
    
    // Adjust for inflation: Real Amount = Nominal Amount / (1 + inflationRate)^time
    const realAmount = nominalAmount / Math.pow(1 + inflationRate, timeYears);
    const inflationLoss = nominalAmount - realAmount;

    return {
      nominalAmount: Math.round(nominalAmount * 100) / 100,
      realAmount: Math.round(realAmount * 100) / 100,
      inflationLoss: Math.round(inflationLoss * 100) / 100
    };
  }
};