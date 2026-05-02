export type Currency = 'USD' | 'EUR' | 'CHF' | 'GBP';

export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  CHF: 0.88,
  GBP: 0.79,
};

export const COLORS = {
  nav: '#166534',
  invested: '#2563eb',
  fx: '#ca8a04',
  profit: '#171717',
  depositPlus10: '#0d9488',
  deposit: '#6b7280',
  depositMinus10: '#d1d5db',
  positive: '#16a34a',
  negative: '#dc2626',
  equity: '#171717',
  pe: '#166534',
  alts: '#2563eb',
  bonds: '#6b7280',
  hedge: '#ca8a04',
  liquidity: '#dc2626',
  cash: '#dc2626',
  custody: '#6b7280',
  fees: '#dc2626',
  usd: '#2563eb',
  eur: '#16a34a',
  chf: '#6b7280',
  gbp: '#171717',
  dkk: '#f97316',
};

export const TOP_10_CUSTODIANS = [
  'UBS',
  'Credit Suisse',
  'Julius Baer',
  'Lombard Odier',
  'Pictet',
  'J.P. Morgan Private Bank',
  'Goldman Sachs Private',
  'Morgan Stanley Private',
  'HSBC Private Bank',
  'BNP Paribas Wealth',
];

export const ASSET_CLASSES = ['Equity', 'Private Equity', 'Bonds', 'Alternatives', 'Cash'];

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'CHF', 'GBP'];

export const MANAGERS = [
  'BlackRock',
  'Vanguard',
  'KKR',
  'Blackstone',
  'Apollo',
  'Carlyle',
  'PIMCO',
  'Bridgewater',
];

const TOTAL_NAV = 100_000_000;
const INVESTED_CAPITAL = 85_200_000;
const FX_IMPACT = 1_800_000;
const TOTAL_PROFIT = 12_500_000;

export interface WealthSnapshot {
  investedCapital: number;
  investedCapitalChange: number;
  fxImpact: number;
  fxImpactChange: number;
  totalProfit: number;
  totalProfitChange: number;
  currentNav: number;
  navChange: number;
  asOfDate: string;
}

export const getWealthSnapshot = (currency: Currency): WealthSnapshot => {
  const rate = EXCHANGE_RATES[currency];
  return {
    investedCapital: INVESTED_CAPITAL * rate,
    investedCapitalChange: 5.2,
    fxImpact: FX_IMPACT * rate,
    fxImpactChange: 2.1,
    totalProfit: TOTAL_PROFIT * rate,
    totalProfitChange: 8.1,
    currentNav: TOTAL_NAV * rate,
    navChange: 6.2,
    asOfDate: '2025-01-30',
  };
};

export interface PortfolioValuePoint {
  date: string;
  nav: number;
  equity: number;
  privateEquity: number;
  bonds: number;
  alternatives: number;
  cash: number;
  contributions: number;
  policyNav: number;
}

