
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Download, Loader2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type SortField = 'name' | 'tvpi' | 'dpi' | 'rvpi' | 'irr' | 'status' | 'reportingPeriod' | 'investedCapPercentage' | 'committedToInvestPercentage';
type SortDirection = 'asc' | 'desc';

export default function PerformanceTable() {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedFunds, setExpandedFunds] = useState<Record<string, boolean>>({});

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["/api/metrics/performance"],
    queryFn: api.getFundPerformance,
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

  const toggleFundExpansion = (fundName: string) => {
    setExpandedFunds(prev => ({
      ...prev,
      [fundName]: !prev[fundName]
    }));
  };

  const hasValidData = (fund: any) => {
    // Check if the fund has meaningful data (not null/undefined/0 for key metrics)
    return (fund.tvpi && fund.tvpi > 0) || 
           (fund.dpi && fund.dpi > 0) || 
           (fund.rvpi && fund.rvpi > 0) || 
           (fund.irr && fund.irr !== 0);
  };

  const getGroupedData = () => {
    if (!performanceData) return {};

    const filtered = performanceData.filter(fund => fund.hasReportedMetrics);
    
    // Group by fund name
    const grouped = filtered.reduce((acc, fund) => {
      if (!acc[fund.name]) {
        acc[fund.name] = [];
      }
      acc[fund.name].push(fund);
      return acc;
    }, {} as Record<string, typeof filtered>);

    // Sort each group by reporting period (most recent first)
    Object.keys(grouped).forEach(fundName => {
      grouped[fundName].sort((a, b) => {
        const periodA = a.reportingPeriod || '';
        const periodB = b.reportingPeriod || '';
        return periodB.localeCompare(periodA); // Descending order
      });
    });

    return grouped;
  };

  const getStatusVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'active') return 'default';
    if (normalizedStatus === 'harvesting') return 'secondary';
    if (normalizedStatus === 'closed') return 'outline';
    return 'outline';
  };

  const getReportingPeriodColor = (period: string | null | undefined, allPeriods: string[]) => {
    if (!period) return '#64748b'; // Default gray
    
    // Sort all periods to determine recency
    const uniquePeriods = allPeriods.filter((period, index, array) => array.indexOf(period) === index);
    const sortedPeriods = uniquePeriods.sort((a, b) => b.localeCompare(a));
    const periodIndex = sortedPeriods.indexOf(period);
    const totalPeriods = sortedPeriods.length;
    
    // Create blue gradient from dark to light
    // Most recent (index 0) = dark blue, oldest = light blue
    const intensity = 1 - (periodIndex / Math.max(totalPeriods - 1, 1));
    const blueValue = Math.round(59 + (139 * intensity)); // Range from 59 to 198
    return `rgb(37, 99, ${blueValue})`;
  };

  const formatRatio = (value: number | null | undefined) => {
    if (!value || isNaN(value)) return '-';
    return value.toFixed(2) + 'x';
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (!value || isNaN(value)) return '-';
    return value.toFixed(1) + '%';
  };

  const isRecordNew = (updatedAt: Date | null | undefined) => {
    if (!updatedAt) return false;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    return new Date(updatedAt) > fourteenDaysAgo;
  };

  const groupedData = getGroupedData();
  const fundNames = Object.keys(groupedData).sort();

  return (
    <Card className="viz-block h-full w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg font-semibold">Fund Performance Ratios</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading performance data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-fund-performance">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold text-foreground">
                    Fund Name
                  </th>
                  <th className="text-center p-3 font-semibold text-foreground">
                    Reporting Period
                  </th>
                  <th className="text-center p-3 font-semibold text-foreground">
                    TVPI
                  </th>
                  <th className="text-center p-3 font-semibold text-foreground">
                    DPI
                  </th>
                  <th className="text-center p-3 font-semibold text-foreground">
                    RVPI
                  </th>
                  <th className="text-center p-3 font-semibold text-foreground">
                    IRR
                  </th>
                  <th className="text-center p-3 font-semibold text-foreground">
                    Invested Cap %
                  </th>
                  <th className="text-center p-3 font-semibold text-foreground">
                    Committed to Invest %
                  </th>
                  <th className="text-center p-3 font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {fundNames.length > 0 ? (
                  fundNames.map((fundName) => {
                    const fundRecords = groupedData[fundName];
                    const isExpanded = expandedFunds[fundName] || false;
                    const hasMultipleRecords = fundRecords.length > 1;
                    
                    // Find the latest period with valid data when collapsed
                    const latestWithData = fundRecords.find(fund => hasValidData(fund)) || fundRecords[0];
                    const recordsToShow = isExpanded ? fundRecords : [latestWithData];
                    
                    // Get all periods for this fund for color calculation
                    const allPeriods = fundRecords.map(f => f.reportingPeriod).filter(Boolean) as string[];
                    
                    return recordsToShow.map((fund, index) => (
                      <tr 
                        key={fund.id} 
                        className={`table-row border-b border-border hover:bg-muted/50 transition-colors ${
                          index === 0 ? 'border-t-2 border-t-primary/20' : 'bg-muted/20'
                        }`}
                      >
                        <td className="p-3 font-medium text-foreground" data-testid={`fund-name-${fund.id}`}>
                          {index === 0 ? (
                            <div className="flex items-center gap-2">
                              {hasMultipleRecords && (
                                <button
                                  onClick={() => toggleFundExpansion(fundName)}
                                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-muted transition-colors"
                                  data-testid={`toggle-fund-${fund.id}`}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                              <span className="font-medium">{fund.name}</span>
                            </div>
                          ) : (
                            <div className="pl-7 text-muted-foreground text-sm">
                              Historical data
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span 
                            className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getReportingPeriodColor(fund.reportingPeriod, allPeriods) }}
                            data-testid={`fund-period-${fund.id}`}
                          >
                            {fund.reportingPeriod || '-'}
                          </span>
                        </td>
                        <td className="p-3 text-center text-foreground" data-testid={`fund-tvpi-${fund.id}`}>
                          {formatRatio(fund.tvpi)}
                        </td>
                        <td className="p-3 text-center text-foreground" data-testid={`fund-dpi-${fund.id}`}>
                          {formatRatio(fund.dpi)}
                        </td>
                        <td className="p-3 text-center text-foreground" data-testid={`fund-rvpi-${fund.id}`}>
                          {formatRatio(fund.rvpi)}
                        </td>
                        <td className="p-3 text-center text-foreground" data-testid={`fund-irr-${fund.id}`}>
                          {formatPercentage(fund.irr)}
                        </td>
                        <td className="p-3 text-center text-foreground" data-testid={`fund-invested-cap-${fund.id}`}>
                          {formatPercentage(fund.investedCapPercentage)}
                        </td>
                        <td className="p-3 text-center text-foreground" data-testid={`fund-committed-invest-${fund.id}`}>
                          {formatPercentage(fund.committedToInvestPercentage)}
                        </td>
                        <td className="p-3 text-center" data-testid={`fund-status-${fund.id}`}>
                          {isRecordNew(fund.updatedAt) && (
                            <span className="inline-block px-2 py-1 rounded text-xs font-normal text-black bg-yellow-100">
                              new
                            </span>
                          )}
                        </td>
                      </tr>
                    ));
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No fund performance data available from reported metrics. Sync with Airtable to populate data.
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
