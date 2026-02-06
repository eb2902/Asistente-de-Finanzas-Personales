/**
 * Calculate compound interest using the formula: A = P(1 + r/n)^(nt)
 * 
 * @param principal - Initial investment amount (P)
 * @param annualRate - Annual interest rate as decimal (r) - e.g., 0.05 for 5%
 * @param compoundFrequency - Number of times interest is compounded per year (n)
 * @param timeYears - Time period in years (t)
 * @returns Final amount (A)
 */
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  compoundFrequency: number,
  timeYears: number
): number {
  // Input validation
  if (principal <= 0) {
    throw new Error('Principal must be greater than 0');
  }
  
  if (annualRate < 0) {
    throw new Error('Annual interest rate cannot be negative');
  }
  
  if (compoundFrequency <= 0) {
    throw new Error('Compound frequency must be greater than 0');
  }
  
  if (timeYears < 0) {
    throw new Error('Time cannot be negative');
  }

  // Formula: A = P(1 + r/n)^(nt)
  const ratePerPeriod = annualRate / compoundFrequency;
  const totalPeriods = compoundFrequency * timeYears;
  
  const finalAmount = principal * Math.pow(1 + ratePerPeriod, totalPeriods);
  
  return Math.round(finalAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate compound interest with regular contributions
 * 
 * @param principal - Initial investment amount (P)
 * @param annualRate - Annual interest rate as decimal (r)
 * @param compoundFrequency - Number of times interest is compounded per year (n)
 * @param timeYears - Time period in years (t)
 * @param regularContribution - Regular contribution amount per compounding period
 * @returns Final amount with contributions
 */
export function calculateCompoundInterestWithContributions(
  principal: number,
  annualRate: number,
  compoundFrequency: number,
  timeYears: number,
  regularContribution: number
): number {
  // Input validation
  if (principal < 0) {
    throw new Error('Principal cannot be negative');
  }
  
  if (annualRate < 0) {
    throw new Error('Annual interest rate cannot be negative');
  }
  
  if (compoundFrequency <= 0) {
    throw new Error('Compound frequency must be greater than 0');
  }
  
  if (timeYears < 0) {
    throw new Error('Time cannot be negative');
  }
  
  if (regularContribution < 0) {
    throw new Error('Regular contribution cannot be negative');
  }

  // Calculate base compound interest
  const baseAmount = calculateCompoundInterest(principal, annualRate, compoundFrequency, timeYears);
  
  // If no regular contributions, return base amount
  if (regularContribution === 0) {
    return baseAmount;
  }

  // Calculate future value of regular contributions
  // Formula: FV = PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
  const ratePerPeriod = annualRate / compoundFrequency;
  const totalPeriods = compoundFrequency * timeYears;
  
  const contributionFutureValue = regularContribution * 
    ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
  
  const totalAmount = baseAmount + contributionFutureValue;
  
  return Math.round(totalAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate the required initial investment to reach a financial goal
 * 
 * @param targetAmount - Desired final amount
 * @param annualRate - Annual interest rate as decimal
 * @param compoundFrequency - Number of times interest is compounded per year
 * @param timeYears - Time period in years
 * @returns Required initial principal
 */
export function calculateRequiredPrincipal(
  targetAmount: number,
  annualRate: number,
  compoundFrequency: number,
  timeYears: number
): number {
  // Input validation
  if (targetAmount <= 0) {
    throw new Error('Target amount must be greater than 0');
  }
  
  if (annualRate < 0) {
    throw new Error('Annual interest rate cannot be negative');
  }
  
  if (compoundFrequency <= 0) {
    throw new Error('Compound frequency must be greater than 0');
  }
  
  if (timeYears <= 0) {
    throw new Error('Time must be greater than 0');
  }

  // Rearrange formula: P = A / (1 + r/n)^(nt)
  const ratePerPeriod = annualRate / compoundFrequency;
  const totalPeriods = compoundFrequency * timeYears;
  
  const requiredPrincipal = targetAmount / Math.pow(1 + ratePerPeriod, totalPeriods);
  
  return Math.round(requiredPrincipal * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate the time required to reach a financial goal
 * 
 * @param principal - Initial investment amount
 * @param targetAmount - Desired final amount
 * @param annualRate - Annual interest rate as decimal
 * @param compoundFrequency - Number of times interest is compounded per year
 * @returns Time required in years
 */
export function calculateTimeToGoal(
  principal: number,
  targetAmount: number,
  annualRate: number,
  compoundFrequency: number
): number {
  // Input validation
  if (principal <= 0) {
    throw new Error('Principal must be greater than 0');
  }
  
  if (targetAmount <= principal) {
    throw new Error('Target amount must be greater than principal');
  }
  
  if (annualRate <= 0) {
    throw new Error('Annual interest rate must be greater than 0');
  }
  
  if (compoundFrequency <= 0) {
    throw new Error('Compound frequency must be greater than 0');
  }

  // Rearrange formula: t = ln(A/P) / (n * ln(1 + r/n))
  const ratePerPeriod = annualRate / compoundFrequency;
  
  const timeYears = Math.log(targetAmount / principal) / (compoundFrequency * Math.log(1 + ratePerPeriod));
  
  return Math.round(timeYears * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate the effective annual rate (EAR)
 * 
 * @param nominalRate - Nominal annual interest rate as decimal
 * @param compoundFrequency - Number of times interest is compounded per year
 * @returns Effective annual rate as decimal
 */
export function calculateEffectiveAnnualRate(
  nominalRate: number,
  compoundFrequency: number
): number {
  // Input validation
  if (nominalRate < 0) {
    throw new Error('Nominal rate cannot be negative');
  }
  
  if (compoundFrequency <= 0) {
    throw new Error('Compound frequency must be greater than 0');
  }

  // Formula: EAR = (1 + r/n)^n - 1
  const effectiveRate = Math.pow(1 + nominalRate / compoundFrequency, compoundFrequency) - 1;
  
  return Math.round(effectiveRate * 10000) / 10000; // Round to 4 decimal places
}

/**
 * Generate a compound interest projection table
 * 
 * @param principal - Initial investment amount
 * @param annualRate - Annual interest rate as decimal
 * @param compoundFrequency - Number of times interest is compounded per year
 * @param timeYears - Time period in years
 * @param steps - Number of steps to show in the projection
 * @returns Array of projection data points
 */
export function generateCompoundInterestProjection(
  principal: number,
  annualRate: number,
  compoundFrequency: number,
  timeYears: number,
  steps: number = 12
): Array<{ year: number; amount: number; interestEarned: number }> {
  // Input validation
  if (principal <= 0) {
    throw new Error('Principal must be greater than 0');
  }
  
  if (annualRate < 0) {
    throw new Error('Annual interest rate cannot be negative');
  }
  
  if (compoundFrequency <= 0) {
    throw new Error('Compound frequency must be greater than 0');
  }
  
  if (timeYears <= 0) {
    throw new Error('Time must be greater than 0');
  }
  
  if (steps <= 0) {
    throw new Error('Steps must be greater than 0');
  }

  const projection: Array<{ year: number; amount: number; interestEarned: number }> = [];
  const stepInterval = timeYears / steps;
  
  for (let i = 0; i <= steps; i++) {
    const currentYear = i * stepInterval;
    const amount = calculateCompoundInterest(principal, annualRate, compoundFrequency, currentYear);
    const interestEarned = amount - principal;
    
    projection.push({
      year: Math.round(currentYear * 100) / 100,
      amount: Math.round(amount * 100) / 100,
      interestEarned: Math.round(interestEarned * 100) / 100
    });
  }
  
  return projection;
}