export const getPortfolioValueHistory = (currency: Currency): PortfolioValuePoint[] => {
  const rate = EXCHANGE_RATES[currency];
  const data: PortfolioValuePoint[] = [];
  
  const startNav = 45_000_000;
  let contributions = 40_000_000;
  let policyNav = startNav;
  
  const sp500Returns = [
    0.014, -0.002, 0.031, 0.008, -0.012, 0.022, 0.019, -0.025, 0.015, 0.028, 0.004, 0.018,
    0.025, 0.011, 0.028, 0.005, 0.018, 0.003, 0.035, -0.001, 0.022, -0.018, 0.032, 0.012,
    0.019, 0.038, 0.001, 0.009, 0.012, 0.022, 0.027, 0.003, 0.018, 0.003, 0.028, 0.026,
    0.055, -0.029, -0.022, 0.008, 0.038, 0.002, 0.036, 0.031, -0.041, 0.073, -0.024, -0.018,
    0.079, 0.033, 0.016, 0.040, 0.018, 0.069, 0.021, 0.031, 0.018, 0.022, -0.009, 0.029,
    0.003, 0.055, 0.045, 0.058, -0.115, 0.126, 0.054, 0.071, -0.009, 0.108, -0.037, 0.037,
    -0.011, 0.069, 0.037, 0.018, 0.007, 0.020, 0.024, -0.043, 0.032, 0.019, 0.054, 0.018,
    -0.061, -0.051, 0.035, 0.080, 0.001, -0.083, 0.091, -0.041, -0.093, 0.057, 0.054, -0.058,
    0.062, 0.039, 0.016, 0.015, 0.026, 0.064, 0.032, -0.016, 0.049, -0.028, 0.089, 0.045,
    0.016, 0.052, 0.031, 0.039, -0.042, 0.044, 0.012, 0.022, 0.037, 0.056, 0.028, -0.024,
    0.028
  ];
  
  let equityVal = startNav * 0.30;
  let peVal = startNav * 0.30;
  let bondsVal = startNav * 0.20;
  let altsVal = startNav * 0.14;
  let cashVal = startNav * 0.06;
  
  let idx = 0;
  for (let year = 2015; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === 2025 && month > 1) break;
      
      const marketReturn = sp500Returns[idx] || 0.01;
      
      equityVal *= (1 + marketReturn * 1.0);
      peVal *= (1 + marketReturn * 0.6 + 0.003);
      bondsVal *= (1 + marketReturn * 0.2 + 0.002);
      altsVal *= (1 + marketReturn * 0.5 + 0.001);
      cashVal *= 1.0015;
      
      if (idx % 6 === 0 && idx > 0) {
        contributions += 500_000;
        equityVal += 150_000;
        peVal += 200_000;
        bondsVal += 50_000;
        altsVal += 75_000;
        cashVal += 25_000;
        policyNav += 500_000;
      }
      
      const policyReturn = marketReturn * 0.7 + 0.002;
      policyNav *= (1 + policyReturn);
      
      const nav = equityVal + peVal + bondsVal + altsVal + cashVal;
      
      data.push({
        date: `${year}-${month.toString().padStart(2, '0')}-01`,
        nav: nav * rate,
        equity: equityVal * rate,
        privateEquity: peVal * rate,
        bonds: bondsVal * rate,
        alternatives: altsVal * rate,
        cash: cashVal * rate,
        contributions: contributions * rate,
        policyNav: policyNav * rate,
      });
      
      idx++;
    }
  }
  
  return data;
};

export interface AnnualPerformance {
  year: number;
  returnPct: number;
  cumulativeReturn: number;
  policyReturn: number;
}

export const getAnnualPerformance = (currency: Currency): AnnualPerformance[] => {
  const returns = [
    { year: 2015, returnPct: 4.2, policyPct: 4.8 },
    { year: 2016, returnPct: 5.8, policyPct: 5.2 },
    { year: 2017, returnPct: 7.1, policyPct: 6.5 },
    { year: 2018, returnPct: -2.3, policyPct: -1.8 },
    { year: 2019, returnPct: 6.4, policyPct: 7.2 },
    { year: 2020, returnPct: 8.2, policyPct: 6.8 },
    { year: 2021, returnPct: 5.6, policyPct: 5.0 },
    { year: 2022, returnPct: -4.1, policyPct: -5.5 },
    { year: 2023, returnPct: 6.8, policyPct: 5.8 },
    { year: 2024, returnPct: 5.2, policyPct: 4.9 },
    { year: 2025, returnPct: 1.8, policyPct: 1.5 },
  ];
  
  let cumulativeNav = 100;
  let cumulativePolicy = 100;
  
  return returns.map(r => {
    cumulativeNav *= (1 + r.returnPct / 100);
    cumulativePolicy *= (1 + r.policyPct / 100);
    return {
      year: r.year,
      returnPct: r.returnPct,
      cumulativeReturn: cumulativeNav,
      policyReturn: cumulativePolicy,
    };
  });
};

