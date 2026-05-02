import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Download, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useState, useMemo } from "react";

interface FundNetCashflowsData {
  years: number[];
  funds: Array<{
    fundName: string;
    data: Record<number, number>;
    total: number;
  }>;
  totals: Record<number, number>;
  grandTotal: number;
}

interface NetCashflow {
  id: string;
  fundId: string;
  fundName: string;
  name: string;
  amount: number;
  cashflowDate: string;
}

type SortField = 'fundName' | number;
type SortDirection = 'asc' | 'desc';

export default function FundNetCashflowsTable() {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [fundNameColWidth, setFundNameColWidth] = useState(192); // Default width in pixels
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed to show totals only

  const { data: fundCashflowsData, isLoading, error } = useQuery({
    queryKey: ["/api/metrics/fund-net-cashflows-by-year"],
    queryFn: (): Promise<FundNetCashflowsData> =>
      fetch("/api/metrics/fund-net-cashflows-by-year").then(res => res.json()),
  });

  const { data: netCashflows } = useQuery({
    queryKey: ["/api/net-cashflows"],
    queryFn: (): Promise<NetCashflow[]> =>
      fetch("/api/net-cashflows").then(res => res.json()),
  });

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

  const getSortedData = () => {
    if (!fundCashflowsData || !sortField) return fundCashflowsData?.funds || [];

    const sorted = [...fundCashflowsData.funds].sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      if (sortField === 'fundName') {
        valueA = a.fundName;
        valueB = b.fundName;
      } else {
        valueA = a.data[sortField as number] || 0;
        valueB = b.data[sortField as number] || 0;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      const numA = typeof valueA === 'number' ? valueA : 0;
      const numB = typeof valueB === 'number' ? valueB : 0;

      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  };

  const formatAmount = (amount: number) => {
    if (amount === 0) return '-';
    // Multiply by -1 and format to 1 decimal place
    return `${(amount * -1).toFixed(1)}`;
  };

  // Calculate cashflow breakdown for tooltip
  const getCashflowBreakdown = useMemo(() => {
    if (!netCashflows) return {};
    
    const breakdown: Record<string, Record<number, { positive: number; negative: number; net: number; transactions: NetCashflow[] }>> = {};
    
    netCashflows.forEach(cf => {
      const year = new Date(cf.cashflowDate).getFullYear();
      const fundName = cf.fundName;
      
      if (!breakdown[fundName]) {
        breakdown[fundName] = {};
      }
      if (!breakdown[fundName][year]) {
        breakdown[fundName][year] = { positive: 0, negative: 0, net: 0, transactions: [] };
      }
      
      const amount = (Number(cf.amount) || 0) * -1; // Multiply by -1 to match display format
      breakdown[fundName][year].transactions.push(cf);
      breakdown[fundName][year].net += amount;
      
      if (amount > 0) {
        breakdown[fundName][year].positive += amount;
      } else {
        breakdown[fundName][year].negative += amount;
      }
    });
    
    return breakdown;
  }, [netCashflows]);

  const formatTooltipAmount = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const handleResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = fundNameColWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(120, Math.min(400, startWidth + diff)); // Min 120px, Max 400px
      setFundNameColWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const sortedData = getSortedData();

  return (
    <Card className="viz-block h-full w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-4">
          <CardTitle className="text-lg font-semibold">
            Fund Net Cashflows by Year (Amount USD in M)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2"
            data-testid="toggle-collapse-button"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All Funds
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Totals Only
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading fund net cashflows data...</span>
          </div>
        ) : (error || !fundCashflowsData || !fundCashflowsData.funds) ? (
          <div className="text-center text-muted-foreground py-8">
            Failed to load fund net cashflows data
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-fund-net-cashflows">
              <thead className="bg-muted">
                <tr>
                  <th
                    className="text-left p-2 font-semibold text-foreground sticky left-0 bg-muted z-10 relative"
                    style={{ width: `${fundNameColWidth}px` }}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        className="flex items-center space-x-1 hover:text-primary transition-colors"
                        onClick={() => handleSort('fundName')}
                        data-testid="sort-fund-name"
                      >
                        <span>Fund Name</span>
                        {getSortIcon('fundName')}
                      </button>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-border hover:bg-primary transition-colors"
                        onMouseDown={handleResize}
                      />
                    </div>
                  </th>
                  {fundCashflowsData.years.map((year) => (
                    <th key={year} className="text-center p-2 font-semibold text-foreground min-w-20">
                      <button
                        className="flex items-center space-x-1 hover:text-primary transition-colors mx-auto"
                        onClick={() => handleSort(year)}
                        data-testid={`sort-year-${year}`}
                      >
                        <span>{year}</span>
                        {getSortIcon(year)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.length > 0 ? (
                  <>
                    {!isCollapsed && sortedData.map((fund, index) => (
                      <tr key={`${fund.fundName}-${index}`} className={`table-row border-b border-border hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td
                          className={`p-2 font-medium text-foreground sticky left-0 z-10 truncate ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          title={fund.fundName}
                          data-testid={`fund-name-${index}`}
                          style={{ width: `${fundNameColWidth}px` }}
                        >
                          {fund.fundName}
                        </td>
                        {fundCashflowsData.years.map((year) => {
                          const breakdown = getCashflowBreakdown[fund.fundName]?.[year];
                          const hasDetailedData = breakdown && breakdown.transactions.length > 0;
                          
                          return (
                            <td key={year} className={`p-2 text-center text-foreground whitespace-nowrap ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                data-testid={`fund-${index}-year-${year}`}>
                              {hasDetailedData ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help underline decoration-dotted decoration-muted-foreground hover:decoration-primary transition-colors">
                                        {formatAmount(fund.data[year] || 0)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs p-3">
                                      <div className="space-y-2">
                                        <div className="font-semibold text-sm">
                                          {fund.fundName} - {year}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-green-600">Positive Flows:</span>
                                            <span className="font-medium">{formatTooltipAmount(breakdown.positive)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-red-600">Negative Flows:</span>
                                            <span className="font-medium">{formatTooltipAmount(breakdown.negative)}</span>
                                          </div>
                                          <div className="border-t pt-1 flex justify-between">
                                            <span className="font-medium">Net Cashflow:</span>
                                            <span className="font-semibold">{formatTooltipAmount(breakdown.net)}</span>
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-2">
                                            {breakdown.transactions.length} transaction{breakdown.transactions.length !== 1 ? 's' : ''}
                                          </div>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span>{formatAmount(fund.data[year] || 0)}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className={`${!isCollapsed ? 'border-t-2' : ''} border-border font-semibold ${isCollapsed ? 'bg-accent/10' : sortedData.length % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td
                        className="p-2 font-bold text-foreground sticky left-0 bg-accent/20 z-10"
                        data-testid="total-row-label"
                        style={{ width: `${fundNameColWidth}px` }}
                      >
                        Total
                      </td>
                      {fundCashflowsData.years.map((year) => {
                        // Calculate total breakdown for the year across all funds
                        const yearTotalBreakdown = Object.values(getCashflowBreakdown).reduce<{ positive: number; negative: number; net: number; transactions: number }>((acc, fundData) => {
                          const yearData = fundData[year];
                          if (yearData) {
                            acc.positive += yearData.positive;
                            acc.negative += yearData.negative;
                            acc.net += yearData.net;
                            acc.transactions += yearData.transactions.length;
                          }
                          return acc;
                        }, { positive: 0, negative: 0, net: 0, transactions: 0 });
                        
                        const hasDetailedData = yearTotalBreakdown.transactions > 0;
                        
                        return (
                          <td key={year} className={`p-2 text-center font-semibold text-foreground whitespace-nowrap ${sortedData.length % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                              data-testid={`total-year-${year}`}>
                            {hasDetailedData ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted decoration-muted-foreground hover:decoration-primary transition-colors">
                                      {formatAmount(fundCashflowsData.totals && fundCashflowsData.totals[year] ? fundCashflowsData.totals[year] : 0)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-3">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-sm">
                                        All Funds Total - {year}
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-green-600">Total Positive:</span>
                                          <span className="font-medium">{formatTooltipAmount(yearTotalBreakdown.positive)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-red-600">Total Negative:</span>
                                          <span className="font-medium">{formatTooltipAmount(yearTotalBreakdown.negative)}</span>
                                        </div>
                                        <div className="border-t pt-1 flex justify-between">
                                          <span className="font-medium">Net Total:</span>
                                          <span className="font-semibold">{formatTooltipAmount(yearTotalBreakdown.net)}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2">
                                          {yearTotalBreakdown.transactions} total transaction{yearTotalBreakdown.transactions !== 1 ? 's' : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span>{formatAmount(fundCashflowsData.totals && fundCashflowsData.totals[year] ? fundCashflowsData.totals[year] : 0)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={fundCashflowsData.years.length + 1}
                        className="p-8 text-center text-muted-foreground">
                      No fund net cashflows data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}