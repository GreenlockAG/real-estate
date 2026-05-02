import { storage } from "../storage";
import { PortfolioMetrics, FundPerformance, CumulativeNetCashflow } from "@shared/schema";

export class MetricsService {
  
  async getPortfolioMetrics(): Promise<PortfolioMetrics> {
    // Calculate actual total paid-in from net cashflows
    const netCashflows = await storage.getNetCashflows();
    
    // Sum amounts where inOut = 'Contribution' and status = 'actual' (lowercase)
    const totalPaidInSum = netCashflows
      .filter(cashflow => 
        cashflow.inOut === 'Contribution' && 
        cashflow.status === 'actual'
      )
      .reduce((sum, cashflow) => sum + parseFloat(cashflow.amount || '0'), 0);
    
    // Convert to millions with 1 decimal place
    const totalPaidIn = Math.round((totalPaidInSum / 1000000) * 10) / 10;
    
    // Calculate quarterly change for total paid-in
    const totalPaidInChange = await this.calculateQuarterlyChange(netCashflows);
    
    // Calculate total distributions from net cashflows
    const totalDistributionsSum = netCashflows
      .filter(cashflow => 
        cashflow.inOut === 'Distribution' && 
        cashflow.status === 'actual'
      )
      .reduce((sum, cashflow) => sum + parseFloat(cashflow.amount || '0'), 0);
    
    // Convert to millions with 1 decimal place (take absolute value since distributions are negative)
    const totalDistributions = Math.round((Math.abs(totalDistributionsSum) / 1000000) * 10) / 10;
    
    // Return metrics with real totalPaidIn and totalDistributions, others remain placeholder
    return {
      totalCommitted: 0,
      totalPaidIn,
      totalNav: 0,
      tvpi: 0,
      dpi: 0,
      rvpi: 0,
      activeInvestments: 0,
      totalPaidInChange, // Add quarterly change
      totalDistributions, // Add total distributions
    };
  }

  private async calculateQuarterlyChange(netCashflows: any[]): Promise<string> {
    const actualContributions = netCashflows.filter(cashflow => 
      cashflow.inOut === 'Contribution' && 
      cashflow.status === 'actual'
    );

    // Group by quarter
    const quarterlyData = new Map<string, number>();
    
    actualContributions.forEach(cashflow => {
      const date = new Date(cashflow.cashflowDate);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const quarterKey = `${year}-Q${quarter}`;
      
      const amount = parseFloat(cashflow.amount || '0');
      quarterlyData.set(quarterKey, (quarterlyData.get(quarterKey) || 0) + amount);
    });

    // Get the two most recent quarters with data
    const quarters = Array.from(quarterlyData.entries())
      .sort((a, b) => b[0].localeCompare(a[0])) // Sort by quarter desc
      .slice(0, 2);

    if (quarters.length < 2) {
      return "+0.0%"; // Not enough data for comparison
    }

    const currentQuarter = quarters[0][1];
    const previousQuarter = quarters[1][1];
    
    if (previousQuarter === 0) {
      return "+100.0%"; // Avoid division by zero
    }

    const percentChange = ((currentQuarter - previousQuarter) / previousQuarter) * 100;
    const sign = percentChange >= 0 ? '+' : '';
    
    return `${sign}${percentChange.toFixed(1)}%`;
  }

