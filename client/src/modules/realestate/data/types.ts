export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PropertyStatus = 'Operating' | 'Renovation' | 'For Sale';

export interface RealEstateProperty {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  currentValueUSD: number;
  currentValueLocal: number;
  localCurrency: string;
  fxRate: number;
  investedCapital: number;
  plUSD: number;
  plPercent: number;
  irr: number;
  equityPercent: number;
  debtPercent: number;
  riskLevel: RiskLevel;
  liquidityDays: number;
  status: PropertyStatus;
  leverage: number;
  thumbnail: string;
}

export interface QuarterlyValuation {
  quarter: string;
  valueUSD: number;
  valueLocal: number;
  fxRate: number;
  growthPercent: number | null;
}

export interface PerformanceIndex {
  quarter: string;
  propertyIndex: number;
  benchmarkIndex: number;
  quarterlyIRR: number;
  quarterlyBenchmark: number;
}

export interface GrowthIndex {
  quarter: string;
  propertyIndex: number;
  benchmarkIndex: number;
  quarterlyGrowth: number;
  quarterlyBenchmark: number;
}

export interface PLLineItem {
  category: string;
  isExpandable?: boolean;
  isSubItem?: boolean;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  usdTotal: number;
}

export interface WaterfallItem {
  name: string;
  valueUSD: number;
  valueAED: number;
  percent: number;
  isTotal?: boolean;
}

export interface PropertyPassportData {
  property: RealEstateProperty;
  valuations: QuarterlyValuation[];
  performanceIndex: PerformanceIndex[];
  growthIndex: GrowthIndex[];
  plItems: PLLineItem[];
  waterfall: WaterfallItem[];
}

export type PLCategoryType = 'Income' | 'Expense';

export type CashflowCategory = 
  | 'Rental'
  | 'Maintenance'
  | 'Taxes'
  | 'Insurance'
  | 'Utilities'
  | 'Management'
  | 'Renovation';

export type CashflowSubcategory =
  | 'Monthly Rent'
  | 'Security Deposit'
  | 'Late Fees'
  | 'Pool'
  | 'Electrical'
  | 'Plumbing'
  | 'HVAC'
  | 'Cleaning'
  | 'Landscaping'
  | 'Property Tax'
  | 'City Tax'
  | 'VAT'
  | 'Building Insurance'
  | 'Contents Insurance'
  | 'Electricity'
  | 'Water'
  | 'Gas'
  | 'Internet'
  | 'Property Mgmt Fee'
  | 'Legal'
  | 'Accounting'
  | 'Kitchen'
  | 'Bathroom'
  | 'Flooring'
  | 'Painting';

export interface CashflowEntry {
  id: string;
  date: string;
  plCategory: PLCategoryType;
  category: CashflowCategory;
  subcategory: CashflowSubcategory;
  payee: string;
  description: string;
  amount: number;
  currency: string;
  fxRate: number;
  bank: string;
  quarter: string;
  invoiceLink: string | null;
  receiptLink: string | null;
}
