import { storage } from "../storage";

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export class AirtableService {
  private apiKey: string;
  private baseId: string;

  constructor(apiKey: string, baseId: string) {
    this.apiKey = apiKey;
    this.baseId = baseId;
  }

  private async fetchAirtableTable(tableId: string, offset?: string): Promise<AirtableResponse> {
    const url = new URL(`https://api.airtable.com/v0/${this.baseId}/${tableId}`);
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    console.log(`Making Airtable API call to: ${url.toString()}`);
    console.log('Airtable service initialized with API credentials');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PE-VC-Portfolio-Manager/1.0',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Airtable API error details:`, {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        baseId: this.baseId,
        tableId,
        errorBody
      });
      throw new Error(`Airtable API error: ${response.status} - ${response.statusText}. Details: ${errorBody}`);
    }

    return response.json();
  }

  private async getAllRecords(tableId: string): Promise<AirtableRecord[]> {
    const allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
      const response = await this.fetchAirtableTable(tableId, offset);
      allRecords.push(...response.records);
      offset = response.offset;
    } while (offset);

    return allRecords;
  }


  async syncNetCashflows(tableId: string): Promise<void> {
    try {
      const records = await this.getAllRecords(tableId);
      
      // Debug: Log all available field names from first record
      if (records.length > 0) {
        const sampleFields = Object.keys(records[0].fields);
        const sampleFieldsWithValues = records[0].fields;
        (global as any).netCashflowsDebug = {
          availableFields: sampleFields,
          sampleRecord: sampleFieldsWithValues,
          recordCount: records.length
        };
        console.log('Net Cashflows - Available Airtable fields:', sampleFields);
      }
      
      for (const record of records) {
        const fields = record.fields;
        
        // Extract fund information from Airtable
        const fundAirtableId = fields['Funds'] && Array.isArray(fields['Funds']) ? fields['Funds'][0] : null;
        const fundName = fields['dk_FundName'] && Array.isArray(fields['dk_FundName']) ? fields['dk_FundName'][0] : null;
        
        // Map Airtable fund ID to local fund ID
        let localFundId = '';
        if (fundAirtableId) {
          const fund = await storage.getFundByAirtableId(fundAirtableId);
          localFundId = fund ? fund.id : '';
        }
        
        await storage.upsertNetCashflowByAirtableId(record.id, {
          airtableId: record.id,
          fundId: localFundId,
          fundName: fundName,
          name: fields.Name || null,
          amount: fields['Amount, USD'] ? String(fields['Amount, USD']) : '0',
          cashflowDate: new Date(fields['Due date']), // Map Airtable "Due date" to cashflow_date
          // Add missing Airtable fields
          status: fields.Status || null,
          inOut: fields['In-Out'] || null,
          currency: fields.Currency || null,
          year: fields.Year ? parseInt(String(fields.Year)) : null,
          createdAt: new Date(record.createdTime), // Use Airtable's creation time
        });
      }

      await storage.updateSyncStatus('net_cashflows', {
        tableName: 'net_cashflows',
        lastSync: new Date(),
        recordCount: records.length,
        status: 'ok',
        errorMessage: null,
      });

    } catch (error) {
      await storage.updateSyncStatus('net_cashflows', {
        tableName: 'net_cashflows',
        lastSync: new Date(),
        recordCount: 0,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }


  async syncFundInfo(tableId: string): Promise<void> {
    try {
      const records = await this.getAllRecords(tableId);
      
      
      for (const record of records) {
        const fields = record.fields;
        
        await storage.upsertFundByAirtableId(record.id, {
          airtableId: record.id,
          name: fields.Name || fields['Fund Name'] || '',
          vintage: fields.Vintage ? parseInt(String(fields.Vintage)) : null,
          assetClass: fields['Asset Class'] || null, // Asset class goes to assetClass field
          fundSize: fields['Fund size, $M'] ? String(fields['Fund size, $M']) : null, // Fund size goes to fundSize field
          status: fields['open/closed'] || null, // AirTable uses "open/closed"
          manager: fields.Manager || null, // Manager goes to manager field
          createdAt: new Date(record.createdTime), // Use Airtable's creation time
        });
      }

      await storage.updateSyncStatus('fund_info', {
        tableName: 'fund_info',
        lastSync: new Date(),
        recordCount: records.length,
        status: 'ok',
        errorMessage: null,
      });

    } catch (error) {
      await storage.updateSyncStatus('fund_info', {
        tableName: 'fund_info',
        lastSync: new Date(),
        recordCount: 0,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async syncAllTables(tableIds: Record<string, string>): Promise<void> {
    // Sync each table type using the provided mapping
    
    if (tableIds.fund_info) await this.syncFundInfo(tableIds.fund_info);
    if (tableIds.reported_metrics) await this.syncReportedMetrics(tableIds.reported_metrics);
    if (tableIds.net_cashflows || tableIds.capital_calls) await this.syncNetCashflows(tableIds.net_cashflows || tableIds.capital_calls);
    if (tableIds.detailed_net_cashflows || tableIds.detailed_capital_calls) await this.syncDetailedNetCashflows(tableIds.detailed_net_cashflows || tableIds.detailed_capital_calls);
    if (tableIds.laddered_bonds) await this.syncLadderedBonds(tableIds.laddered_bonds);
  }

  async syncReportedMetrics(tableId: string): Promise<void> {
    try {
      const records = await this.getAllRecords(tableId);


      // Clear existing records to implement full sync
      await storage.clearReportedMetrics();

      for (const record of records) {
        const fields = record.fields;
        
        // Handle arrays for linked fields
        const fundNameArray = fields['Fund name'] as string[] | undefined;
        const fundName = fields['Name'] || (fundNameArray && fundNameArray[0]) || null;


        // Handle linked Funds array to get fundId
        const fundsArray = fields['Funds'] as string[] | undefined;
        const fundId: string | null = (fundsArray && fundsArray[0]) ? fundsArray[0] : null;

        await storage.upsertReportedMetricsByAirtableId(record.id, {
          airtableId: record.id,
          fundId: fundId,
          fundName: fundName, // Handle array from linked field
          reportingPeriod: fields['Reporting Period'] || fields['Last update'] || null,
          nav: fields['NAV LP'] ? String(fields['NAV LP']) : null,
          irr: fields['Net IRR'] ? String(fields['Net IRR']) : null,
          grossIrr: fields['Gross IRR'] ? String(fields['Gross IRR']) : null,
          tvpi: fields['TVPI'] ? String(fields['TVPI']) : null,
          dpi: fields['DPI'] ? String(fields['DPI']) : null,
          rvpi: fields['RVPI'] ? String(fields['RVPI']) : null,
          grossMoic: fields['Gross MOIC'] ? String(fields['Gross MOIC']) : null,
          investedCapPercentage: fields['Invested Cap, % of CC'] ? String(fields['Invested Cap, % of CC']) : null,
          committedToInvestPercentage: fields['Committed to invest, % of CC'] ? String(fields['Committed to invest, % of CC']) : null,
          currentNetCalledCap: fields['Current Net CalledCap'] ? String(fields['Current Net CalledCap']) : null,
          noInvestments: fields['No Investments'] ? Number(fields['No Investments']) : null,
          currency: fields['Currency'] || null,
          notes: fields['Notes'] || null,
          createdAt: new Date(record.createdTime), // Use Airtable's creation time
        });
      }

      await storage.updateSyncStatus('reported_metrics', {
        tableName: 'reported_metrics',
        lastSync: new Date(),
        recordCount: records.length,
        status: 'ok',
        errorMessage: null,
      });

    } catch (error) {
      await storage.updateSyncStatus('reported_metrics', {
        tableName: 'reported_metrics',
        lastSync: new Date(),
        recordCount: 0,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async syncDetailedNetCashflows(tableId: string): Promise<void> {
    try {
      const records = await this.getAllRecords(tableId);
      
      
      for (const record of records) {
        const fields = record.fields;
        
        // Extract fund information from linked records - keep trying both old and new field names
        const fundsRollupArray = fields['Funds Rollup (from Net Cashflows)'] as string[] | undefined || 
                                 fields['Funds Rollup (from Capital Calls)'] as string[] | undefined;
        const fundName = fundsRollupArray && fundsRollupArray[0] ? fundsRollupArray[0] : null;
        
        await storage.upsertDetailedNetCashflowByAirtableId(record.id, {
          airtableId: record.id,
          fundId: '', // No direct fund ID available - this is a detail record linked to net cashflows
          fundName: fundName, // Use "Funds Rollup" field 
          amount: fields.Amount ? String(fields.Amount) : '0', // Available
          cashflowDate: new Date(record.createdTime), // Use creation time
          purpose: fields['Drawdown/Distribution type'] || null, // Use "Drawdown/Distribution type"
          investmentName: fields.Company || null, // Use "Company" field
          description: fields.Comment || null, // Use "Comment" field
          status: fields['Drawdown/Distribution'] || null, // Use "Drawdown/Distribution"
          createdAt: new Date(record.createdTime), // Use Airtable's creation time
        });
      }

      await storage.updateSyncStatus('detailed_net_cashflows', {
        tableName: 'detailed_net_cashflows',
        lastSync: new Date(),
        recordCount: records.length,
        status: 'ok',
        errorMessage: null,
      });

    } catch (error) {
      await storage.updateSyncStatus('detailed_net_cashflows', {
        tableName: 'detailed_net_cashflows',
        lastSync: new Date(),
        recordCount: 0,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Backward compatibility methods
  async syncCapitalCalls(tableId: string): Promise<void> {
    return this.syncNetCashflows(tableId);
  }
  
  async syncDetailedCapitalCalls(tableId: string): Promise<void> {
    return this.syncDetailedNetCashflows(tableId);
  }

  async syncLadderedBonds(tableId: string): Promise<void> {
    try {
      const records = await this.getAllRecords(tableId);
      
      
      // Clear existing records to implement full sync
      await storage.clearLadderedBonds();
      
      for (const record of records) {
        const fields = record.fields;
        
        
        await storage.upsertLadderedBondsByAirtableId(record.id, {
          airtableId: record.id,
          bondName: fields['name'] || '', // Use "name" field
          issuer: fields['Holdling ID'] || null, // Use "Holdling ID" as identifier
          faceValue: fields['Nominal'] ? String(fields['Nominal']) : null, // Use "Nominal" for face value
          maturityDate: fields['maturity'] ? new Date(fields['maturity']) : null, // Use "maturity"
          currency: fields['crncy'] || null, // Currency goes to currency field
          securityId: fields['isin'] || null, // ISIN goes to securityId field
          createdAt: new Date(record.createdTime), // Use Airtable's creation time
        });
      }

      await storage.updateSyncStatus('laddered_bonds', {
        tableName: 'laddered_bonds',
        lastSync: new Date(),
        recordCount: records.length,
        status: 'ok',
        errorMessage: null,
      });

    } catch (error) {
      await storage.updateSyncStatus('laddered_bonds', {
        tableName: 'laddered_bonds',
        lastSync: new Date(),
        recordCount: 0,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Live data fetching methods (no database storage)
  async getNetCashflowsLive(tableId: string) {
    const records = await this.getAllRecords(tableId);
    
    return records.map(record => {
      const fields = record.fields;
      const fundName = fields['dk_FundName'] && Array.isArray(fields['dk_FundName']) ? fields['dk_FundName'][0] : null;
      
      return {
        id: record.id,
        airtableId: record.id,
        fundId: '',
        fundName: fundName,
        name: fields.Name || null,
        amount: fields['Amount, USD'] ? String(fields['Amount, USD']) : '0',
        cashflowDate: fields['Due date'] ? new Date(fields['Due date']) : new Date(record.createdTime),
        status: fields.Status || null,
        inOut: fields['In-Out'] || null,
        currency: fields.Currency || null,
        year: fields.Year ? parseInt(String(fields.Year)) : null,
        createdAt: new Date(record.createdTime),
        updatedAt: new Date(record.createdTime),
      };
    });
  }

  async getFundInfoLive(tableId: string) {
    const records = await this.getAllRecords(tableId);
    
    return records.map(record => {
      const fields = record.fields;
      
      return {
        id: record.id,
        airtableId: record.id,
        name: fields.Name || fields['Fund Name'] || '',
        vintage: fields.Vintage ? parseInt(String(fields.Vintage)) : null,
        assetClass: fields['Asset Class'] || null,
        fundSize: fields['Fund size, $M'] ? String(fields['Fund size, $M']) : null,
        status: fields['open/closed'] || null,
        manager: fields.Manager || null,
        createdAt: new Date(record.createdTime),
        updatedAt: new Date(record.createdTime),
      };
    });
  }

  async getReportedMetricsLive(tableId: string) {
    const records = await this.getAllRecords(tableId);
    
    return records.map(record => {
      const fields = record.fields;
      const fundNameArray = fields['Fund name'] as string[] | undefined;
      const fundName = fields['Name'] || (fundNameArray && fundNameArray[0]) || null;
      const fundsArray = fields['Funds'] as string[] | undefined;
      const fundId: string | null = (fundsArray && fundsArray[0]) ? fundsArray[0] : null;

      return {
        id: record.id,
        airtableId: record.id,
        fundId: fundId,
        fundName: fundName,
        reportingPeriod: fields['Reporting Period'] || fields['Last update'] || null,
        nav: fields['NAV LP'] ? String(fields['NAV LP']) : null,
        irr: fields['Net IRR'] ? String(fields['Net IRR']) : null,
        grossIrr: fields['Gross IRR'] ? String(fields['Gross IRR']) : null,
        tvpi: fields['TVPI'] ? String(fields['TVPI']) : null,
        dpi: fields['DPI'] ? String(fields['DPI']) : null,
        rvpi: fields['RVPI'] ? String(fields['RVPI']) : null,
        grossMoic: fields['Gross MOIC'] ? String(fields['Gross MOIC']) : null,
        investedCapPercentage: fields['Invested Cap, % of CC'] ? String(fields['Invested Cap, % of CC']) : null,
        committedToInvestPercentage: fields['Committed to invest, % of CC'] ? String(fields['Committed to invest, % of CC']) : null,
        currentNetCalledCap: fields['Current Net CalledCap'] ? String(fields['Current Net CalledCap']) : null,
        noInvestments: fields['No Investments'] ? Number(fields['No Investments']) : null,
        currency: fields['Currency'] || null,
        notes: fields['Notes'] || null,
        createdAt: new Date(record.createdTime),
        updatedAt: new Date(record.createdTime),
      };
    });
  }

  async getLadderedBondsLive(tableId: string) {
    const records = await this.getAllRecords(tableId);
    
    return records.map(record => {
      const fields = record.fields;
      
      return {
        id: record.id,
        airtableId: record.id,
        bondName: fields['name'] || '',
        issuer: fields['Holdling ID'] || null,
        faceValue: fields['Nominal'] ? String(fields['Nominal']) : null,
        maturityDate: fields['maturity'] ? new Date(fields['maturity']) : null,
        currency: fields['crncy'] || null,
        securityId: fields['isin'] || null,
        createdAt: new Date(record.createdTime),
        updatedAt: new Date(record.createdTime),
      };
    });
  }

  async getDetailedNetCashflowsLive(tableId: string) {
    const records = await this.getAllRecords(tableId);
    
    return records.map(record => {
      const fields = record.fields;
      const fundsRollupArray = fields['Funds Rollup (from Net Cashflows)'] as string[] | undefined || 
                               fields['Funds Rollup (from Capital Calls)'] as string[] | undefined;
      const fundName = fundsRollupArray && fundsRollupArray[0] ? fundsRollupArray[0] : null;
      
      return {
        id: record.id,
        airtableId: record.id,
        netCashflowId: null,
        fundId: '',
        fundName: fundName,
        amount: fields.Amount ? String(fields.Amount) : '0',
        cashflowDate: new Date(record.createdTime),
        purpose: fields['Drawdown/Distribution type'] || null,
        investmentName: fields.Company || null,
        description: fields.Comment || null,
        status: fields['Drawdown/Distribution'] || null,
        createdAt: new Date(record.createdTime),
        updatedAt: new Date(record.createdTime),
      };
    });
  }
}
