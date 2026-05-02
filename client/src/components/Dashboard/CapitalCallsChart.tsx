import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Maximize2, Camera, Check } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";

interface FundCashflowsData {
  years: number[];
  totals: Record<number, number>;
}

interface CumulativeData {
  timeline: Array<{
    date: string;
    amount: number;
    cumulative: number;
  }>;
  totalCumulative: number;
}

export default function NetCashflowsChart() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: annualData, isLoading: annualLoading } = useQuery({
    queryKey: ["/api/metrics/fund-net-cashflows-by-year"],
    queryFn: (): Promise<FundCashflowsData> =>
      fetch("/api/metrics/fund-net-cashflows-by-year").then(res => res.json()),
  });

  const { data: cumulativeData, isLoading: cumulativeLoading } = useQuery({
    queryKey: ["/api/metrics/cumulative-net-cashflow"],
    queryFn: (): Promise<CumulativeData> =>
      fetch("/api/metrics/cumulative-net-cashflow").then(res => res.json()),
  });

  const chartData = useMemo(() => {
    if (!annualData || !cumulativeData) return [];

    // Get year-end cumulative values for each year
    const cumulativeByYear = new Map<number, number>();
    cumulativeData.timeline.forEach(point => {
      const year = new Date(point.date).getFullYear();
      cumulativeByYear.set(year, point.cumulative);
    });

    // Group individual cashflows by year and separate positive/negative
    const yearlyFlows = new Map<number, { positive: number; negative: number }>();
    
    cumulativeData.timeline.forEach(point => {
      const year = new Date(point.date).getFullYear();
      const amount = point.amount;
      
      if (!yearlyFlows.has(year)) {
        yearlyFlows.set(year, { positive: 0, negative: 0 });
      }
      
      const flows = yearlyFlows.get(year)!;
      if (amount > 0) {
        flows.positive += amount * -1;
      } else if (amount < 0) {
        flows.negative += amount * -1;
      }
    });

    // Create annual data points - independent positive/negative series
    return annualData.years.map(year => {
      const flows = yearlyFlows.get(year) || { positive: 0, negative: 0 };
      const netAmount = annualData.totals[year] || 0;
      
      return {
        year,
        positiveAmount: flows.positive,  // Positive values extend upward
        negativeAmount: flows.negative,  // Negative values extend downward
        totalAmount: netAmount,
        cumulative: cumulativeByYear.get(year) || 0,
      };
    });
  }, [annualData, cumulativeData]);

  const chartConfig = {
    positiveAmount: {
      label: "Inflows",
      color: "#475569", // Dark blue/gray like in image
    },
    negativeAmount: {
      label: "Outflows", 
      color: "#0891b2", // Teal like in image
    },
    cumulative: {
      label: "Cumulative",
      color: "#dc2626", // Red line like in image
    },
  };

  const handleCaptureImage = async () => {
    if (!chartRef.current) return;
    
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'net-cashflows-chart.png';
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success feedback
      setCaptureSuccess(true);
      setTimeout(() => setCaptureSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to capture chart:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const ChartComponent = ({ isFullScreenMode = false }) => (
    <div ref={chartRef} className={isFullScreenMode ? "p-6" : ""}>
      <div className={`${isFullScreenMode ? "mb-6" : ""}`}>
        <div className="chart-container">
          <ChartContainer
            config={chartConfig}
            className={`${isFullScreenMode ? "h-96" : "h-64"} w-full`}
            data-testid="net-cashflows-chart"
          >
            <ComposedChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={-40}
              barCategoryGap={80}
            >
              <CartesianGrid strokeDasharray="3 3" />
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
                    formatter={(value, name) => {
                      if (name === "positiveAmount") return [`+${value}M`, "Positive Cashflows"];
                      if (name === "negativeAmount") return [`${value}M`, "Negative Cashflows"];
                      if (name === "cumulative") return [`${value}M`, "Cumulative"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                }
              />
              <Bar 
                dataKey="positiveAmount" 
                fill={chartConfig.positiveAmount.color}
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="negativeAmount" 
                fill={chartConfig.negativeAmount.color}
                radius={[0, 0, 2, 2]}
                maxBarSize={40}
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke={chartConfig.cumulative.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.cumulative.color, strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );

  if (annualLoading || cumulativeLoading) {
    return (
      <Card className="viz-block h-full w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-lg font-semibold">Net Cashflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <div className="h-64 flex items-center justify-center" data-testid="net-cashflows-chart">
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
          <CardTitle className="text-lg font-semibold">Net Cashflows</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartComponent />
        </CardContent>
      </Card>

      {/* Full Screen Dialog */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Net Cashflows - Full Screen</h3>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCaptureImage}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                ) : captureSuccess ? (
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                Save as Image
              </Button>
            </div>
            <div className="flex-1">
              <ChartComponent isFullScreenMode={true} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}