export interface MonthlyPerformance {
  month: string;
  monthlyReturn: number;
  cumulativeYTD: number;
}

export const getMonthlyPerformance2025 = (currency: Currency): MonthlyPerformance[] => {
  const sp500_2025_trend = [2.8, -1.2, 0.8, 1.5, -0.5, 1.2, 0.9, -0.3, 1.1, 0.7, 1.4, 0.6];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let cumulativeYTD = 0;
  
  return sp500_2025_trend.map((spReturn, index) => {
    const monthlyReturn = spReturn * 0.85;
    cumulativeYTD = ((1 + cumulativeYTD / 100) * (1 + monthlyReturn / 100) - 1) * 100;
    
    return {
      month: monthNames[index],
      monthlyReturn,
      cumulativeYTD,
    };
  });
};

export interface CustodianAsset {
  name: string;
  value: number;
}

export const getCustodianAssets = (currency: Currency): CustodianAsset[] => {
  const rate = EXCHANGE_RATES[currency];
  const totalNav = TOTAL_NAV;
  
  const allocations = [
    { name: 'UBS', pct: 0.22 },
    { name: 'Credit Suisse', pct: 0.18 },
    { name: 'Julius Baer', pct: 0.14 },
    { name: 'J.P. Morgan Private Bank', pct: 0.12 },
    { name: 'Goldman Sachs Private', pct: 0.10 },
    { name: 'Lombard Odier', pct: 0.08 },
    { name: 'Pictet', pct: 0.06 },
    { name: 'Morgan Stanley Private', pct: 0.05 },
    { name: 'HSBC Private Bank', pct: 0.03 },
    { name: 'BNP Paribas Wealth', pct: 0.02 },
  ];
  
  return allocations.map(a => ({
    name: a.name,
    value: totalNav * a.pct * rate,
  })).sort((a, b) => b.value - a.value);
};

export interface AllocationPath {
  period: string;
  equity: number;
  privateEquity: number;
  bonds: number;
  alternatives: number;
  cash: number;
}

export const getAllocationPath = (): AllocationPath[] => [
  { period: 'Today', equity: 35, privateEquity: 40, bonds: 10, alternatives: 10, cash: 5 },
  { period: '12 Months', equity: 30, privateEquity: 45, bonds: 10, alternatives: 10, cash: 5 },
  { period: 'Target', equity: 25, privateEquity: 50, bonds: 10, alternatives: 10, cash: 5 },
];

export interface ManagerExposure {
  manager: string;
  equity: number;
  privateEquity: number;
  bonds: number;
  alternatives: number;
  cash: number;
}

export const getManagerExposure = (currency: Currency): ManagerExposure[] => {
  const rate = EXCHANGE_RATES[currency];
  
  return [
    { manager: 'BlackRock', equity: 11_500_000, privateEquity: 0, bonds: 4_000_000, alternatives: 0, cash: 5_000_000 },
    { manager: 'Vanguard', equity: 13_000_000, privateEquity: 0, bonds: 0, alternatives: 2_000_000, cash: 0 },
    { manager: 'KKR', equity: 0, privateEquity: 11_000_000, bonds: 0, alternatives: 2_000_000, cash: 0 },
    { manager: 'Blackstone', equity: 0, privateEquity: 10_500_000, bonds: 0, alternatives: 4_000_000, cash: 0 },
    { manager: 'Apollo', equity: 0, privateEquity: 7_000_000, bonds: 2_000_000, alternatives: 0, cash: 0 },
    { manager: 'Carlyle', equity: 0, privateEquity: 11_500_000, bonds: 0, alternatives: 0, cash: 0 },
    { manager: 'PIMCO', equity: 0, privateEquity: 0, bonds: 4_500_000, alternatives: 0, cash: 0 },
    { manager: 'Bridgewater', equity: 6_000_000, privateEquity: 0, bonds: 0, alternatives: 6_000_000, cash: 0 },
  ].map(m => ({
    manager: m.manager,
    equity: m.equity * rate,
    privateEquity: m.privateEquity * rate,
    bonds: m.bonds * rate,
    alternatives: m.alternatives * rate,
    cash: m.cash * rate,
  }));
};

