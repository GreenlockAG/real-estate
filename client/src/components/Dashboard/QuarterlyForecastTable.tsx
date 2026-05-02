import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface QuarterlyForecast {
  fundName: string;
  q3_2025: number;
  q4_2025: number;
  q1_2026: number;
  q2_2026: number;
  q3_2026: number;
  total: number;
}

interface NetCashflow {
  id: string;
  fundName: string | null;
  cashflowDate: string;
  amount: string | null;
  name: string | null;
  status: string | null;
}

type SortField = 'fundName' | 'q3_2025' | 'q4_2025' | 'q1_2026' | 'q2_2026' | 'q3_2026' | 'total';
type SortDirection = 'asc' | 'desc';

export default function QuarterlyForecastTable() {
  const [sortField, setSortField] = useState<SortField | null>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data: forecasts, isLoading } = useQuery({
    queryKey: ["/api/quarterly-forecast"],
    queryFn: (): Promise<QuarterlyForecast[]> =>
      fetch("/api/quarterly-forecast").then(res => res.json()),
  });

  const { data: netCashflows } = useQuery({
    queryKey: ["/api/net-cashflows"],
    queryFn: (): Promise<NetCashflow[]> =>
      fetch("/api/net-cashflows").then(res => res.json()),
  });

  const formatAmount = (amount: number) => {
    const adjustedAmount = amount * -1; // Multiply by -1
    const millions = adjustedAmount / 1000000;
    return millions.toFixed(1); // Show in millions with one decimal place
  };

  const getQuarterCashflows = (fundName: string, quarterStart: Date, quarterEnd: Date) => {
    if (!netCashflows) return [];
    
    return netCashflows.filter(cf => {
      if (cf.fundName !== fundName) return false;
      if (cf.status === 'actual') return false; // Exclude actual cashflows, only show forecast
      const cashflowDate = new Date(cf.cashflowDate);
      return cashflowDate >= quarterStart && cashflowDate <= quarterEnd;
    });
  };

  const getQuarterBounds = (quarter: string) => {
    switch (quarter) {
      case 'q3_2025':
        return { start: new Date(2025, 6, 1), end: new Date(2025, 8, 30) }; // Q3: Jul-Sep
      case 'q4_2025':
        return { start: new Date(2025, 9, 1), end: new Date(2025, 11, 31) }; // Q4: Oct-Dec
      case 'q1_2026':
        return { start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) }; // Q1: Jan-Mar
      case 'q2_2026':
        return { start: new Date(2026, 3, 1), end: new Date(2026, 5, 30) }; // Q2: Apr-Jun
      case 'q3_2026':
        return { start: new Date(2026, 6, 1), end: new Date(2026, 8, 30) }; // Q3: Jul-Sep
      default:
        return { start: new Date(), end: new Date() };
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const getSortedForecasts = () => {
    if (!forecasts || !sortField) return forecasts || [];

    const sorted = [...forecasts].sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      if (sortField === 'fundName') {
        valueA = a.fundName.toLowerCase();
        valueB = b.fundName.toLowerCase();
      } else {
        valueA = a[sortField];
        valueB = b[sortField];
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        const numA = Number(valueA);
        const numB = Number(valueB);
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
    });

    return sorted;
  };

  const calculateTotals = () => {
    if (!forecasts) return { q3_2025: 0, q4_2025: 0, q1_2026: 0, q2_2026: 0, q3_2026: 0, total: 0 };
    
    return forecasts.reduce((totals, forecast) => ({
      q3_2025: totals.q3_2025 + forecast.q3_2025,
      q4_2025: totals.q4_2025 + forecast.q4_2025,
      q1_2026: totals.q1_2026 + forecast.q1_2026,
      q2_2026: totals.q2_2026 + forecast.q2_2026,
      q3_2026: totals.q3_2026 + forecast.q3_2026,
      total: totals.total + forecast.total,
    }), { q3_2025: 0, q4_2025: 0, q1_2026: 0, q2_2026: 0, q3_2026: 0, total: 0 });
  };

  if (isLoading) {
    return (
      <Card className="viz-block h-full w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-lg font-semibold">Quarterly Forecasted Contributions</CardTitle>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="viz-block h-full w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg font-semibold">Quarterly Forecasted Contributions</CardTitle>
        <div className="flex items-center text-muted-foreground">
          <TrendingUp className="h-5 w-5 mr-2" />
          <span className="text-sm">Q3 2025 - Q3 2026</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="quarterly-forecast-table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold text-foreground">
                  <button 
                    className="flex items-center space-x-1 hover:text-primary transition-colors"
                    onClick={() => handleSort('fundName')}
                    data-testid="sort-fund-name"
                  >
                    <span>Fund Name</span>
                    {getSortIcon('fundName')}
                  </button>
                </th>
                <th className="text-right p-3 font-semibold text-foreground">
                  <button 
                    className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                    onClick={() => handleSort('q3_2025')}
                    data-testid="sort-q3-2025"
                  >
                    <span>Q3 2025</span>
                    {getSortIcon('q3_2025')}
                  </button>
                </th>
                <th className="text-right p-3 font-semibold text-foreground">
                  <button 
                    className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                    onClick={() => handleSort('q4_2025')}
                    data-testid="sort-q4-2025"
                  >
                    <span>Q4 2025</span>
                    {getSortIcon('q4_2025')}
                  </button>
                </th>
                <th className="text-right p-3 font-semibold text-foreground">
                  <button 
                    className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                    onClick={() => handleSort('q1_2026')}
                    data-testid="sort-q1-2026"
                  >
                    <span>Q1 2026</span>
                    {getSortIcon('q1_2026')}
                  </button>
                </th>
                <th className="text-right p-3 font-semibold text-foreground">
                  <button 
                    className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                    onClick={() => handleSort('q2_2026')}
                    data-testid="sort-q2-2026"
                  >
                    <span>Q2 2026</span>
                    {getSortIcon('q2_2026')}
                  </button>
                </th>
                <th className="text-right p-3 font-semibold text-foreground">
                  <button 
                    className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                    onClick={() => handleSort('q3_2026')}
                    data-testid="sort-q3-2026"
                  >
                    <span>Q3 2026</span>
                    {getSortIcon('q3_2026')}
                  </button>
                </th>
                <th className="text-right p-3 font-semibold text-foreground bg-muted/50">
                  <button 
                    className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                    onClick={() => handleSort('total')}
                    data-testid="sort-total"
                  >
                    <span>Total</span>
                    {getSortIcon('total')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {forecasts && forecasts.length > 0 ? (
                <>
                  {getSortedForecasts().map((forecast, index) => (
                    <tr 
                      key={forecast.fundName} 
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      data-testid={`forecast-row-${index}`}
                    >
                      <td className="p-3 font-medium text-foreground" data-testid={`fund-name-${index}`}>
                        {forecast.fundName}
                      </td>
                      {(['q3_2025', 'q4_2025', 'q1_2026', 'q2_2026', 'q3_2026'] as const).map((quarter) => {
                        const amount = forecast[quarter];
                        const { start, end } = getQuarterBounds(quarter);
                        const quarterCashflows = getQuarterCashflows(forecast.fundName, start, end);
                        
                        return (
                          <td key={quarter} className="p-3 text-right text-foreground" data-testid={`${quarter.replace('_', '-')}-${index}`}>
                            {amount > 0 ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted">
                                      {formatAmount(amount)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-3">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-sm">
                                        {forecast.fundName} - {quarter.replace('_', ' ').toUpperCase()}
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        {quarterCashflows.length > 0 ? (
                                          quarterCashflows.map((cf, cfIndex) => (
                                            <div key={cfIndex} className="flex justify-between">
                                              <span className="truncate mr-2">{cf.name || 'Unnamed'}</span>
                                              <span className="font-medium">
                                                {((parseFloat(cf.amount || '0') * -1) / 1000000).toFixed(1)}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-muted-foreground">No detailed cashflows found</div>
                                        )}
                                      </div>
                                      <div className="border-t pt-1 flex justify-between font-semibold">
                                        <span>Total:</span>
                                        <span>{formatAmount(amount)}</span>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : '-'}
                          </td>
                        );
                      })}
                      <td className="p-3 text-right font-semibold text-primary bg-muted/50" data-testid={`total-${index}`}>
                        {formatAmount(forecast.total)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="border-t-2 border-border bg-accent/20 font-semibold">
                    <td className="p-3 font-bold text-foreground" data-testid="total-row-label">
                      Total
                    </td>
                    {(() => {
                      const totals = calculateTotals();
                      return (
                        <>
                          <td className="p-3 text-right text-foreground" data-testid="total-q3-2025">
                            {totals.q3_2025 > 0 ? formatAmount(totals.q3_2025) : '-'}
                          </td>
                          <td className="p-3 text-right text-foreground" data-testid="total-q4-2025">
                            {totals.q4_2025 > 0 ? formatAmount(totals.q4_2025) : '-'}
                          </td>
                          <td className="p-3 text-right text-foreground" data-testid="total-q1-2026">
                            {totals.q1_2026 > 0 ? formatAmount(totals.q1_2026) : '-'}
                          </td>
                          <td className="p-3 text-right text-foreground" data-testid="total-q2-2026">
                            {totals.q2_2026 > 0 ? formatAmount(totals.q2_2026) : '-'}
                          </td>
                          <td className="p-3 text-right text-foreground" data-testid="total-q3-2026">
                            {totals.q3_2026 > 0 ? formatAmount(totals.q3_2026) : '-'}
                          </td>
                          <td className="p-3 text-right font-semibold text-primary bg-muted/50" data-testid="total-grand-total">
                            {formatAmount(totals.total)}
                          </td>
                        </>
                      );
                    })()}
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No forecasted contributions found for the specified quarters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {forecasts && forecasts.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground border-t pt-4">
            <p>• Shows only funds with non-zero forecasted contributions</p>
            <p>• Data source: Net Cashflows table (Contributions only, excludes actual cashflows)</p>
            <p>• Includes only forecasted status cashflows, not historical actuals</p>
            <p>• Sorted by total contribution amount (highest first)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}