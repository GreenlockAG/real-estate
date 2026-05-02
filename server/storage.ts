import { 
  type NetCashflow,
  type InsertNetCashflow,
  type FundInfo,
  type InsertFundInfo,
  type ReportedMetrics,
  type InsertReportedMetrics,
  type DetailedNetCashflow,
  type InsertDetailedNetCashflow,
  type LadderedBonds,
  type InsertLadderedBonds,
  type SyncStatus,
  type InsertSyncStatus,
  netCashflows,
  fundInfo,
  reportedMetrics,
  detailedNetCashflows,
  ladderedBonds,
  syncStatus
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Net cashflows operations
  getNetCashflows(): Promise<NetCashflow[]>;
  createNetCashflow(cashflow: InsertNetCashflow): Promise<NetCashflow>;
  upsertNetCashflowByAirtableId(airtableId: string, cashflow: InsertNetCashflow): Promise<NetCashflow>;

  // Fund info operations
  getFunds(): Promise<FundInfo[]>;
  getFundById(id: string): Promise<FundInfo | undefined>;
  getFundByAirtableId(airtableId: string): Promise<FundInfo | undefined>;
  createFund(fund: InsertFundInfo): Promise<FundInfo>;
  upsertFundByAirtableId(airtableId: string, fund: InsertFundInfo): Promise<FundInfo>;

  // Reported metrics operations
  getReportedMetrics(): Promise<ReportedMetrics[]>;
  createReportedMetrics(metrics: InsertReportedMetrics): Promise<ReportedMetrics>;
  upsertReportedMetricsByAirtableId(airtableId: string, metrics: InsertReportedMetrics): Promise<ReportedMetrics>;
  clearReportedMetrics(): Promise<void>;

  // Detailed net cashflows operations
  getDetailedNetCashflows(): Promise<DetailedNetCashflow[]>;
  createDetailedNetCashflow(cashflow: InsertDetailedNetCashflow): Promise<DetailedNetCashflow>;
  upsertDetailedNetCashflowByAirtableId(airtableId: string, cashflow: InsertDetailedNetCashflow): Promise<DetailedNetCashflow>;

  // Laddered bonds operations
  getLadderedBonds(): Promise<LadderedBonds[]>;
  createLadderedBonds(bonds: InsertLadderedBonds): Promise<LadderedBonds>;
  upsertLadderedBondsByAirtableId(airtableId: string, bonds: InsertLadderedBonds): Promise<LadderedBonds>;
  clearLadderedBonds(): Promise<void>;

  // Sync status operations
  getSyncStatuses(): Promise<SyncStatus[]>;
  updateSyncStatus(tableName: string, status: InsertSyncStatus): Promise<SyncStatus>;
  getSyncStatus(tableName: string): Promise<SyncStatus | undefined>;
}

export class MemStorage implements IStorage {
  private netCashflows: Map<string, NetCashflow> = new Map();
  private funds: Map<string, FundInfo> = new Map();
  private reportedMetrics: Map<string, ReportedMetrics> = new Map();
  private detailedNetCashflows: Map<string, DetailedNetCashflow> = new Map();
  private ladderedBonds: Map<string, LadderedBonds> = new Map();
  private syncStatuses: Map<string, SyncStatus> = new Map();


  // Net cashflows operations
  async getNetCashflows(): Promise<NetCashflow[]> {
    return Array.from(this.netCashflows.values());
  }

  async createNetCashflow(insertCashflow: InsertNetCashflow): Promise<NetCashflow> {
    const id = randomUUID();
    const cashflow: NetCashflow = {
      ...insertCashflow,
      id,
      name: insertCashflow.name || null,
      fundName: insertCashflow.fundName || null,
      status: insertCashflow.status || null,
      inOut: insertCashflow.inOut || null,
      currency: insertCashflow.currency || null,
      year: insertCashflow.year || null,
      createdAt: insertCashflow.createdAt || new Date(),
      updatedAt: insertCashflow.updatedAt || new Date(),
    };
    this.netCashflows.set(id, cashflow);
    return cashflow;
  }

