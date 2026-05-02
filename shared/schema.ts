import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Portfolio tables synced from Airtable

export const netCashflows = pgTable("net_cashflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airtableId: varchar("airtable_id").notNull().unique(),
  fundId: varchar("fund_id").notNull(),
  fundName: text("fund_name"),
  name: text("name"), // Proper cashflow name field
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  cashflowDate: timestamp("cashflow_date").notNull(),
  // Missing Airtable fields
  status: text("status"), // actual, pending, etc.
  inOut: text("in_out"), // Contribution, Distribution, etc.
  currency: text("currency"), // DKK, USD, etc.
  year: integer("year"), // For easier filtering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export const fundInfo = pgTable("fund_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airtableId: varchar("airtable_id").notNull().unique(),
  name: text("name").notNull(),
  vintage: integer("vintage"),
  assetClass: text("asset_class"), // Proper asset class field
  fundSize: decimal("fund_size", { precision: 15, scale: 2 }), // Proper fund size field
  status: text("status"),
  manager: text("manager"), // Proper manager field
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportedMetrics = pgTable("reported_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airtableId: varchar("airtable_id").notNull().unique(),
  fundId: varchar("fund_id"), // Made nullable since it comes from linked records
  fundName: text("fund_name"),
  reportingPeriod: text("reporting_period"),
  nav: decimal("nav", { precision: 15, scale: 2 }),
  irr: decimal("irr", { precision: 5, scale: 4 }), // Net IRR - increased precision
  grossIrr: decimal("gross_irr", { precision: 5, scale: 4 }), // Gross IRR  
  tvpi: decimal("tvpi", { precision: 5, scale: 4 }),
  dpi: decimal("dpi", { precision: 5, scale: 4 }),
  rvpi: decimal("rvpi", { precision: 5, scale: 4 }),
  grossMoic: decimal("gross_moic", { precision: 5, scale: 4 }), // Gross MOIC
  investedCapPercentage: decimal("invested_cap_percentage", { precision: 5, scale: 4 }), // Invested Cap, % of CC
  committedToInvestPercentage: decimal("committed_to_invest_percentage", { precision: 5, scale: 4 }), // Committed to invest, % of CC
  currentNetCalledCap: decimal("current_net_called_cap", { precision: 5, scale: 4 }), // Current Net CalledCap
  noInvestments: integer("no_investments"), // No Investments
  currency: text("currency"), // Currency
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const detailedNetCashflows = pgTable("detailed_net_cashflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airtableId: varchar("airtable_id").notNull().unique(),
  netCashflowId: varchar("net_cashflow_id").references(() => netCashflows.id),
  fundId: varchar("fund_id").notNull(),
  fundName: text("fund_name"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  cashflowDate: timestamp("cashflow_date").notNull(),
  purpose: text("purpose"),
  investmentName: text("investment_name"),
  description: text("description"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ladderedBonds = pgTable("laddered_bonds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airtableId: varchar("airtable_id").notNull().unique(),
  bondName: text("bond_name").notNull(),
  issuer: text("issuer"),
  faceValue: decimal("face_value", { precision: 15, scale: 2 }),
  maturityDate: timestamp("maturity_date"),
  currency: text("currency"), // Proper currency field
  securityId: text("security_id"), // Proper ISIN field
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const syncStatus = pgTable("sync_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableName: text("table_name").notNull().unique(),
  lastSync: timestamp("last_sync"),
  recordCount: integer("record_count").default(0),
  status: text("status").notNull().default('ok'), // 'ok', 'warning', 'error'
  errorMessage: text("error_message"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas

export const insertNetCashflowSchema = createInsertSchema(netCashflows).omit({
  id: true,
}).partial({
  createdAt: true,
  updatedAt: true,
});


export const insertFundInfoSchema = createInsertSchema(fundInfo).omit({
  id: true,
}).partial({
  createdAt: true,
  updatedAt: true,
});

export const insertReportedMetricsSchema = createInsertSchema(reportedMetrics).omit({
  id: true,
}).partial({
  createdAt: true,
  updatedAt: true,
});

export const insertDetailedNetCashflowSchema = createInsertSchema(detailedNetCashflows).omit({
  id: true,
}).partial({
  createdAt: true,
  updatedAt: true,
});

export const insertLadderedBondsSchema = createInsertSchema(ladderedBonds).omit({
  id: true,
}).partial({
  createdAt: true,
  updatedAt: true,
});

export const insertSyncStatusSchema = createInsertSchema(syncStatus).omit({
  id: true,
  updatedAt: true,
});

// Types

export type NetCashflow = typeof netCashflows.$inferSelect;
export type InsertNetCashflow = z.infer<typeof insertNetCashflowSchema>;


export type FundInfo = typeof fundInfo.$inferSelect;
export type InsertFundInfo = z.infer<typeof insertFundInfoSchema>;

export type ReportedMetrics = typeof reportedMetrics.$inferSelect;
export type InsertReportedMetrics = z.infer<typeof insertReportedMetricsSchema>;

export type DetailedNetCashflow = typeof detailedNetCashflows.$inferSelect;
export type InsertDetailedNetCashflow = z.infer<typeof insertDetailedNetCashflowSchema>;

export type LadderedBonds = typeof ladderedBonds.$inferSelect;
export type InsertLadderedBonds = z.infer<typeof insertLadderedBondsSchema>;

export type SyncStatus = typeof syncStatus.$inferSelect;
export type InsertSyncStatus = z.infer<typeof insertSyncStatusSchema>;

// Portfolio metrics types
export interface PortfolioMetrics {
  totalCommitted: number;
  totalPaidIn: number;
  totalNav: number;
  tvpi: number;
  dpi: number;
  rvpi: number;
  activeInvestments: number;
  totalPaidInChange?: string;
  totalDistributions?: number;
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

export interface CumulativeNetCashflow {
  timeline: Array<{
    date: string;           // ISO date string
    amount: number;         // Individual amount in millions USD
    cumulative: number;     // Running total in millions USD
  }>;
  totalCumulative: number;  // Final cumulative total
}

// ===================================================================
// RISK MODULE TABLES - Private Wealth Risk Monitoring (5 Metrics)
// ===================================================================

// Organizations and Users
export const riskOrganizations = pgTable("risk_organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const riskUsers = pgTable("risk_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => riskOrganizations.id),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'admin' | 'editor' | 'viewer'
  createdAt: timestamp("created_at").defaultNow(),
});

// Core Portfolio Definition
export const riskPortfolios = pgTable("risk_portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => riskOrganizations.id),
  name: text("name").notNull(),
  baseCurrency: text("base_currency").notNull().default('USD'),
  aumMillions: decimal("aum_millions", { precision: 15, scale: 2 }).notNull(),
  chfSpendingNote: text("chf_spending_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sleeves - All 9 types required
export const riskSleeves = pgTable("risk_sleeves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => riskPortfolios.id),
  sleeveType: text("sleeve_type").notNull(), // GROWTH|CREDIT|DURATION|TIPS|CTA|COMMODITIES|DIVERSIFIERS|REAL_ASSETS|LIQUIDITY
  targetWeightPct: decimal("target_weight_pct", { precision: 5, scale: 2 }).notNull(),
  currentWeightPct: decimal("current_weight_pct", { precision: 5, scale: 2 }).notNull(),
  notes: text("notes"),
});

// Liquidity Positions (for LCR numerator)
export const riskLiquidityPositions = pgTable("risk_liquidity_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => riskPortfolios.id),
  cashMillions: decimal("cash_millions", { precision: 15, scale: 2 }).notNull(),
  tbillsMillions: decimal("tbills_millions", { precision: 15, scale: 2 }).notNull(),
  shortIgMillions: decimal("short_ig_millions", { precision: 15, scale: 2 }).notNull(),
  creditLineMillions: decimal("credit_line_millions", { precision: 15, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cash Flow Projections (for LCR denominator)
export const riskCashFlowProjections = pgTable("risk_cash_flow_projections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => riskPortfolios.id),
  capitalCallsMillions: decimal("capital_calls_millions", { precision: 15, scale: 2 }).notNull(),
  distributionsMillions: decimal("distributions_millions", { precision: 15, scale: 2 }).notNull(),
  operatingExpensesMillions: decimal("operating_expenses_millions", { precision: 15, scale: 2 }).notNull(),
  expectedPeDistributionsMillions: decimal("expected_pe_distributions_millions", { precision: 15, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Governance Thresholds
export const riskGovernanceThresholds = pgTable("risk_governance_thresholds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => riskPortfolios.id),
  maxDdPct: decimal("max_dd_pct", { precision: 5, scale: 2 }).notNull(),
  lcrMin: decimal("lcr_min", { precision: 5, scale: 2 }).notNull(),
  crisisPnlLimit2008: decimal("crisis_pnl_limit_2008", { precision: 5, scale: 2 }),
  es97Target: decimal("es97_target", { precision: 5, scale: 2 }),
  csiWarningLevel: decimal("csi_warning_level", { precision: 5, scale: 2 }).default('-0.1'),
  notes: text("notes"),
});

// Parameter Packs (versioned)
export const riskParameterPacks = pgTable("risk_parameter_packs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => riskPortfolios.id),
  version: integer("version").notNull(),
  label: text("label").notNull(),
  createdBy: varchar("created_by").notNull().references(() => riskUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parameter Items (vols, returns, hedge effectiveness)
export const riskParameterItems = pgTable("risk_parameter_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packId: varchar("pack_id").notNull().references(() => riskParameterPacks.id),
  sleeveType: text("sleeve_type").notNull(),
  itemKind: text("item_kind").notNull(), // 'VOL' | 'RETURN' | 'HEDGE_EFF'
  value: decimal("value", { precision: 8, scale: 4 }).notNull(),
});

// Correlation Matrices (stored as JSON for simplicity)
export const riskCorrelationMatrices = pgTable("risk_correlation_matrices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packId: varchar("pack_id").notNull().references(() => riskParameterPacks.id),
  regimeType: text("regime_type").notNull(), // 'NORMAL' | 'STRESS'
  labels: jsonb("labels").notNull(), // string[]
  matrix: jsonb("matrix").notNull(), // number[][]
});

// Stress Scenarios
export const riskStressScenarios = pgTable("risk_stress_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packId: varchar("pack_id").notNull().references(() => riskParameterPacks.id),
  name: text("name").notNull(), // '2008', '2020', '1970s', '2022', 'Flash Crash'
  category: text("category").notNull(), // MACRO|RATE|CREDIT|COMMODITY|FX
  horizonDays: integer("horizon_days").notNull(),
  shocks: jsonb("shocks").notNull(), // { [sleeveType]: shock% }
});

// Simulation Runs (IMMUTABLE - insert only)
export const riskSimulations = pgTable("risk_simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => riskPortfolios.id),
  packId: varchar("pack_id").notNull().references(() => riskParameterPacks.id),
  engine: text("engine").notNull(), // 'MONTE_CARLO' | 'HISTORICAL' | 'STRESS_ONLY'
  seed: integer("seed"),
  paths: integer("paths"),
  horizonDays: integer("horizon_days").notNull(),
  inputsSnapshot: jsonb("inputs_snapshot").notNull(), // Complete frozen copy of portfolio + pack
  createdBy: varchar("created_by").notNull().references(() => riskUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Metric #1: Max Drawdown Results
export const riskMaxDrawdownResults = pgTable("risk_max_drawdown_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  simulationId: varchar("simulation_id").notNull().references(() => riskSimulations.id),
  maxDdPct: decimal("max_dd_pct", { precision: 5, scale: 2 }).notNull(),
  recoveryTimeDays: integer("recovery_time_days"),
  scope: text("scope").notNull(), // 'PORTFOLIO' | 'SLEEVE'
  sleeveType: text("sleeve_type"), // null for PORTFOLIO scope
});

// Metric #2: Liquidity Coverage Ratio Results
export const riskLcrResults = pgTable("risk_lcr_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  simulationId: varchar("simulation_id").notNull().references(() => riskSimulations.id),
  numeratorMillions: decimal("numerator_millions", { precision: 15, scale: 2 }).notNull(),
  denominatorMillions: decimal("denominator_millions", { precision: 15, scale: 2 }).notNull(),
  ratio: decimal("ratio", { precision: 5, scale: 2 }).notNull(),
});

// Metric #3: Crisis P&L Results
export const riskCrisisPnlResults = pgTable("risk_crisis_pnl_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  simulationId: varchar("simulation_id").notNull().references(() => riskSimulations.id),
  scenarioName: text("scenario_name").notNull(),
  pnlPct: decimal("pnl_pct", { precision: 5, scale: 2 }).notNull(),
  scope: text("scope").notNull(), // 'PORTFOLIO' | 'SLEEVE'
  sleeveType: text("sleeve_type"), // null for PORTFOLIO scope
});

// Metric #4: Expected Shortfall Results
export const riskEsResults = pgTable("risk_es_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  simulationId: varchar("simulation_id").notNull().references(() => riskSimulations.id),
  es95Pct: decimal("es95_pct", { precision: 5, scale: 2 }).notNull(),
  es97Pct: decimal("es97_pct", { precision: 5, scale: 2 }).notNull(),
  tailRatio: decimal("tail_ratio", { precision: 5, scale: 2 }).notNull(), // es97/es95
});

// Metric #5: Correlation Stress Index Results
export const riskCsiResults = pgTable("risk_csi_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  simulationId: varchar("simulation_id").notNull().references(() => riskSimulations.id),
  correlationValue: decimal("correlation_value", { precision: 5, scale: 4 }).notNull(),
  regimeFlag: text("regime_flag").notNull(), // 'NORMAL' | 'WARNING' | 'ALERT'
});

// Governance Reviews
export const riskGovernanceReviews = pgTable("risk_governance_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id").notNull().references(() => riskPortfolios.id),
  simulationId: varchar("simulation_id").notNull().references(() => riskSimulations.id),
  compliant: text("compliant").notNull(), // 'true' | 'false' (stored as text)
  breaches: jsonb("breaches"), // Array of breach objects
  recommendations: jsonb("recommendations"), // Array of recommendation strings
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs
export const riskAuditLogs = pgTable("risk_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => riskOrganizations.id),
  userId: varchar("user_id").notNull().references(() => riskUsers.id),
  entity: text("entity").notNull(), // 'PORTFOLIO' | 'PARAMETER_PACK' | 'SIMULATION'
  entityId: varchar("entity_id").notNull(),
  action: text("action").notNull(), // 'CREATE' | 'UPDATE' | 'DELETE'
  before: jsonb("before"), // null for CREATE
  after: jsonb("after"), // null for DELETE
  createdAt: timestamp("created_at").defaultNow(),
});

// Drafts (for Save & Continue Later)
export const riskDrafts = pgTable("risk_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => riskUsers.id),
  draftType: text("draft_type").notNull(), // 'PORTFOLIO' | 'PARAMETER_PACK' | 'SIMULATION'
  draftData: jsonb("draft_data").notNull(),
  lastSaved: timestamp("last_saved").defaultNow(),
});

// ===================================================================
// RISK MODULE INSERT SCHEMAS
// ===================================================================

export const insertRiskOrganizationSchema = createInsertSchema(riskOrganizations).omit({ id: true });
export const insertRiskUserSchema = createInsertSchema(riskUsers).omit({ id: true });
export const insertRiskPortfolioSchema = createInsertSchema(riskPortfolios).omit({ id: true });
export const insertRiskSleeveSchema = createInsertSchema(riskSleeves).omit({ id: true });
export const insertRiskLiquidityPositionSchema = createInsertSchema(riskLiquidityPositions).omit({ id: true });
export const insertRiskCashFlowProjectionSchema = createInsertSchema(riskCashFlowProjections).omit({ id: true });
export const insertRiskGovernanceThresholdSchema = createInsertSchema(riskGovernanceThresholds).omit({ id: true });
export const insertRiskParameterPackSchema = createInsertSchema(riskParameterPacks).omit({ id: true });
export const insertRiskParameterItemSchema = createInsertSchema(riskParameterItems).omit({ id: true });
export const insertRiskCorrelationMatrixSchema = createInsertSchema(riskCorrelationMatrices).omit({ id: true });
export const insertRiskStressScenarioSchema = createInsertSchema(riskStressScenarios).omit({ id: true });
export const insertRiskSimulationSchema = createInsertSchema(riskSimulations).omit({ id: true });
export const insertRiskMaxDrawdownResultSchema = createInsertSchema(riskMaxDrawdownResults).omit({ id: true });
export const insertRiskLcrResultSchema = createInsertSchema(riskLcrResults).omit({ id: true });
export const insertRiskCrisisPnlResultSchema = createInsertSchema(riskCrisisPnlResults).omit({ id: true });
export const insertRiskEsResultSchema = createInsertSchema(riskEsResults).omit({ id: true });
export const insertRiskCsiResultSchema = createInsertSchema(riskCsiResults).omit({ id: true });
export const insertRiskGovernanceReviewSchema = createInsertSchema(riskGovernanceReviews).omit({ id: true });
export const insertRiskAuditLogSchema = createInsertSchema(riskAuditLogs).omit({ id: true });
export const insertRiskDraftSchema = createInsertSchema(riskDrafts).omit({ id: true });

// ===================================================================
// RISK MODULE TYPES
// ===================================================================

export type RiskOrganization = typeof riskOrganizations.$inferSelect;
export type InsertRiskOrganization = z.infer<typeof insertRiskOrganizationSchema>;

export type RiskUser = typeof riskUsers.$inferSelect;
export type InsertRiskUser = z.infer<typeof insertRiskUserSchema>;

export type RiskPortfolio = typeof riskPortfolios.$inferSelect;
export type InsertRiskPortfolio = z.infer<typeof insertRiskPortfolioSchema>;

export type RiskSleeve = typeof riskSleeves.$inferSelect;
export type InsertRiskSleeve = z.infer<typeof insertRiskSleeveSchema>;

export type RiskLiquidityPosition = typeof riskLiquidityPositions.$inferSelect;
export type InsertRiskLiquidityPosition = z.infer<typeof insertRiskLiquidityPositionSchema>;

export type RiskCashFlowProjection = typeof riskCashFlowProjections.$inferSelect;
export type InsertRiskCashFlowProjection = z.infer<typeof insertRiskCashFlowProjectionSchema>;

export type RiskGovernanceThreshold = typeof riskGovernanceThresholds.$inferSelect;
export type InsertRiskGovernanceThreshold = z.infer<typeof insertRiskGovernanceThresholdSchema>;

export type RiskParameterPack = typeof riskParameterPacks.$inferSelect;
export type InsertRiskParameterPack = z.infer<typeof insertRiskParameterPackSchema>;

export type RiskParameterItem = typeof riskParameterItems.$inferSelect;
export type InsertRiskParameterItem = z.infer<typeof insertRiskParameterItemSchema>;

export type RiskCorrelationMatrix = typeof riskCorrelationMatrices.$inferSelect;
export type InsertRiskCorrelationMatrix = z.infer<typeof insertRiskCorrelationMatrixSchema>;

export type RiskStressScenario = typeof riskStressScenarios.$inferSelect;
export type InsertRiskStressScenario = z.infer<typeof insertRiskStressScenarioSchema>;

export type RiskSimulation = typeof riskSimulations.$inferSelect;
export type InsertRiskSimulation = z.infer<typeof insertRiskSimulationSchema>;

export type RiskMaxDrawdownResult = typeof riskMaxDrawdownResults.$inferSelect;
export type InsertRiskMaxDrawdownResult = z.infer<typeof insertRiskMaxDrawdownResultSchema>;

export type RiskLcrResult = typeof riskLcrResults.$inferSelect;
export type InsertRiskLcrResult = z.infer<typeof insertRiskLcrResultSchema>;

export type RiskCrisisPnlResult = typeof riskCrisisPnlResults.$inferSelect;
export type InsertRiskCrisisPnlResult = z.infer<typeof insertRiskCrisisPnlResultSchema>;

export type RiskEsResult = typeof riskEsResults.$inferSelect;
export type InsertRiskEsResult = z.infer<typeof insertRiskEsResultSchema>;

export type RiskCsiResult = typeof riskCsiResults.$inferSelect;
export type InsertRiskCsiResult = z.infer<typeof insertRiskCsiResultSchema>;

export type RiskGovernanceReview = typeof riskGovernanceReviews.$inferSelect;
export type InsertRiskGovernanceReview = z.infer<typeof insertRiskGovernanceReviewSchema>;

export type RiskAuditLog = typeof riskAuditLogs.$inferSelect;
export type InsertRiskAuditLog = z.infer<typeof insertRiskAuditLogSchema>;

export type RiskDraft = typeof riskDrafts.$inferSelect;
export type InsertRiskDraft = z.infer<typeof insertRiskDraftSchema>;

// ===================================================================
// RISK MODULE HELPER TYPES
// ===================================================================

// Sleeve types enum
export const SLEEVE_TYPES = [
  'GROWTH',
  'CREDIT',
  'DURATION',
  'TIPS',
  'CTA',
  'COMMODITIES',
  'DIVERSIFIERS',
  'REAL_ASSETS',
  'LIQUIDITY'
] as const;

export type SleeveType = typeof SLEEVE_TYPES[number];

// Complete portfolio with all related data
export interface RiskPortfolioComplete {
  portfolio: RiskPortfolio;
  sleeves: RiskSleeve[];
  liquidityPosition: RiskLiquidityPosition | null;
  cashFlowProjection: RiskCashFlowProjection | null;
  governanceThreshold: RiskGovernanceThreshold | null;
}

// Complete simulation with all results
export interface RiskSimulationComplete {
  simulation: RiskSimulation;
  maxDrawdown: RiskMaxDrawdownResult[];
  lcr: RiskLcrResult | null;
  crisisPnl: RiskCrisisPnlResult[];
  es: RiskEsResult | null;
  csi: RiskCsiResult | null;
}
