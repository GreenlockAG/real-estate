import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

export interface RiskMetricCardProps {
  title: string;
  description?: string;
  value: string;
  unit?: string;
  status?: "compliant" | "warning" | "breach" | "neutral";
  icon?: LucideIcon;
  threshold?: string;
  detail?: string;
  testId?: string;
}

export function RiskMetricCard({
  title,
  description,
  value,
  unit,
  status = "neutral",
  icon: Icon,
  threshold,
  detail,
  testId
}: RiskMetricCardProps) {
  const statusColors = {
    compliant: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    breach: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    neutral: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20"
  };

  const statusLabels = {
    compliant: "Within Limits",
    warning: "Warning",
    breach: "Breach",
    neutral: ""
  };

  return (
    <Card className={`${statusColors[status]} transition-all hover:shadow-md`} data-testid={testId || `metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          {Icon && (
            <div className="ml-2">
              <Icon className="h-5 w-5 text-slate-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100" data-testid={`metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </span>
          {unit && (
            <span className="text-lg text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          )}
        </div>
        
        {(threshold || detail) && (
          <div className="flex flex-col space-y-1 text-xs">
            {threshold && (
              <div className="text-slate-600 dark:text-slate-400">
                Threshold: <span className="font-medium">{threshold}</span>
              </div>
            )}
            {detail && (
              <div className="text-slate-500 dark:text-slate-500">
                {detail}
              </div>
            )}
          </div>
        )}

        {status !== "neutral" && statusLabels[status] && (
          <div className="pt-2">
            <Badge variant="outline" className={statusColors[status]} data-testid={`metric-status-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {statusLabels[status]}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