export interface Position {
  id: string;
  name: string;
  assetClass: string;
  manager: string;
  ytdReturn: number;
  sincePurchaseReturn: number;
  value: number;
  purchaseDate: string;
}

export const getPositions = (currency: Currency): Position[] => {
  const rate = EXCHANGE_RATES[currency];
  
  const positions: Position[] = [
    { id: '1', name: 'S&P 500 Index Fund', assetClass: 'Equity', manager: 'Vanguard', ytdReturn: 4.2, sincePurchaseReturn: 45.6, value: 8_500_000, purchaseDate: '2019-03-15' },
    { id: '2', name: 'Total Bond Market Fund', assetClass: 'Bonds', manager: 'BlackRock', ytdReturn: 1.8, sincePurchaseReturn: 12.3, value: 3_500_000, purchaseDate: '2020-01-10' },
    { id: '3', name: 'Emerging Markets Equity', assetClass: 'Equity', manager: 'BlackRock', ytdReturn: -3.2, sincePurchaseReturn: -8.5, value: 4_000_000, purchaseDate: '2022-06-20' },
    { id: '4', name: 'KKR Fund XIV', assetClass: 'Private Equity', manager: 'KKR', ytdReturn: 8.5, sincePurchaseReturn: 32.1, value: 6_000_000, purchaseDate: '2021-04-01' },
    { id: '5', name: 'Blackstone Real Estate', assetClass: 'Alternatives', manager: 'Blackstone', ytdReturn: 2.1, sincePurchaseReturn: 18.4, value: 4_000_000, purchaseDate: '2020-09-15' },
    { id: '6', name: 'Apollo Credit Fund', assetClass: 'Bonds', manager: 'Apollo', ytdReturn: 3.4, sincePurchaseReturn: 15.2, value: 2_000_000, purchaseDate: '2021-02-28' },
    { id: '7', name: 'MSCI Europe Index', assetClass: 'Equity', manager: 'Vanguard', ytdReturn: 2.8, sincePurchaseReturn: 22.4, value: 5_500_000, purchaseDate: '2019-11-01' },
    { id: '8', name: 'US Treasury Bonds', assetClass: 'Bonds', manager: 'PIMCO', ytdReturn: 0.9, sincePurchaseReturn: 8.1, value: 2_500_000, purchaseDate: '2022-01-15' },
    { id: '9', name: 'Carlyle Partners VIII', assetClass: 'Private Equity', manager: 'Carlyle', ytdReturn: 6.2, sincePurchaseReturn: 28.5, value: 5_500_000, purchaseDate: '2020-08-01' },
    { id: '10', name: 'Global Infrastructure', assetClass: 'Alternatives', manager: 'Blackstone', ytdReturn: 4.5, sincePurchaseReturn: 21.3, value: 3_000_000, purchaseDate: '2021-05-15' },
    { id: '11', name: 'Tech Growth Fund', assetClass: 'Equity', manager: 'BlackRock', ytdReturn: -12.4, sincePurchaseReturn: -18.2, value: 3_500_000, purchaseDate: '2023-01-10' },
    { id: '12', name: 'Asia Pacific Equity', assetClass: 'Equity', manager: 'Vanguard', ytdReturn: 1.2, sincePurchaseReturn: 9.8, value: 4_500_000, purchaseDate: '2020-03-20' },
    { id: '13', name: 'High Yield Bond Fund', assetClass: 'Bonds', manager: 'PIMCO', ytdReturn: 2.6, sincePurchaseReturn: 14.5, value: 1_500_000, purchaseDate: '2021-07-01' },
    { id: '14', name: 'Apollo Fund X', assetClass: 'Private Equity', manager: 'Apollo', ytdReturn: 5.8, sincePurchaseReturn: 24.2, value: 5_000_000, purchaseDate: '2022-02-15' },
    { id: '15', name: 'Bridgewater All Weather', assetClass: 'Alternatives', manager: 'Bridgewater', ytdReturn: 3.2, sincePurchaseReturn: 16.8, value: 3_000_000, purchaseDate: '2019-06-01' },
    { id: '16', name: 'Small Cap Value', assetClass: 'Equity', manager: 'Vanguard', ytdReturn: -5.6, sincePurchaseReturn: 4.2, value: 2_500_000, purchaseDate: '2021-09-10' },
    { id: '17', name: 'Investment Grade Corp', assetClass: 'Bonds', manager: 'BlackRock', ytdReturn: 1.4, sincePurchaseReturn: 7.8, value: 500_000, purchaseDate: '2022-04-01' },
    { id: '18', name: 'KKR Infrastructure', assetClass: 'Alternatives', manager: 'KKR', ytdReturn: 4.8, sincePurchaseReturn: 19.5, value: 2_000_000, purchaseDate: '2021-11-15' },
    { id: '19', name: 'Blackstone Growth', assetClass: 'Private Equity', manager: 'Blackstone', ytdReturn: 7.2, sincePurchaseReturn: 35.4, value: 6_500_000, purchaseDate: '2020-12-01' },
    { id: '20', name: 'REIT Index Fund', assetClass: 'Alternatives', manager: 'Vanguard', ytdReturn: -8.3, sincePurchaseReturn: -12.1, value: 2_000_000, purchaseDate: '2022-08-15' },
    { id: '21', name: 'Dividend Growth Fund', assetClass: 'Equity', manager: 'BlackRock', ytdReturn: 3.6, sincePurchaseReturn: 28.9, value: 6_000_000, purchaseDate: '2019-02-01' },
    { id: '22', name: 'Municipal Bonds', assetClass: 'Bonds', manager: 'PIMCO', ytdReturn: 1.1, sincePurchaseReturn: 5.4, value: 500_000, purchaseDate: '2023-03-15' },
    { id: '23', name: 'Carlyle Europe', assetClass: 'Private Equity', manager: 'Carlyle', ytdReturn: 4.9, sincePurchaseReturn: 18.7, value: 7_000_000, purchaseDate: '2021-06-20' },
    { id: '24', name: 'Commodity Fund', assetClass: 'Alternatives', manager: 'Bridgewater', ytdReturn: -2.8, sincePurchaseReturn: 6.2, value: 6_000_000, purchaseDate: '2022-05-01' },
    { id: '25', name: 'Cash Reserves', assetClass: 'Cash', manager: 'BlackRock', ytdReturn: 0.4, sincePurchaseReturn: 1.2, value: 5_000_000, purchaseDate: '2024-01-01' },
  ];
  
  return positions.map(p => ({
    ...p,
    value: p.value * rate,
  }));
};