  async upsertNetCashflowByAirtableId(airtableId: string, insertCashflow: InsertNetCashflow): Promise<NetCashflow> {
    const existing = Array.from(this.netCashflows.values()).find(cashflow => cashflow.airtableId === airtableId);
    
    if (existing) {
      const updated: NetCashflow = {
        ...existing,
        ...insertCashflow,
        status: insertCashflow.status || existing.status,
        inOut: insertCashflow.inOut || existing.inOut,
        currency: insertCashflow.currency || existing.currency,
        year: insertCashflow.year || existing.year,
        updatedAt: insertCashflow.updatedAt || new Date(),
      };
      this.netCashflows.set(existing.id, updated);
      return updated;
    } else {
      return this.createNetCashflow(insertCashflow);
    }
  }


  // Fund operations
  async getFunds(): Promise<FundInfo[]> {
    return Array.from(this.funds.values());
  }

  async getFundById(id: string): Promise<FundInfo | undefined> {
    return this.funds.get(id);
  }

  async getFundByAirtableId(airtableId: string): Promise<FundInfo | undefined> {
    return Array.from(this.funds.values()).find(fund => fund.airtableId === airtableId);
  }

  async createFund(insertFund: InsertFundInfo): Promise<FundInfo> {
    const id = randomUUID();
    const fund: FundInfo = {
      ...insertFund,
      id,
      vintage: insertFund.vintage || null,
      assetClass: insertFund.assetClass || null,
      fundSize: insertFund.fundSize || null,
      status: insertFund.status || null,
      manager: insertFund.manager || null,
      createdAt: insertFund.createdAt || new Date(),
      updatedAt: insertFund.updatedAt || new Date(),
    };
    this.funds.set(fund.id, fund);
    return fund;
  }

  async upsertFundByAirtableId(airtableId: string, insertFund: InsertFundInfo): Promise<FundInfo> {
    const existing = Array.from(this.funds.values()).find(fund => fund.airtableId === airtableId);
    
    if (existing) {
      const updated: FundInfo = {
        ...existing,
        ...insertFund,
        vintage: insertFund.vintage || existing.vintage,
        assetClass: insertFund.assetClass || existing.assetClass,
        fundSize: insertFund.fundSize || existing.fundSize,
        status: insertFund.status || existing.status,
        manager: insertFund.manager || existing.manager,
        updatedAt: insertFund.updatedAt || new Date(),
      };
      this.funds.set(existing.id, updated);
      return updated;
    } else {
      return this.createFund(insertFund);
    }
  }

  // Sync status operations
  async getSyncStatuses(): Promise<SyncStatus[]> {
    return Array.from(this.syncStatuses.values());
  }

  async updateSyncStatus(tableName: string, statusData: InsertSyncStatus): Promise<SyncStatus> {
    const id = randomUUID();
    const status: SyncStatus = {
      ...statusData,
      id,
      tableName,
      status: statusData.status || 'ok',
      lastSync: statusData.lastSync || null,
      recordCount: statusData.recordCount || 0,
      errorMessage: statusData.errorMessage || null,
      updatedAt: new Date(),
    };
    this.syncStatuses.set(tableName, status);
    return status;
  }

  async getSyncStatus(tableName: string): Promise<SyncStatus | undefined> {
    return this.syncStatuses.get(tableName);
  }

  // Reported metrics operations
  async getReportedMetrics(): Promise<ReportedMetrics[]> {
    return Array.from(this.reportedMetrics.values());
  }

