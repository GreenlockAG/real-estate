import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface CorrelationHeatmapProps {
  title: string;
  description?: string;
  labels: string[];
  matrix: number[][];
  testId?: string;
}

export function CorrelationHeatmap({ 
  title, 
  description, 
  labels, 
  matrix,
  testId 
}: CorrelationHeatmapProps) {
  const getColor = (value: number): string => {
    if (value >= 0.7) return "bg-blue-700 text-white";
    if (value >= 0.4) return "bg-blue-500 text-white";
    if (value >= 0.2) return "bg-blue-300 text-slate-900";
    if (value >= -0.2) return "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100";
    if (value >= -0.4) return "bg-red-300 text-slate-900";
    if (value >= -0.7) return "bg-red-500 text-white";
    return "bg-red-700 text-white";
  };

  const sleeveLabels: Record<string, string> = {
    GROWTH: "Growth",
    CREDIT: "Credit",
    DURATION: "Duration",
    TIPS: "TIPS",
    CTA: "CTA",
    COMMODITIES: "Cmdty",
    DIVERSIFIERS: "Div",
    REAL_ASSETS: "Real",
    LIQUIDITY: "Liq"
  };

  const getShortLabel = (label: string): string => {
    return sleeveLabels[label] || label.slice(0, 5);
  };

  return (
    <Card data-testid={testId || "correlation-heatmap"}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="w-16"></th>
                  {labels.map((label, idx) => (
                    <th 
                      key={idx} 
                      className="text-xs font-medium text-slate-600 dark:text-slate-400 p-1 text-center w-12"
                      data-testid={`heatmap-header-${label}`}
                    >
                      {getShortLabel(label)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((rowLabel, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="text-xs font-medium text-slate-600 dark:text-slate-400 p-1 text-right pr-2">
                      {getShortLabel(rowLabel)}
                    </td>
                    {labels.map((colLabel, colIdx) => {
                      const value = matrix[rowIdx][colIdx];
                      const colorClass = getColor(value);
                      
                      return (
                        <td 
                          key={colIdx} 
                          className="p-0"
                        >
                          <div 
                            className={`${colorClass} w-12 h-12 flex items-center justify-center text-xs font-mono transition-all hover:scale-110 hover:shadow-lg cursor-pointer`}
                            title={`${rowLabel} × ${colLabel}: ${value.toFixed(2)}`}
                            data-testid={`heatmap-cell-${rowIdx}-${colIdx}`}
                          >
                            {value.toFixed(2)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
          <span>Correlation:</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-red-700"></div>
            <span>-1</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700"></div>
            <span>0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-700"></div>
            <span>+1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