export interface PrivateMarketFund {
  name: string;
  vintage: number;
  investedCapital: number;
  currentValue: number;
  moic: number;
}

export const getPrivateMarketFunds = (currency: Currency): PrivateMarketFund[] => {
  const rate = EXCHANGE_RATES[currency];
  
  const funds = [
    { name: 'KKR Fund XIV', vintage: 2020, investedCapital: 4_000_000, currentValue: 5_280_000, moic: 1.32 },
    { name: 'Blackstone Growth', vintage: 2020, investedCapital: 3_500_000, currentValue: 4_725_000, moic: 1.35 },
    { name: 'Carlyle Partners VIII', vintage: 2021, investedCapital: 3_200_000, currentValue: 4_096_000, moic: 1.28 },
    { name: 'Apollo Fund X', vintage: 2022, investedCapital: 3_000_000, currentValue: 3_720_000, moic: 1.24 },
    { name: 'KKR Tech Growth', vintage: 2021, investedCapital: 2_800_000, currentValue: 3_640_000, moic: 1.30 },
    { name: 'Blackstone Real Estate', vintage: 2022, investedCapital: 2_500_000, currentValue: 2_975_000, moic: 1.19 },
    { name: 'Carlyle Europe', vintage: 2023, investedCapital: 2_200_000, currentValue: 2_508_000, moic: 1.14 },
    { name: 'Apollo Credit II', vintage: 2024, investedCapital: 1_800_000, currentValue: 1_890_000, moic: 1.05 },
  ];
  
  return funds.map(f => ({
    ...f,
    investedCapital: f.investedCapital * rate,
    currentValue: f.currentValue * rate,
  }));
};