  async createReportedMetrics(insertMetrics: InsertReportedMetrics): Promise<ReportedMetrics> {
    const id = randomUUID();
    const metrics: ReportedMetrics = {
      ...insertMetrics,
      id,
      fundId: insertMetrics.fundId || null,
      fundName: insertMetrics.fundName || null,
      reportingPeriod: insertMetrics.reportingPeriod || null,
      nav: insertMetrics.nav || null,
      irr: insertMetrics.irr || null,
      grossIrr: insertMetrics.grossIrr || null,
      tvpi: insertMetrics.tvpi || null,
      dpi: insertMetrics.dpi || null,
      rvpi: insertMetrics.rvpi || null,
      grossMoic: insertMetrics.grossMoic || null,
      investedCapPercentage: insertMetrics.investedCapPercentage || null,
      committedToInvestPercentage: insertMetrics.committedToInvestPercentage || null,
      currentNetCalledCap: insertMetrics.currentNetCalledCap || null,
      noInvestments: insertMetrics.noInvestments || null,
      currency: insertMetrics.currency || null,
      notes: insertMetrics.notes || null,
      createdAt: insertMetrics.createdAt || new Date(),
      updatedAt: insertMetrics.updatedAt || new Date(),
    };
    this.reportedMetrics.set(id, metrics);
    return metrics;
  }

  async upsertReportedMetricsByAirtableId(airtableId: string, insertMetrics: InsertReportedMetrics): Promise<ReportedMetrics> {
    const existing = Array.from(this.reportedMetrics.values()).find(metrics => metrics.airtableId === airtableId);
    
    if (existing) {
      const updated: ReportedMetrics = {
        ...existing,
        ...insertMetrics,
        updatedAt: insertMetrics.updatedAt || new Date(),
      };
      this.reportedMetrics.set(existing.id, updated);
      return updated;
    } else {
      return this.createReportedMetrics(insertMetrics);
    }
  }

  async clearReportedMetrics(): Promise<void> {
    this.reportedMetrics.clear();
  }

  // Detailed net cashflows operations
  async getDetailedNetCashflows(): Promise<DetailedNetCashflow[]> {
    return Array.from(this.detailedNetCashflows.values());
  }

  async createDetailedNetCashflow(insertCashflow: InsertDetailedNetCashflow): Promise<DetailedNetCashflow> {
    const id = randomUUID();
    const cashflow: DetailedNetCashflow = {
      ...insertCashflow,
      id,
      netCashflowId: insertCashflow.netCashflowId || null,
      fundName: insertCashflow.fundName || null,
      purpose: insertCashflow.purpose || null,
      investmentName: insertCashflow.investmentName || null,
      description: insertCashflow.description || null,
      status: insertCashflow.status || null,
      createdAt: insertCashflow.createdAt || new Date(),
      updatedAt: insertCashflow.updatedAt || new Date(),
    };
    this.detailedNetCashflows.set(id, cashflow);
    return cashflow;
  }

  async upsertDetailedNetCashflowByAirtableId(airtableId: string, insertCashflow: InsertDetailedNetCashflow): Promise<DetailedNetCashflow> {
    const existing = Array.from(this.detailedNetCashflows.values()).find(cashflow => cashflow.airtableId === airtableId);
    
    if (existing) {
      const updated: DetailedNetCashflow = {
        ...existing,
        ...insertCashflow,
        netCashflowId: insertCashflow.netCashflowId || existing.netCashflowId,
        fundName: insertCashflow.fundName || existing.fundName,
        purpose: insertCashflow.purpose || existing.purpose,
        investmentName: insertCashflow.investmentName || existing.investmentName,
        description: insertCashflow.description || existing.description,
        status: insertCashflow.status || existing.status,
        updatedAt: insertCashflow.updatedAt || new Date(),
      };
      this.detailedNetCashflows.set(existing.id, updated);
      return updated;
    } else {
      return this.createDetailedNetCashflow(insertCashflow);
    }
  }

  // Laddered bonds operations
  async getLadderedBonds(): Promise<LadderedBonds[]> {
    return Array.from(this.ladderedBonds.values());
  }