  async getFundPerformance(): Promise<FundPerformance[]> {
    const funds = await storage.getFunds();
    const reportedMetrics = await storage.getReportedMetrics();

    const results: FundPerformance[] = [];

    // Add all historical reported metrics as separate entries
    for (const metrics of reportedMetrics) {
      // Find the corresponding fund info
      const fund = funds.find(f => 
        f.airtableId === metrics.fundId || f.name === metrics.fundName
      );

      if (fund) {
        results.push({
          id: `${fund.id}-${metrics.id}`, // Unique ID combining fund and metrics
          name: fund.name,
          tvpi: parseFloat(metrics.tvpi || '0'),
          dpi: parseFloat(metrics.dpi || '0'),
          rvpi: parseFloat(metrics.rvpi || '0'),
          irr: parseFloat(metrics.irr || '0') * 100, // Convert to percentage
          status: fund.status || 'Active',
          reportingPeriod: metrics.reportingPeriod,
          investedCapPercentage: parseFloat(metrics.investedCapPercentage || '0') * 100,
          committedToInvestPercentage: parseFloat(metrics.committedToInvestPercentage || '0') * 100,
          hasReportedMetrics: true,
          updatedAt: metrics.createdAt,
        });
      }
    }

    // Add funds without reported metrics with placeholder values
    const fundsWithReportedMetrics = new Set(
      reportedMetrics
        .map(m => funds.find(f => f.airtableId === m.fundId || f.name === m.fundName))
        .filter(Boolean)
        .map(f => f!.id)
    );

    for (const fund of funds) {
      if (!fundsWithReportedMetrics.has(fund.id)) {
        // Placeholder values for funds without reported metrics
        results.push({
          id: fund.id,
          name: fund.name,
          tvpi: 0,
          dpi: 0,
          rvpi: 0,
          irr: 0,
          status: fund.status || 'Active',
          reportingPeriod: null,
          investedCapPercentage: null,
          committedToInvestPercentage: null,
          hasReportedMetrics: false,
          updatedAt: null,
        });
      }
    }

    // Sort by fund name and then by reporting period for better organization
    return results.sort((a, b) => {
      if (a.name !== b.name) {
        return a.name.localeCompare(b.name);
      }
      // Sort by reporting period (most recent first within each fund)
      if (a.reportingPeriod && b.reportingPeriod) {
        return b.reportingPeriod.localeCompare(a.reportingPeriod);
      }
      return a.reportingPeriod ? -1 : 1;
    });
  }

  async getNetCashflowsTimeSeries(): Promise<Array<{ date: string; amount: number }>> {
    // Placeholder - returns empty array since this endpoint is now a placeholder
    return [];
  }

  // Backward compatibility method
  async getCapitalCallsTimeSeries(): Promise<Array<{ date: string; amount: number }>> {
    return this.getNetCashflowsTimeSeries();
  }

  async getDistributionsTimeSeries(): Promise<Array<{ date: string; amount: number }>> {
    // Placeholder - returns empty array since this endpoint is now a placeholder
    return [];
  }

  async getNavBreakdown(): Promise<Array<{ name: string; value: number }>> {
    // Placeholder - returns empty array since this endpoint is now a placeholder
    return [];
  }

  /**
   * Amount USD in M - Total net cashflows in millions USD
   * Formula: (sum(net_cashflows.amount) * -1) / 1000000
   * 
   * Multiply by -1 to convert outflows to positive amounts.
   * Format to 1 decimal place.
   */
  async getAmountUsdInM(): Promise<number> {
    const netCashflows = await storage.getNetCashflows();
    
    const totalAmount = netCashflows.reduce((sum, cashflow) => 
      sum + parseFloat(cashflow.amount || '0'), 0
    );

    // Multiply by -1 and convert to millions
    const amountInMillions = (totalAmount * -1) / 1000000;
    
    // Round to 1 decimal place
    return Math.round(amountInMillions * 10) / 10;
  }

  /**
   * Cumulative Net Cashflow - Rolling sum of net cashflows over time
   * Returns timeline data with individual amounts and cumulative totals in millions USD
   */
  async getCumulativeNetCashflow(): Promise<CumulativeNetCashflow> {
    const netCashflows = await storage.getNetCashflows();
    
    // Sort cashflows by date (ascending order)
    const sortedCashflows = netCashflows.sort((a, b) => 
      a.cashflowDate.getTime() - b.cashflowDate.getTime()
    );
    
    let runningTotal = 0;
    const timeline = sortedCashflows.map(cashflow => {
      const amount = parseFloat(cashflow.amount || '0');
      // Convert to millions USD and round to 1 decimal place
      const amountInM = Math.round((amount / 1000000) * 10) / 10;
      
      runningTotal += amountInM;
      const cumulative = Math.round((runningTotal * -1) * 10) / 10;
      
      return {
        date: cashflow.cashflowDate.toISOString(),
        amount: amountInM,
        cumulative: cumulative
      };
    });
    
    const totalCumulative = runningTotal * -1;
    
    return {
      timeline,
      totalCumulative: Math.round(totalCumulative * 10) / 10
    };
  }

