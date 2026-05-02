import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AirtableService } from "./services/airtable";
import { MetricsService } from "./services/metrics";
import { OpenAIService } from "./services/openai";

const metricsService = new MetricsService();

// Helper function to get live Airtable data
async function getLiveAirtableData() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableIdsStr = process.env.AIRTABLE_TABLE_IDS;

  if (!apiKey || !baseId || !tableIdsStr) {
    throw new Error("Missing Airtable credentials");
  }

  const tableIds = JSON.parse(tableIdsStr);
  const airtableService = new AirtableService(apiKey, baseId);

  return {
    airtableService,
    tableIds
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/healthz", async (req: Request, res: Response) => {
    try {
      const syncStatuses = await storage.getSyncStatuses();
      const hasCredentials = !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID && process.env.AIRTABLE_TABLE_IDS);
      
      res.json({
        secrets_ok: hasCredentials,
        db_ok: true,
        tables: syncStatuses,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ 
        secrets_ok: false, 
        db_ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Sync endpoints
  app.post("/api/sync", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tableIdsStr = process.env.AIRTABLE_TABLE_IDS;

      if (!apiKey || !baseId || !tableIdsStr) {
        return res.status(400).json({ 
          error: "Missing Airtable credentials. Please configure AIRTABLE_API_KEY, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_IDS." 
        });
      }

      let tableIds: Record<string, string>;
      try {
        tableIds = JSON.parse(tableIdsStr);
      } catch (error) {
        return res.status(400).json({ 
          error: "AIRTABLE_TABLE_IDS must be valid JSON object mapping table names to table IDs." 
        });
      }
      
      if (Object.keys(tableIds).length < 5) {
        return res.status(400).json({ 
          error: "At least 5 table mappings are required." 
        });
      }

      const airtableService = new AirtableService(apiKey, baseId);
      await airtableService.syncAllTables(tableIds);

      res.json({ 
        success: true, 
        message: `Successfully synced ${Object.keys(tableIds).length} tables`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Sync failed'
      });
    }
  });

  app.get("/api/sync/status", async (req: Request, res: Response) => {
    try {
      const statuses = await storage.getSyncStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch sync status'
      });
    }
  });

  // Individual table sync endpoints
  const createSyncEndpoint = (tableName: string, syncMethod: (service: AirtableService, tableId: string) => Promise<void>) => {
    app.post(`/api/sync/${tableName}`, async (req: Request, res: Response) => {
      try {
        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;
        const tableIdsStr = process.env.AIRTABLE_TABLE_IDS;

        if (!apiKey || !baseId || !tableIdsStr) {
          return res.status(400).json({ 
            error: "Missing Airtable credentials." 
          });
        }

        let tableIds: Record<string, string>;
        try {
          tableIds = JSON.parse(tableIdsStr);
        } catch (error) {
          return res.status(400).json({ 
            error: "AIRTABLE_TABLE_IDS must be valid JSON." 
          });
        }

        const tableId = tableIds[tableName.replace('-', '_')];
        if (!tableId) {
          return res.status(400).json({ 
            error: `Table ID not found for ${tableName}` 
          });
        }

        const airtableService = new AirtableService(apiKey, baseId);
        await syncMethod(airtableService, tableId);

        res.json({ 
          success: true, 
          message: `Successfully synced ${tableName}`,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : `Sync failed for ${tableName}`
        });
      }
    });
  };

  // Create individual sync endpoints
  createSyncEndpoint('fund-info', (service, tableId) => service.syncFundInfo(tableId));
  createSyncEndpoint('net-cashflows', (service, tableId) => service.syncNetCashflows(tableId));
  createSyncEndpoint('reported-metrics', (service, tableId) => service.syncReportedMetrics(tableId));
  createSyncEndpoint('detailed-net-cashflows', (service, tableId) => service.syncDetailedNetCashflows(tableId));
  createSyncEndpoint('laddered-bonds', (service, tableId) => service.syncLadderedBonds(tableId));

  // Data endpoints

  app.get("/api/net-cashflows", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tableIdsStr = process.env.AIRTABLE_TABLE_IDS;

      if (!apiKey || !baseId || !tableIdsStr) {
        return res.status(400).json({ error: "Missing Airtable credentials" });
      }

      const tableIds = JSON.parse(tableIdsStr);
      const netCashflowsTableId = tableIds.net_cashflows || tableIds.capital_calls;

      if (!netCashflowsTableId) {
        return res.status(400).json({ error: "Net cashflows table ID not configured" });
      }

      const airtableService = new AirtableService(apiKey, baseId);
      const netCashflows = await airtableService.getNetCashflowsLive(netCashflowsTableId);
      res.json(netCashflows);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch net cashflows'
      });
    }
  });

  app.get("/api/detailed-net-cashflows", async (req: Request, res: Response) => {
    try {
      const { airtableService, tableIds } = await getLiveAirtableData();
      const detailedNetCashflowsTableId = tableIds.detailed_net_cashflows || tableIds.detailed_capital_calls;

      if (!detailedNetCashflowsTableId) {
        return res.status(400).json({ error: "Detailed net cashflows table ID not configured" });
      }

      const detailedNetCashflows = await airtableService.getDetailedNetCashflowsLive(detailedNetCashflowsTableId);
      res.json(detailedNetCashflows);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch detailed net cashflows'
      });
    }
  });


  app.get("/api/funds", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tableIdsStr = process.env.AIRTABLE_TABLE_IDS;

      if (!apiKey || !baseId || !tableIdsStr) {
        return res.status(400).json({ error: "Missing Airtable credentials" });
      }

      const tableIds = JSON.parse(tableIdsStr);
      const fundInfoTableId = tableIds.fund_info;

      if (!fundInfoTableId) {
        return res.status(400).json({ error: "Fund info table ID not configured" });
      }

      const airtableService = new AirtableService(apiKey, baseId);
      const funds = await airtableService.getFundInfoLive(fundInfoTableId);
      res.json(funds);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch funds'
      });
    }
  });

  app.get("/api/reported-metrics", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tableIdsStr = process.env.AIRTABLE_TABLE_IDS;

      if (!apiKey || !baseId || !tableIdsStr) {
        return res.status(400).json({ error: "Missing Airtable credentials" });
      }

      const tableIds = JSON.parse(tableIdsStr);
      const reportedMetricsTableId = tableIds.reported_metrics;

      if (!reportedMetricsTableId) {
        return res.status(400).json({ error: "Reported metrics table ID not configured" });
      }

      const airtableService = new AirtableService(apiKey, baseId);
      const reportedMetrics = await airtableService.getReportedMetricsLive(reportedMetricsTableId);
      res.json(reportedMetrics);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch reported metrics'
      });
    }
  });

  app.get("/api/laddered-bonds", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tableIdsStr = process.env.AIRTABLE_TABLE_IDS;

      if (!apiKey || !baseId || !tableIdsStr) {
        return res.status(400).json({ error: "Missing Airtable credentials" });
      }

      const tableIds = JSON.parse(tableIdsStr);
      const ladderedBondsTableId = tableIds.laddered_bonds;

      if (!ladderedBondsTableId) {
        return res.status(400).json({ error: "Laddered bonds table ID not configured" });
      }

      const airtableService = new AirtableService(apiKey, baseId);
      const ladderedBonds = await airtableService.getLadderedBondsLive(ladderedBondsTableId);
      res.json(ladderedBonds);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch laddered bonds'
      });
    }
  });

  app.get("/api/quarterly-forecast", async (req: Request, res: Response) => {
    try {
      // Fetch live data from Airtable
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tableIdsStr = process.env.AIRTABLE_TABLE_IDS;

      if (!apiKey || !baseId || !tableIdsStr) {
        return res.status(400).json({ 
          error: "Missing Airtable credentials" 
        });
      }

      const tableIds = JSON.parse(tableIdsStr);
      const netCashflowsTableId = tableIds.net_cashflows || tableIds.capital_calls;

      if (!netCashflowsTableId) {
        return res.status(400).json({ 
          error: "Net cashflows table ID not configured" 
        });
      }

      const airtableService = new AirtableService(apiKey, baseId);
      const cashflows = await airtableService.getNetCashflowsLive(netCashflowsTableId);
      
      // Filter for contributions only, exclude actual cashflows (forecasted only), and future quarters starting Q3 2025
      const contributions = cashflows.filter(cf => 
        cf.inOut === 'Contribution' && 
        cf.status !== 'actual' && // Exclude actual cashflows, only forecasted
        new Date(cf.cashflowDate) >= new Date('2025-07-01') &&
        new Date(cf.cashflowDate) <= new Date('2026-09-30')
      );

      // Group by fund and quarter
      const quarterlyData: { [fundName: string]: { 
        Q3_2025: number, Q4_2025: number, Q1_2026: number, Q2_2026: number, Q3_2026: number, total: number 
      }} = {};

      contributions.forEach(cf => {
        const date = new Date(cf.cashflowDate);
        const fundName = cf.fundName || 'Unknown Fund';
        const amount = parseFloat(cf.amount || '0');
        
        // Determine quarter
        let quarter: 'Q3_2025' | 'Q4_2025' | 'Q1_2026' | 'Q2_2026' | 'Q3_2026';
        if (date >= new Date('2025-07-01') && date <= new Date('2025-09-30')) {
          quarter = 'Q3_2025';
        } else if (date >= new Date('2025-10-01') && date <= new Date('2025-12-31')) {
          quarter = 'Q4_2025';
        } else if (date >= new Date('2026-01-01') && date <= new Date('2026-03-31')) {
          quarter = 'Q1_2026';
        } else if (date >= new Date('2026-04-01') && date <= new Date('2026-06-30')) {
          quarter = 'Q2_2026';
        } else if (date >= new Date('2026-07-01') && date <= new Date('2026-09-30')) {
          quarter = 'Q3_2026';
        } else {
          return; // Skip if outside target quarters
        }

        if (!quarterlyData[fundName]) {
          quarterlyData[fundName] = { Q3_2025: 0, Q4_2025: 0, Q1_2026: 0, Q2_2026: 0, Q3_2026: 0, total: 0 };
        }
        
        quarterlyData[fundName][quarter] += amount;
        quarterlyData[fundName].total += amount;
      });

      // Filter out funds with zero total forecasted contributions
      const nonZeroFunds = Object.entries(quarterlyData)
        .filter(([_, data]) => data.total > 0)
        .map(([fundName, data]) => ({
          fundName,
          q3_2025: data.Q3_2025,
          q4_2025: data.Q4_2025,
          q1_2026: data.Q1_2026,
          q2_2026: data.Q2_2026,
          q3_2026: data.Q3_2026,
          total: data.total
        }))
        .sort((a, b) => b.total - a.total); // Sort by total descending

      res.json(nonZeroFunds);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // DEBUG: Temporary endpoints to see actual Airtable field names for all tables
  app.get("/api/debug/fund-info-fields", (req, res) => {
    res.json((global as any).fundInfoDebug || { message: "Run sync first" });
  });
  
  app.get("/api/debug/net-cashflows-fields", (req, res) => {
    res.json((global as any).netCashflowsDebug || { message: "Run sync first" });
  });
  
  app.get("/api/debug/detailed-net-cashflows-fields", (req, res) => {
    res.json((global as any).detailedNetCashflowsDebug || { message: "Run sync first" });
  });
  
  app.get("/api/debug/reported-metrics-fields", (req, res) => {
    res.json((global as any).reportedMetricsDebug || { message: "Run sync first" });
  });
  
  
  app.get("/api/debug/laddered-bonds-fields", (req, res) => {
    res.json((global as any).ladderedBondsDebug || { message: "Run sync first" });
  });

  // Metrics endpoints
  app.get("/api/metrics/portfolio", async (req: Request, res: Response) => {
    try {
      const { airtableService, tableIds } = await getLiveAirtableData();
      const netCashflowsTableId = tableIds.net_cashflows || tableIds.capital_calls;
      const netCashflows = await airtableService.getNetCashflowsLive(netCashflowsTableId);
      
      // Calculate total paid-in from contributions with actual status
      const totalPaidInSum = netCashflows
        .filter(cf => cf.inOut === 'Contribution' && cf.status === 'actual')
        .reduce((sum, cf) => sum + parseFloat(cf.amount || '0'), 0);
      const totalPaidIn = Math.round((totalPaidInSum / 1000000) * 10) / 10;
      
      // Calculate total distributions
      const totalDistributionsSum = netCashflows
        .filter(cf => cf.inOut === 'Distribution' && cf.status === 'actual')
        .reduce((sum, cf) => sum + parseFloat(cf.amount || '0'), 0);
      const totalDistributions = Math.round((Math.abs(totalDistributionsSum) / 1000000) * 10) / 10;
      
      res.json({
        totalCommitted: 0,
        totalPaidIn,
        totalNav: 0,
        tvpi: 0,
        dpi: 0,
        rvpi: 0,
        activeInvestments: 0,
        totalPaidInChange: "+0.0%",
        totalDistributions,
      });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio metrics'
      });
    }
  });

  app.get("/api/metrics/performance", async (req: Request, res: Response) => {
    try {
      const { airtableService, tableIds } = await getLiveAirtableData();
      const funds = await airtableService.getFundInfoLive(tableIds.fund_info);
      const reportedMetrics = await airtableService.getReportedMetricsLive(tableIds.reported_metrics);
      
      const results: any[] = [];
      
      // Add all historical reported metrics as separate entries
      for (const metrics of reportedMetrics) {
        const fund = funds.find(f => f.airtableId === metrics.fundId || f.name === metrics.fundName);
        if (fund) {
          results.push({
            id: `${fund.id}-${metrics.id}`,
            name: fund.name,
            tvpi: parseFloat(metrics.tvpi || '0'),
            dpi: parseFloat(metrics.dpi || '0'),
            rvpi: parseFloat(metrics.rvpi || '0'),
            irr: parseFloat(metrics.irr || '0') * 100,
            status: fund.status || 'Active',
            reportingPeriod: metrics.reportingPeriod,
            investedCapPercentage: parseFloat(metrics.investedCapPercentage || '0') * 100,
            committedToInvestPercentage: parseFloat(metrics.committedToInvestPercentage || '0') * 100,
            hasReportedMetrics: true,
            updatedAt: metrics.createdAt,
          });
        }
      }
      
      res.json(results.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to calculate fund performance'
      });
    }
  });



  app.get("/api/metrics/net-cashflows-series", async (req: Request, res: Response) => {
    // Placeholder endpoint - returns empty time series
    res.json([]);
  });

  app.get("/api/metrics/distributions-series", async (req: Request, res: Response) => {
    // Placeholder endpoint - returns empty time series
    res.json([]);
  });

  app.get("/api/metrics/nav-breakdown", async (req: Request, res: Response) => {
    // Placeholder endpoint - returns empty NAV breakdown
    res.json([]);
  });

  app.get("/api/metrics/amount-usd-in-m", async (req: Request, res: Response) => {
    try {
      const { airtableService, tableIds } = await getLiveAirtableData();
      const netCashflowsTableId = tableIds.net_cashflows || tableIds.capital_calls;
      const netCashflows = await airtableService.getNetCashflowsLive(netCashflowsTableId);
      
      const totalAmount = netCashflows.reduce((sum, cf) => sum + parseFloat(cf.amount || '0'), 0);
      const amountInMillions = (totalAmount * -1) / 1000000;
      const value = Math.round(amountInMillions * 10) / 10;
      
      res.json({ value });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to calculate Amount USD in M'
      });
    }
  });

  app.get("/api/metrics/fund-net-cashflows-by-year", async (req: Request, res: Response) => {
    try {
      const { airtableService, tableIds } = await getLiveAirtableData();
      const netCashflowsTableId = tableIds.net_cashflows || tableIds.capital_calls;
      const netCashflows = await airtableService.getNetCashflowsLive(netCashflowsTableId);
      
      const cashflowsWithFunds = netCashflows.filter(cf => cf.fundName);
      const fundYearMap = new Map<string, Map<number, number>>();
      const allYears = new Set<number>();
      
      for (const cf of cashflowsWithFunds) {
        const fundName = cf.fundName!;
        const year = new Date(cf.cashflowDate).getFullYear();
        const amount = parseFloat(cf.amount || '0');
        
        allYears.add(year);
        if (!fundYearMap.has(fundName)) {
          fundYearMap.set(fundName, new Map());
        }
        const fundData = fundYearMap.get(fundName)!;
        fundData.set(year, (fundData.get(year) || 0) + amount);
      }
      
      const sortedYears = Array.from(allYears).sort();
      const totals: Record<number, number> = {};
      let grandTotal = 0;
      
      const funds = Array.from(fundYearMap.entries()).map(([fundName, yearData]) => {
        const data: Record<number, number> = {};
        let total = 0;
        
        for (const year of sortedYears) {
          const amount = yearData.get(year) || 0;
          const amountInM = Math.round((amount / 1000000) * 10) / 10;
          data[year] = amountInM;
          total += amountInM;
          totals[year] = (totals[year] || 0) + amountInM;
        }
        
        const fundTotal = Math.round(total * 10) / 10;
        grandTotal += fundTotal;
        
        return { fundName, data, total: fundTotal };
      }).sort((a, b) => a.fundName.localeCompare(b.fundName));
      
      for (const year of sortedYears) {
        totals[year] = Math.round((totals[year] || 0) * 10) / 10;
      }
      
      res.json({
        years: sortedYears,
        funds,
        totals,
        grandTotal: Math.round(grandTotal * 10) / 10
      });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate fund net cashflows by year'
      });
    }
  });

  app.get("/api/metrics/cumulative-net-cashflow", async (req: Request, res: Response) => {
    try {
      const { airtableService, tableIds } = await getLiveAirtableData();
      const netCashflowsTableId = tableIds.net_cashflows || tableIds.capital_calls;
      const netCashflows = await airtableService.getNetCashflowsLive(netCashflowsTableId);
      
      const sortedCashflows = netCashflows.sort((a, b) => 
        new Date(a.cashflowDate).getTime() - new Date(b.cashflowDate).getTime()
      );
      
      let runningTotal = 0;
      const timeline = sortedCashflows.map(cf => {
        const amount = parseFloat(cf.amount || '0');
        const amountInM = Math.round((amount / 1000000) * 10) / 10;
        runningTotal += amountInM;
        const cumulative = Math.round((runningTotal * -1) * 10) / 10;
        
        return {
          date: new Date(cf.cashflowDate).toISOString(),
          amount: amountInM,
          cumulative: cumulative
        };
      });
      
      res.json({
        timeline,
        totalCumulative: Math.round((runningTotal * -1) * 10) / 10
      });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate cumulative net cashflow'
      });
    }
  });

  app.get("/api/metrics/cumulative-net-cashflows-by-fund", async (req: Request, res: Response) => {
    try {
      const { airtableService, tableIds } = await getLiveAirtableData();
      const netCashflowsTableId = tableIds.net_cashflows || tableIds.capital_calls;
      const netCashflows = await airtableService.getNetCashflowsLive(netCashflowsTableId);
      
      const cashflowsWithFunds = netCashflows.filter(cf => cf.fundName);
      const fundMap = new Map<string, typeof cashflowsWithFunds>();
      
      for (const cf of cashflowsWithFunds) {
        const fundName = cf.fundName!;
        if (!fundMap.has(fundName)) {
          fundMap.set(fundName, []);
        }
        fundMap.get(fundName)!.push(cf);
      }
      
      const funds = Array.from(fundMap.entries()).map(([fundName, cashflows]) => {
        const sortedCashflows = cashflows.sort((a, b) => 
          new Date(a.cashflowDate).getTime() - new Date(b.cashflowDate).getTime()
        );
        
        let runningTotal = 0;
        const timeline = sortedCashflows.map(cf => {
          const amount = parseFloat(cf.amount || '0');
          const amountInM = Math.round((amount / 1000000) * 10) / 10;
          runningTotal += amountInM;
          const cumulative = Math.round((runningTotal * -1) * 10) / 10;
          
          return {
            date: new Date(cf.cashflowDate).toISOString(),
            amount: amountInM,
            cumulative: cumulative
          };
        });
        
        return { fundName, timeline };
      });
      
      res.json({ funds });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to calculate cumulative net cashflows by fund'
      });
    }
  });

  // RISK MODULE - Seed data endpoint
  // Protected: Only available in development environment
  app.post("/api/risk/seed", async (req: Request, res: Response) => {
    // Environment guard: only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        error: "Seed endpoint is only available in development mode"
      });
    }

    try {
      const { seedRiskData } = await import("./services/risk-seed");
      const result = await seedRiskData();
      res.json({ 
        success: true,
        message: "Risk module seeded successfully",
        data: result
      });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to seed risk data'
      });
    }
  });

  // RISK MODULE - Portfolio endpoints
  app.get("/api/risk/portfolios", async (req: Request, res: Response) => {
    try {
      const { getRiskDatabase } = await import("./services/risk-db");
      const { riskPortfolios } = await import("@shared/schema");
      const db = getRiskDatabase();
      const portfolios = await db.select().from(riskPortfolios);
      res.json(portfolios);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch portfolios'
      });
    }
  });

  app.get("/api/risk/portfolios/:id", async (req: Request, res: Response) => {
    try {
      const { getRiskDatabase } = await import("./services/risk-db");
      const { riskPortfolios, riskSleeves, riskLiquidityPositions, riskCashFlowProjections, riskGovernanceThresholds } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const db = getRiskDatabase();
      
      const [portfolio] = await db.select().from(riskPortfolios).where(eq(riskPortfolios.id, req.params.id));
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      const sleeves = await db.select().from(riskSleeves).where(eq(riskSleeves.portfolioId, req.params.id));
      const [liquidity] = await db.select().from(riskLiquidityPositions).where(eq(riskLiquidityPositions.portfolioId, req.params.id));
      const [cashflows] = await db.select().from(riskCashFlowProjections).where(eq(riskCashFlowProjections.portfolioId, req.params.id));
      const [thresholds] = await db.select().from(riskGovernanceThresholds).where(eq(riskGovernanceThresholds.portfolioId, req.params.id));

      res.json({ portfolio, sleeves, liquidity, cashflows, thresholds });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio details'
      });
    }
  });

  // RISK MODULE - Parameter Pack endpoints
  app.get("/api/risk/parameter-packs/:portfolioId", async (req: Request, res: Response) => {
    try {
      const { getRiskDatabase } = await import("./services/risk-db");
      const { riskParameterPacks } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      const db = getRiskDatabase();
      
      const packs = await db.select()
        .from(riskParameterPacks)
        .where(eq(riskParameterPacks.portfolioId, req.params.portfolioId))
        .orderBy(desc(riskParameterPacks.version));
      
      res.json(packs);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch parameter packs'
      });
    }
  });

  // RISK MODULE - Simulation endpoints
  app.get("/api/risk/simulations/:portfolioId", async (req: Request, res: Response) => {
    try {
      const { getRiskDatabase } = await import("./services/risk-db");
      const { riskSimulations } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      const db = getRiskDatabase();
      
      const simulations = await db.select()
        .from(riskSimulations)
        .where(eq(riskSimulations.portfolioId, req.params.portfolioId))
        .orderBy(desc(riskSimulations.createdAt));
      
      res.json(simulations);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch simulations'
      });
    }
  });

  app.get("/api/risk/simulations/:id/results", async (req: Request, res: Response) => {
    try {
      const { getRiskDatabase } = await import("./services/risk-db");
      const { 
        riskMaxDrawdownResults, 
        riskLcrResults, 
        riskCrisisPnlResults, 
        riskEsResults, 
        riskCsiResults 
      } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const db = getRiskDatabase();
      const simulationId = req.params.id;

      const [maxDrawdown] = await db.select().from(riskMaxDrawdownResults).where(eq(riskMaxDrawdownResults.simulationId, simulationId));
      const [lcr] = await db.select().from(riskLcrResults).where(eq(riskLcrResults.simulationId, simulationId));
      const crisisPnl = await db.select().from(riskCrisisPnlResults).where(eq(riskCrisisPnlResults.simulationId, simulationId));
      const [es] = await db.select().from(riskEsResults).where(eq(riskEsResults.simulationId, simulationId));
      const [csi] = await db.select().from(riskCsiResults).where(eq(riskCsiResults.simulationId, simulationId));

      res.json({ maxDrawdown, lcr, crisisPnl, es, csi });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch simulation results'
      });
    }
  });

  // RISK MODULE - Governance Review endpoint
  app.get("/api/risk/governance-review/:portfolioId", async (req: Request, res: Response) => {
    try {
      const { getRiskDatabase } = await import("./services/risk-db");
      const { riskGovernanceReviews } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      const db = getRiskDatabase();
      
      const [review] = await db.select()
        .from(riskGovernanceReviews)
        .where(eq(riskGovernanceReviews.portfolioId, req.params.portfolioId))
        .orderBy(desc(riskGovernanceReviews.createdAt))
        .limit(1);
      
      res.json(review || null);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch governance review'
      });
    }
  });

  // ChatGPT Advisor endpoint
  app.post("/api/ask", async (req: Request, res: Response) => {
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      
      if (!openaiKey) {
        return res.status(400).json({ 
          error: "OpenAI API key not configured. Please set OPENAI_API_KEY to use the advisor feature." 
        });
      }

      const { message, history } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          error: "Message is required and must be a string." 
        });
      }

      const openaiService = new OpenAIService(openaiKey);
      const clientId = req.ip || 'unknown';
      const response = await openaiService.chat({ message, history }, clientId);

      if (response.error) {
        return res.status(429).json(response);
      }

      res.json(response);

    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to process chat request'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
