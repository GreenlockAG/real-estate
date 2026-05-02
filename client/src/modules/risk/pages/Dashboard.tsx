import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { TrendingDown, Droplets, AlertTriangle, Activity, Network, ArrowRight, BarChart3 } from "lucide-react";

export default function RiskDashboard() {
  const metrics = [
    {
      title: "Max Drawdown",
      value: "-18%",
      icon: TrendingDown,
      status: "compliant",
      description: "Peak-to-trough decline"
    },
    {
      title: "Liquidity Coverage",
      value: "1.40x",
      icon: Droplets,
      status: "compliant",
      description: "12-month coverage ratio"
    },
    {
      title: "Crisis P&L",
      value: "-19%",
      icon: AlertTriangle,
      status: "compliant",
      description: "Worst scenario (2008)"
    },
    {
      title: "Expected Shortfall",
      value: "-17%",
      icon: Activity,
      status: "compliant",
      description: "ES97.5 tail risk"
    },
    {
      title: "Correlation Stress",
      value: "-0.28",
      icon: Network,
      status: "compliant",
      description: "Normal regime"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800";
      case "breach": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-card border-b border-border px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Risk Monitoring</h2>
            <p className="text-sm text-muted-foreground">
              Private wealth risk metrics and governance oversight
            </p>
          </div>
          <Badge variant="outline" className="text-sm bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" data-testid="badge-compliance">
            All Metrics Compliant
          </Badge>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    Latest Simulation Results
                  </CardTitle>
                  <CardDescription className="text-base">
                    Aurora Family Office • Core Governance Portfolio • $350M AUM
                  </CardDescription>
                </div>
                <BarChart3 className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                View comprehensive risk analysis across 5 core private wealth metrics: 
                Maximum Drawdown, Liquidity Coverage Ratio, Crisis P&L scenarios, 
                Expected Shortfall (ES97.5), and Correlation Stress Index.
              </p>
              <Link href="/risk/simulation">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-view-simulation">
                  View Full Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Metrics Summary Grid */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              5 Core Risk Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card 
                    key={index} 
                    className={`${getStatusColor(metric.status)} hover:shadow-md transition-all border`}
                    data-testid={`metric-card-${index}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <Badge variant="outline" className="text-xs">OK</Badge>
                      </div>
                      <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {metric.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {metric.value}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {metric.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About Risk Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p>
                The Risk Monitoring module provides governance-level risk oversight for private wealth portfolios 
                through 5 specialized metrics designed for family offices and private investors.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Key Features</h4>
                  <ul className="space-y-1 text-sm list-disc list-inside">
                    <li>Monte Carlo simulation engine</li>
                    <li>Historical crisis scenario testing</li>
                    <li>Liquidity stress analysis</li>
                    <li>Correlation regime monitoring</li>
                    <li>Governance threshold tracking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Methodology</h4>
                  <ul className="space-y-1 text-sm list-disc list-inside">
                    <li>10,000 path simulations</li>
                    <li>252-day (1 year) horizon</li>
                    <li>5 historical stress scenarios</li>
                    <li>Normal + stress correlation regimes</li>
                    <li>95th & 97.5th percentile tail risk</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
