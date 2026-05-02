export interface PortfolioMetrics {
  totalCommitted: number;
  totalPaidIn: number;
  totalNav: number;
  tvpi: number;
  dpi: number;
  rvpi: number;
  activeInvestments: number;
}

export interface FundPerformance {
  id: string;
  name: string;
  tvpi: number;
  dpi: number;
  rvpi: number;
  irr: number;
  status: string;
  reportingPeriod?: string | null;
  investedCapPercentage?: number | null;
  committedToInvestPercentage?: number | null;
  hasReportedMetrics?: boolean;
  updatedAt?: Date | null;
}

export interface Investment {
  id: string;
  airtableId: string;
  name: string;
  sector?: string;
  stage?: string;
  invested?: string;
  currentValue?: string;
  status?: string;
  fundId?: string;
  investmentDate?: string;
  exitDate?: string;
}

export interface NetCashflow {
  id: string;
  airtableId: string;
  fundId: string;
  fundName?: string;
  name?: string;
  amount: string;
  cashflowDate: string;
}

export interface DetailedNetCashflow {
  id: string;
  airtableId: string;
  netCashflowId?: string;
  fundId: string;
  fundName?: string;
  amount: string;
  cashflowDate: string;
  purpose?: string;
  investmentName?: string;
  description?: string;
  status?: string;
}

// Legacy types for backward compatibility
export interface CapitalCall {
  id: string;
  airtableId: string;
  fundId: string;
  fundName?: string;
  amount: string;
  callDate: string;
  description?: string;
}

export interface Distribution {
  id: string;
  airtableId: string;
  fundId: string;
  fundName?: string;
  amount: string;
  distributionDate: string;
  type?: string;
  description?: string;
}

export interface FundInfo {
  id: string;
  airtableId: string;
  name: string;
  vintage?: number;
  strategy?: string;
  committed?: string;
  paidIn?: string;
  nav?: string;
  status?: string;
  gp?: string;
}

export interface SyncStatus {
  id: string;
  tableName: string;
  lastSync?: string;
  recordCount: number;
  status: 'ok' | 'warning' | 'error';
  errorMessage?: string;
}

export interface TimeSeriesPoint {
  date: string;
  amount: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface HealthStatus {
  secrets_ok: boolean;
  db_ok: boolean;
  tables: SyncStatus[];
  timestamp: string;
}