  /**
   * Cumulative Net Cashflows by Fund - Rolling sum of net cashflows per fund over time
   * Returns timeline data for each fund with cumulative totals in millions USD
   */
  async getCumulativeNetCashflowsByFund(): Promise<{
    funds: Array<{
      fundName: string;
      timeline: Array<{
        date: string;
        amount: number;
        cumulative: number;
      }>;
    }>;
  }> {
    const netCashflows = await storage.getNetCashflows();
    
    // Filter only cashflows with fund names
    const cashflowsWithFunds = netCashflows.filter(cashflow => cashflow.fundName);
    
    // Group by fund
    const fundMap = new Map<string, typeof cashflowsWithFunds>();
    
    for (const cashflow of cashflowsWithFunds) {
      const fundName = cashflow.fundName!;
      if (!fundMap.has(fundName)) {
        fundMap.set(fundName, []);
      }
      fundMap.get(fundName)!.push(cashflow);
    }
    
    // Calculate cumulative for each fund
    const funds = Array.from(fundMap.entries()).map(([fundName, cashflows]) => {
      // Sort cashflows by date for this fund
      const sortedCashflows = cashflows.sort((a, b) => 
        a.cashflowDate.getTime() - b.cashflowDate.getTime()
      );
      
      let runningTotal = 0;
      const timeline = sortedCashflows.map(cashflow => {
        const amount = parseFloat(cashflow.amount || '0');
        // Convert to millions USD and round to 1 decimal place
        const amountInM = Math.round((amount / 1000000) * 10) / 10;
        
        runningTotal += amountInM;
        const cumulative = Math.round((runningTotal * -1) * 10) / 10;
        
        return {
          date: cashflow.cashflowDate.toISOString(),
          amount: amountInM,
          cumulative: cumulative
        };
      });
      
      return {
        fundName,
        timeline
      };
    });
    
    return { funds };
  }

  /**
   * Fund Net Cashflows by Year - Matrix of funds and their net cashflows by year
   * Returns data structured for table display: funds with net cashflows only
   * Values are "Amount USD in M" per fund per year
   * Uses only net_cashflows table as it contains net cashflows
   */
  async getFundNetCashflowsByYear(): Promise<{
    years: number[];
    funds: Array<{
      fundName: string;
      data: Record<number, number>;
      total: number;
    }>;
    totals: Record<number, number>;
    grandTotal: number;
  }> {
    const netCashflows = await storage.getNetCashflows();
    
    // Filter only net cashflows with fund names (funds that have net cashflows)
    const cashflowsWithFunds = netCashflows.filter(cashflow => cashflow.fundName);
    
    // Get all years from net cashflows
    const cashflowYears = cashflowsWithFunds.map(cashflow => cashflow.cashflowDate.getFullYear());
    
    // Group by fund and year
    const fundYearMap = new Map<string, Map<number, number>>();
    const allYears = new Set<number>();
    
    for (const cashflow of cashflowsWithFunds) {
      const fundName = cashflow.fundName!;
      const year = cashflow.cashflowDate.getFullYear();
      const amount = parseFloat(cashflow.amount || '0');
      
      allYears.add(year);
      
      if (!fundYearMap.has(fundName)) {
        fundYearMap.set(fundName, new Map());
      }
      
      const fundData = fundYearMap.get(fundName)!;
      const currentAmount = fundData.get(year) || 0;
      fundData.set(year, currentAmount + amount);
    }
    
    // Sort years
    const sortedYears = Array.from(allYears).sort();
    
    // Calculate column totals
    const totals: Record<number, number> = {};
    let grandTotal = 0;
    
    // Build fund data with totals
    const funds = Array.from(fundYearMap.entries()).map(([fundName, yearData]) => {
      const data: Record<number, number> = {};
      let total = 0;
      
      for (const year of sortedYears) {
        const amount = yearData.get(year) || 0;
        // Convert to millions USD and round to 1 decimal place
        const amountInM = Math.round((amount / 1000000) * 10) / 10;
        data[year] = amountInM;
        total += amountInM;
        
        // Add to column totals
        totals[year] = (totals[year] || 0) + amountInM;
      }
      
      const fundTotal = Math.round(total * 10) / 10;
      grandTotal += fundTotal;
      
      return {
        fundName,
        data,
        total: fundTotal
      };
    }).sort((a, b) => a.fundName.localeCompare(b.fundName));
    
    // Round column totals to 1 decimal place
    for (const year of sortedYears) {
      totals[year] = Math.round((totals[year] || 0) * 10) / 10;
    }
    
    return {
      years: sortedYears,
      funds,
      totals,
      grandTotal: Math.round(grandTotal * 10) / 10
    };
  }

  // Backward compatibility method
  async getFundCapitalCallsByYear(): Promise<{
    years: number[];
    funds: Array<{
      fundName: string;
      data: Record<number, number>;
      total: number;
    }>;
    totals: Record<number, number>;
    grandTotal: number;
  }> {
    return this.getFundNetCashflowsByYear();
  }
}