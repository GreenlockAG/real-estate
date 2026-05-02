/**
 * Risk Calculations Service
 * 
 * Computes the 5 core private wealth risk metrics:
 * 1. Max Drawdown (DD)
 * 2. Liquidity Coverage Ratio (LCR)
 * 3. Crisis P&L
 * 4. Expected Shortfall at 97.5% (ES97.5)
 * 5. Correlation Stress Index (CSI)
 * 
 * NOTE: Current implementation uses deterministic stubs based on seed data.
 * Production implementation would use Monte Carlo simulation, historical backtesting,
 * and statistical modeling.
 */

export interface SleeveWeight {
  sleeveType: string;
  weight: number;
}

export interface ParameterInputs {
  volatilities: Record<string, number>;
  returns: Record<string, number>;
  correlations: number[][];
  stressCorrelations: number[][];
}

export interface LiquidityPosition {
  cashMillions: number;
  tbillsMillions: number;
  shortIgMillions: number;
  creditLineMillions: number;
}

export interface CashFlowProjection {
  capitalCallsMillions: number;
  distributionsMillions: number;
  operatingExpensesMillions: number;
  expectedPeDistributionsMillions: number;
}

export interface StressScenario {
  name: string;
  shocks: Record<string, number>;
}

// Metric 1: Maximum Drawdown
export interface MaxDrawdownResult {
  maxDdPct: string;
  recoveryTimeDays: number;
  scope: "PORTFOLIO" | "SLEEVE";
  sleeveType?: string | null;
}

export function calculateMaxDrawdown(
  sleeves: SleeveWeight[],
  parameters: ParameterInputs,
  horizonDays: number = 252
): MaxDrawdownResult {
  // STUB: Returns deterministic result based on seed data
  // Production: Would run Monte Carlo simulation with correlated returns,
  // track portfolio value path, identify maximum peak-to-trough decline
  
  return {
    maxDdPct: "-18.00",
    recoveryTimeDays: 120,
    scope: "PORTFOLIO",
    sleeveType: null
  };
}

// Metric 2: Liquidity Coverage Ratio
export interface LCRResult {
  numeratorMillions: string;
  denominatorMillions: string;
  ratio: string;
}

export function calculateLCR(
  liquidity: LiquidityPosition,
  cashflows: CashFlowProjection
): LCRResult {
  // STUB: Returns deterministic result based on seed data
  // Production: Would compute:
  // - Numerator: Cash + T-Bills + Short IG + Credit Line (with haircuts)
  // - Denominator: Capital Calls + Operating Expenses - Distributions
  
  const numerator = 13.50; // Simplified
  const denominator = 5.30; // Simplified
  const ratio = numerator / denominator;
  
  return {
    numeratorMillions: numerator.toFixed(2),
    denominatorMillions: denominator.toFixed(2),
    ratio: ratio.toFixed(2)
  };
}

// Metric 3: Crisis P&L
export interface CrisisPnLResult {
  scenarioName: string;
  pnlPct: string;
  scope: "PORTFOLIO" | "SLEEVE";
  sleeveType?: string | null;
}

export function calculateCrisisPnL(
  sleeves: SleeveWeight[],
  scenarios: StressScenario[]
): CrisisPnLResult[] {
  // STUB: Returns deterministic results based on seed data
  // Production: Would apply scenario shocks to each sleeve,
  // aggregate weighted portfolio impact, account for correlations
  
  return [
    { scenarioName: "2008 (Lehman)", pnlPct: "-19.00", scope: "PORTFOLIO", sleeveType: null },
    { scenarioName: "2020 (COVID)", pnlPct: "-12.00", scope: "PORTFOLIO", sleeveType: null },
    { scenarioName: "1970s (Stagflation)", pnlPct: "-15.00", scope: "PORTFOLIO", sleeveType: null },
    { scenarioName: "2022 (Rate Shock)", pnlPct: "-10.00", scope: "PORTFOLIO", sleeveType: null },
    { scenarioName: "Flash Crash", pnlPct: "-8.00", scope: "PORTFOLIO", sleeveType: null }
  ];
}

// Metric 4: Expected Shortfall (ES95, ES97.5)
export interface ESResult {
  es95Pct: string;
  es97Pct: string;
  tailRatio: string;
}

export function calculateES(
  sleeves: SleeveWeight[],
  parameters: ParameterInputs,
  horizonDays: number = 252
): ESResult {
  // STUB: Returns deterministic result based on seed data
  // Production: Would run Monte Carlo simulation, sort returns,
  // compute conditional expectation beyond 95% and 97.5% thresholds
  
  const es95 = -13.00;
  const es97 = -17.00;
  const tailRatio = Math.abs(es97 / es95);
  
  return {
    es95Pct: es95.toFixed(2),
    es97Pct: es97.toFixed(2),
    tailRatio: tailRatio.toFixed(2)
  };
}

// Metric 5: Correlation Stress Index (CSI)
export interface CSIResult {
  correlationValue: string;
  regimeFlag: "NORMAL" | "STRESS";
}

export function calculateCSI(
  sleeves: SleeveWeight[],
  normalCorrelations: number[][],
  stressCorrelations: number[][]
): CSIResult {
  // STUB: Returns deterministic result based on seed data
  // Production: Would compute weighted average correlation change
  // between growth and duration sleeves under stress vs normal regime
  
  return {
    correlationValue: "-0.2800",
    regimeFlag: "NORMAL"
  };
}

/**
 * Run all 5 metrics calculations in a single call
 */
export interface AllMetricsResult {
  maxDrawdown: MaxDrawdownResult;
  lcr: LCRResult;
  crisisPnl: CrisisPnLResult[];
  es: ESResult;
  csi: CSIResult;
}

export function calculateAllMetrics(
  sleeves: SleeveWeight[],
  parameters: ParameterInputs,
  liquidity: LiquidityPosition,
  cashflows: CashFlowProjection,
  scenarios: StressScenario[],
  horizonDays: number = 252
): AllMetricsResult {
  return {
    maxDrawdown: calculateMaxDrawdown(sleeves, parameters, horizonDays),
    lcr: calculateLCR(liquidity, cashflows),
    crisisPnl: calculateCrisisPnL(sleeves, scenarios),
    es: calculateES(sleeves, parameters, horizonDays),
    csi: calculateCSI(sleeves, parameters.correlations, parameters.stressCorrelations)
  };
}
