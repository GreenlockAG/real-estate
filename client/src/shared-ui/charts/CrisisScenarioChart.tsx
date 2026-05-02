import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface CrisisScenario {
  scenarioName: string;
  pnlPct: string;
}

export interface CrisisScenarioChartProps {
  title?: string;
  description?: string;
  scenarios: CrisisScenario[];
  threshold?: number;
  testId?: string;
}

export function CrisisScenarioChart({ 
  title = "Crisis Scenario Analysis",
  description,
  scenarios,
  threshold = -20,
  testId 
}: CrisisScenarioChartProps) {
  const chartData = scenarios.map(s => ({
    name: s.scenarioName,
    pnl: parseFloat(s.pnlPct),
    displayValue: `${s.pnlPct}%`
  })).sort((a, b) => a.pnl - b.pnl);

  const getBarColor = (value: number): string => {
    if (value <= threshold) return "#dc2626"; // Red for breach
    if (value <= threshold + 5) return "#f59e0b"; // Amber for warning
    return "#10b981"; // Green for safe
  };

  return (
    <Card data-testid={testId || "crisis-scenario-chart"}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              className="text-xs fill-slate-600 dark:fill-slate-400"
            />
            <YAxis 
              label={{ value: 'P&L %', angle: -90, position: 'insideLeft' }}
              className="text-xs fill-slate-600 dark:fill-slate-400"
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {data.name}
                      </p>
                      <p className={`text-lg font-bold ${data.pnl <= threshold ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {data.displayValue}
                      </p>
                      {data.pnl <= threshold && (
                        <p className="text-xs text-red-600 mt-1">
                          Exceeds threshold ({threshold}%)
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="pnl" 
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.pnl)}
                  data-testid={`scenario-bar-${index}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-red-600 rounded"></div>
            <span>Breach (&lt; {threshold}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-amber-500 rounded"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-green-600 rounded"></div>
            <span>Within Limit</span>
          </div>
        </div>

        {threshold && (
          <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Threshold: {threshold}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