export interface FeeData {
  period: string;
  year: number;
  quarter: number;
  custodyFees: number;
  managementFees: number;
  performanceFees: number;
  totalFees: number;
}

export const getFeeHistory = (currency: Currency): FeeData[] => {
  const rate = EXCHANGE_RATES[currency];
  const data: FeeData[] = [];
  
  for (let year = 2020; year <= 2025; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      if (year === 2025 && quarter > 1) break;
      
      const baseNav = 70_000_000 + (year - 2020) * 6_000_000;
      const custodyFees = baseNav * 0.001 * rate;
      const managementFees = baseNav * 0.0025 * rate;
      const performanceFees = (Math.random() > 0.3 ? baseNav * 0.001 : 0) * rate;
      
      data.push({
        period: `Q${quarter} ${year}`,
        year,
        quarter,
        custodyFees,
        managementFees,
        performanceFees,
        totalFees: custodyFees + managementFees + performanceFees,
      });
    }
  }
  
  return data;
};

export interface CashByCurrency {
  bank: string;
  usd: number;
  eur: number;
  chf: number;
  gbp: number;
  total: number;
}

export const getCashByBankAndCurrency = (displayCurrency: Currency): CashByCurrency[] => {
  const rate = EXCHANGE_RATES[displayCurrency];
  const totalCash = 5_000_000;
  
  const distribution = [
    { bank: 'UBS', usd: 900_000, eur: 200_000, chf: 400_000, gbp: 100_000 },
    { bank: 'Credit Suisse', usd: 650_000, eur: 175_000, chf: 325_000, gbp: 50_000 },
    { bank: 'Julius Baer', usd: 400_000, eur: 125_000, chf: 225_000, gbp: 50_000 },
    { bank: 'J.P. Morgan', usd: 550_000, eur: 50_000, chf: 50_000, gbp: 100_000 },
    { bank: 'Goldman Sachs', usd: 325_000, eur: 50_000, chf: 0, gbp: 50_000 },
    { bank: 'Lombard Odier', usd: 125_000, eur: 50_000, chf: 50_000, gbp: 0 },
  ];
  
  return distribution.map(d => ({
    bank: d.bank,
    usd: d.usd * rate,
    eur: d.eur * rate,
    chf: d.chf * rate,
    gbp: d.gbp * rate,
    total: (d.usd + d.eur + d.chf + d.gbp) * rate,
  }));
};

export interface FxExposure {
  currency: Currency;
  percentage: number;
  value: number;
}

export const getFxExposure = (displayCurrency: Currency): FxExposure[] => {
  const rate = EXCHANGE_RATES[displayCurrency];
  const totalNav = TOTAL_NAV;
  
  return [
    { currency: 'USD', percentage: 62, value: totalNav * 0.62 * rate },
    { currency: 'EUR', percentage: 22, value: totalNav * 0.22 * rate },
    { currency: 'CHF', percentage: 11, value: totalNav * 0.11 * rate },
    { currency: 'GBP', percentage: 5, value: totalNav * 0.05 * rate },
  ];
};

export const formatCurrency = (value: number, currency: Currency, abbreviated: boolean = true): string => {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'CHF' ? 'CHF ' : '£';
  
  if (abbreviated) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `${symbol}${(value / 1_000).toFixed(1)}K`;
    }
    return `${symbol}${value.toFixed(0)}`;
  }
  
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatPercent = (value: number, showSign: boolean = false): string => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};
