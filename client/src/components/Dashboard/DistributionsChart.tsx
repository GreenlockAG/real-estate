import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Maximize2 } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";

interface CumulativeDataByFund {
  funds: Array<{
    fundName: string;
    timeline: Array<{
      date: string;
      amount: number;
      cumulative: number;
    }>;
  }>;
}

export default function DistributionsChart() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [highlightedFund, setHighlightedFund] = useState<string | null>(null);
  const [highlightedFunds, setHighlightedFunds] = useState<Set<string>>(new Set());
  const [isRelativeView, setIsRelativeView] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: fundData, isLoading: fundLoading } = useQuery({
    queryKey: ["/api/metrics/cumulative-net-cashflows-by-fund"],
    queryFn: (): Promise<CumulativeDataByFund> =>
      fetch("/api/metrics/cumulative-net-cashflows-by-fund").then(res => res.json()),
  });

  const { chartData, fundNames } = useMemo(() => {
    if (!fundData || !fundData.funds.length) return { chartData: [], fundNames: [] };

    // Process each fund's timeline and consolidate by year
    const processedFunds = fundData.funds.map(fund => {
      // Group timeline points by year and take the last cumulative value for each year
      const yearlyData = new Map<number, number>();

      fund.timeline.forEach(point => {
        const year = new Date(point.date).getFullYear();
        // Always use the latest cumulative value for each year (overwrite if multiple entries)
        yearlyData.set(year, point.cumulative);
      });

      // Convert to array and sort by year
      let yearlyTimeline = Array.from(yearlyData.entries())
        .map(([year, cumulative]) => ({ year, cumulative }))
        .sort((a, b) => a.year - b.year);

      // Remove leading zeros (treat as N/A)
      const firstNonZeroIndex = yearlyTimeline.findIndex(point => point.cumulative !== 0);
      if (firstNonZeroIndex > 0) {
        yearlyTimeline = yearlyTimeline.slice(firstNonZeroIndex);
      }

      // Remove trailing constant values (fund closed)
      if (yearlyTimeline.length > 1) {
        const lastValue = yearlyTimeline[yearlyTimeline.length - 1].cumulative;
        let lastUniqueIndex = yearlyTimeline.length - 1;

        // Find the last point where value changed
        for (let i = yearlyTimeline.length - 2; i >= 0; i--) {
          if (yearlyTimeline[i].cumulative !== lastValue) {
            lastUniqueIndex = i + 1; // Keep one constant value after the change
            break;
          }
        }

        yearlyTimeline = yearlyTimeline.slice(0, lastUniqueIndex + 1);
      }

      return {
        ...fund,
        yearlyTimeline
      };
    });

    let chartData;

    if (isRelativeView) {
      // RELATIVE VIEW: Convert to Y0, Y1, Y2, etc. based on each fund's start year
      const maxRelativeYear = Math.max(...processedFunds.map(fund => fund.yearlyTimeline.length));

      chartData = Array.from({ length: maxRelativeYear + 1 }, (_, index) => {
        const relativeYear = index;
        const dataPoint: any = { year: `Y${relativeYear}` };

        processedFunds.forEach(fund => {
          if (relativeYear === 0) {
            // Y0: All funds start at zero
            dataPoint[fund.fundName] = 0;
          } else if (fund.yearlyTimeline[index - 1]) {
            // Y1, Y2, etc.: Use actual data (index - 1 because we added Y0)
            dataPoint[fund.fundName] = fund.yearlyTimeline[index - 1].cumulative;
          }
          // If fund doesn't have data for this relative year, leave undefined
        });

        return dataPoint;
      });
    } else {
      // ABSOLUTE VIEW: Use actual calendar years
      const allYears = new Set<number>();
      processedFunds.forEach(fund => {
        fund.yearlyTimeline.forEach(point => {
          allYears.add(point.year);
        });
      });

      // Sort years chronologically
      const sortedYears = Array.from(allYears).sort((a, b) => a - b);

      // Create data points for each year with cumulative values for each fund
      chartData = sortedYears.map(year => {
        const dataPoint: any = { year };

        processedFunds.forEach(fund => {
          // Find the cumulative value for this fund in this year
          const point = fund.yearlyTimeline.find(p => p.year === year);
          if (point) {
            dataPoint[fund.fundName] = point.cumulative;
          } else {
            // Check if this year falls within the fund's active period
            const fundYears = fund.yearlyTimeline.map(p => p.year).sort();
            const minYear = fundYears[0];
            const maxYear = fundYears[fundYears.length - 1];

            if (year >= minYear && year <= maxYear) {
              // Find the last known cumulative value before this year
              const previousPoints = fund.yearlyTimeline.filter(p => p.year < year);
              if (previousPoints.length > 0) {
                const lastPoint = previousPoints[previousPoints.length - 1];
                dataPoint[fund.fundName] = lastPoint.cumulative;
              }
            }
            // If outside active period, leave undefined (creates gaps)
          }
        });

        return dataPoint;
      });
    }

    const fundNames = fundData.funds.map(fund => fund.fundName);

    return { chartData, fundNames };
  }, [fundData, isRelativeView]);

  // Generate dynamic colors for each fund
  const colors = ['#dc2626', '#0891b2', '#475569', '#16a34a', '#ca8a04', '#7c3aed', '#e11d48', '#0ea5e9'];

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};

    fundNames.forEach((fundName, index) => {
      config[fundName] = {
        label: fundName,
        color: colors[index % colors.length],
      };
    });

    return config;
  }, [fundNames]);

  const ChartComponent = ({ isFullScreenMode = false }) => (
    <div ref={chartRef} className={isFullScreenMode ? "p-6" : ""}>
      <div className={`${isFullScreenMode ? "mb-6" : ""}`}>
        <div className="chart-container">
          <ChartContainer
            config={chartConfig}
            className={`${isFullScreenMode ? "h-96" : "h-64"} w-full`}
            data-testid="distributions-chart"
          >
            <ComposedChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                type="category"
                scale="point"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Amount (USD M)', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [`${value}M`, chartConfig[name as string]?.label || name]}
                    labelFormatter={(label) => isRelativeView ? label : `Year ${label}`}
                  />
                }
              />
              {fundNames.map((fundName) => (
                <Line 
                  key={fundName}
                  type="monotone" 
                  dataKey={fundName} 
                  stroke={chartConfig[fundName]?.color}
                  strokeWidth={highlightedFunds.size > 0 && !highlightedFunds.has(fundName) ? 1 : 3}
                  strokeOpacity={highlightedFunds.size > 0 && !highlightedFunds.has(fundName) ? 0.3 : 1}
                  dot={{ r: 2 }}
                  connectNulls={false}
                />
              ))}
            </ComposedChart>
          </ChartContainer>

          {/* Legend */}
          {fundNames.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t">
              {fundNames.map((fundName) => (
                <div 
                  key={fundName} 
                  className={`flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 ${
                    highlightedFunds.size > 0 && !highlightedFunds.has(fundName) ? 'opacity-40' : 'opacity-100'
                  }`}
                  onMouseEnter={() => {
                    const newSet = new Set(highlightedFunds);
                    newSet.add(fundName);
                    setHighlightedFunds(newSet);
                  }}
                  onMouseLeave={() => {
                    const newSet = new Set(highlightedFunds);
                    newSet.delete(fundName);
                    setHighlightedFunds(newSet);
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: chartConfig[fundName]?.color }}
                  />
                  <span className="text-sm font-medium">{fundName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (fundLoading) {
    return (
      <Card className="viz-block h-full w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-lg font-semibold">Distributions</CardTitle>
          <div className="flex space-x-2">
          </div>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <div className="h-64 flex items-center justify-center" data-testid="distributions-chart">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                <p className="font-medium mb-2">Loading Chart...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="viz-block h-full w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg font-semibold">Distributions</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Absolute</span>
              <button
                onClick={() => setIsRelativeView(!isRelativeView)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isRelativeView ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRelativeView ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-muted-foreground">Relative</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartComponent />
        </CardContent>
      </Card>
    </>
  );
}