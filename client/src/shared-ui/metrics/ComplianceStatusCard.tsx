import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

export interface ComplianceStatusCardProps {
  compliant: boolean;
  breaches: string[];
  recommendations?: string[];
  testId?: string;
}

export function ComplianceStatusCard({ 
  compliant, 
  breaches, 
  recommendations = [],
  testId 
}: ComplianceStatusCardProps) {
  const status = compliant ? "compliant" : (breaches.length > 0 ? "breach" : "warning");
  
  const statusConfig = {
    compliant: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      title: "Portfolio Compliant",
      message: "All risk metrics within governance thresholds"
    },
    breach: {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      title: "Governance Breaches Detected",
      message: `${breaches.length} metric${breaches.length > 1 ? 's' : ''} exceed${breaches.length === 1 ? 's' : ''} threshold`
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
      badgeColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      title: "Review Required",
      message: "Some metrics approaching limits"
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className={`${config.bgColor} border-2`} data-testid={testId || "compliance-status-card"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-6 w-6 ${config.color}`} />
            <CardTitle className={`text-lg ${config.color}`}>
              {config.title}
            </CardTitle>
          </div>
          <Badge variant="secondary" className={config.badgeColor} data-testid="compliance-badge">
            {compliant ? "OK" : "ACTION REQUIRED"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {config.message}
        </p>

        {breaches.length > 0 && (
          <div className="space-y-2" data-testid="breach-list">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Breaches:
            </h4>
            <ul className="space-y-1">
              {breaches.map((breach, idx) => (
                <li 
                  key={idx} 
                  className="text-sm text-slate-700 dark:text-slate-300 flex items-start"
                  data-testid={`breach-item-${idx}`}
                >
                  <span className="mr-2 text-red-500">•</span>
                  {breach}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-2" data-testid="recommendation-list">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recommendations:
            </h4>
            <ul className="space-y-1">
              {recommendations.map((rec, idx) => (
                <li 
                  key={idx} 
                  className="text-sm text-slate-700 dark:text-slate-300 flex items-start"
                  data-testid={`recommendation-item-${idx}`}
                >
                  <span className="mr-2 text-blue-500">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