  async createLadderedBonds(insertBonds: InsertLadderedBonds): Promise<LadderedBonds> {
    const id = randomUUID();
    const bonds: LadderedBonds = {
      ...insertBonds,
      id,
      issuer: insertBonds.issuer || null,
      faceValue: insertBonds.faceValue || null,
      maturityDate: insertBonds.maturityDate || null,
      currency: insertBonds.currency || null,
      securityId: insertBonds.securityId || null,
      createdAt: insertBonds.createdAt || new Date(),
      updatedAt: insertBonds.updatedAt || new Date(),
    };
    this.ladderedBonds.set(id, bonds);
    return bonds;
  }

  async upsertLadderedBondsByAirtableId(airtableId: string, insertBonds: InsertLadderedBonds): Promise<LadderedBonds> {
    const existing = Array.from(this.ladderedBonds.values()).find(bonds => bonds.airtableId === airtableId);
    
    if (existing) {
      const updated: LadderedBonds = {
        ...existing,
        ...insertBonds,
        issuer: insertBonds.issuer || existing.issuer,
        faceValue: insertBonds.faceValue || existing.faceValue,
        maturityDate: insertBonds.maturityDate || existing.maturityDate,
        currency: insertBonds.currency || existing.currency,
        securityId: insertBonds.securityId || existing.securityId,
        updatedAt: insertBonds.updatedAt || new Date(),
      };
      this.ladderedBonds.set(existing.id, updated);
      return updated;
    } else {
      return this.createLadderedBonds(insertBonds);
    }
  }

  async clearLadderedBonds(): Promise<void> {
    this.ladderedBonds.clear();
  }
}

// PostgreSQL storage implementation
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

class PostgresStorage implements IStorage {
  private db;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }


  // Net cashflows operations
  async getNetCashflows(): Promise<NetCashflow[]> {
    return await this.db.select().from(netCashflows);
  }

  async createNetCashflow(cashflow: InsertNetCashflow): Promise<NetCashflow> {
    const result = await this.db.insert(netCashflows).values(cashflow).returning();
    return result[0];
  }

  async upsertNetCashflowByAirtableId(airtableId: string, cashflow: InsertNetCashflow): Promise<NetCashflow> {
    const existing = await this.db.select().from(netCashflows).where(eq(netCashflows.airtableId, airtableId));
    
    if (existing.length > 0) {
      const result = await this.db.update(netCashflows).set(cashflow).where(eq(netCashflows.airtableId, airtableId)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(netCashflows).values(cashflow).returning();
      return result[0];
    }
  }


  // Fund operations
  async getFunds(): Promise<FundInfo[]> {
    return await this.db.select().from(fundInfo);
  }

  async getFundById(id: string): Promise<FundInfo | undefined> {
    const result = await this.db.select().from(fundInfo).where(eq(fundInfo.id, id));
    return result[0];
  }

  async getFundByAirtableId(airtableId: string): Promise<FundInfo | undefined> {
    const result = await this.db.select().from(fundInfo).where(eq(fundInfo.airtableId, airtableId));
    return result[0];
  }

  async createFund(fund: InsertFundInfo): Promise<FundInfo> {
    const result = await this.db.insert(fundInfo).values(fund).returning();
    return result[0];
  }

  async upsertFundByAirtableId(airtableId: string, fund: InsertFundInfo): Promise<FundInfo> {
    const existing = await this.db.select().from(fundInfo).where(eq(fundInfo.airtableId, airtableId));
    
    if (existing.length > 0) {
      const result = await this.db.update(fundInfo).set(fund).where(eq(fundInfo.airtableId, airtableId)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(fundInfo).values(fund).returning();
      return result[0];
    }
  }

  // Reported metrics operations
  async getReportedMetrics(): Promise<ReportedMetrics[]> {
    return await this.db.select().from(reportedMetrics);
  }

  async createReportedMetrics(metrics: InsertReportedMetrics): Promise<ReportedMetrics> {
    const result = await this.db.insert(reportedMetrics).values(metrics).returning();
    return result[0];
  }

  async upsertReportedMetricsByAirtableId(airtableId: string, metrics: InsertReportedMetrics): Promise<ReportedMetrics> {
    const existing = await this.db.select().from(reportedMetrics).where(eq(reportedMetrics.airtableId, airtableId));
    
    if (existing.length > 0) {
      const result = await this.db.update(reportedMetrics).set(metrics).where(eq(reportedMetrics.airtableId, airtableId)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(reportedMetrics).values(metrics).returning();
      return result[0];
    }
  }

  // Detailed net cashflows operations
  async getDetailedNetCashflows(): Promise<DetailedNetCashflow[]> {
    return await this.db.select().from(detailedNetCashflows);
  }

  async createDetailedNetCashflow(cashflow: InsertDetailedNetCashflow): Promise<DetailedNetCashflow> {
    const result = await this.db.insert(detailedNetCashflows).values(cashflow).returning();
    return result[0];
  }

  async upsertDetailedNetCashflowByAirtableId(airtableId: string, cashflow: InsertDetailedNetCashflow): Promise<DetailedNetCashflow> {
    const existing = await this.db.select().from(detailedNetCashflows).where(eq(detailedNetCashflows.airtableId, airtableId));
    
    if (existing.length > 0) {
      const result = await this.db.update(detailedNetCashflows).set(cashflow).where(eq(detailedNetCashflows.airtableId, airtableId)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(detailedNetCashflows).values(cashflow).returning();
      return result[0];
    }
  }

  // Laddered bonds operations
  async getLadderedBonds(): Promise<LadderedBonds[]> {
    return await this.db.select().from(ladderedBonds);
  }

  async createLadderedBonds(bonds: InsertLadderedBonds): Promise<LadderedBonds> {
    const result = await this.db.insert(ladderedBonds).values(bonds).returning();
    return result[0];
  }

  async upsertLadderedBondsByAirtableId(airtableId: string, bonds: InsertLadderedBonds): Promise<LadderedBonds> {
    const existing = await this.db.select().from(ladderedBonds).where(eq(ladderedBonds.airtableId, airtableId));
    
    if (existing.length > 0) {
      const result = await this.db.update(ladderedBonds).set(bonds).where(eq(ladderedBonds.airtableId, airtableId)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(ladderedBonds).values(bonds).returning();
      return result[0];
    }
  }

  async clearReportedMetrics(): Promise<void> {
    await this.db.delete(reportedMetrics);
  }

  async clearLadderedBonds(): Promise<void> {
    await this.db.delete(ladderedBonds);
  }

  // Sync status operations  
  async getSyncStatuses(): Promise<SyncStatus[]> {
    return await this.db.select().from(syncStatus);
  }

  async updateSyncStatus(tableName: string, statusData: InsertSyncStatus): Promise<SyncStatus> {
    const existing = await this.db.select().from(syncStatus).where(eq(syncStatus.tableName, tableName));
    
    if (existing.length > 0) {
      const result = await this.db.update(syncStatus).set(statusData).where(eq(syncStatus.tableName, tableName)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(syncStatus).values(statusData).returning();
      return result[0];
    }
  }

  async getSyncStatus(tableName: string): Promise<SyncStatus | undefined> {
    const result = await this.db.select().from(syncStatus).where(eq(syncStatus.tableName, tableName));
    return result[0];
  }
}

const hasDatabaseUrl =
  typeof process.env.DATABASE_URL === "string" &&
  process.env.DATABASE_URL.trim().length > 0;

if (!hasDatabaseUrl) {
  console.warn("DATABASE_URL is not set. Falling back to in-memory storage.");
}

export const storage: IStorage = hasDatabaseUrl
  ? new PostgresStorage()
  : new MemStorage();
