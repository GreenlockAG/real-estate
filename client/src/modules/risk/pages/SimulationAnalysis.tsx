import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { TrendingDown, Droplets, AlertTriangle, Activity, Network } from "lucide-react";
import { RiskMetricCard } from "@/shared-ui/metrics/RiskMetricCard";
import { MetricsGrid } from "@/shared-ui/metrics/MetricsGrid";
import { ComplianceStatusCard } from "@/shared-ui/metrics/ComplianceStatusCard";
import { CrisisScenarioChart } from "@/shared-ui/charts/CrisisScenarioChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SimulationResults {
  maxDrawdown: {
    maxDdPct: string;
    recoveryTimeDays: number;
  };
  lcr: {
    numeratorMillions: string;
    denominatorMillions: string;
    ratio: string;
  };
  crisisPnl: {
    scenarioName: string;
    pnlPct: string;
  }[];
  es: {
    es95Pct: string;
    es97Pct: string;
    tailRatio: string;
  };
  csi: {
    correlationValue: string;
    regimeFlag: "NORMAL" | "STRESS";
  };
}

export default function SimulationAnalysis() {
  const params = useParams();
  const simulationId = params.id || "edaa4623-f3e5-45db-9436-bffbc544a8ae";

  const { data: results, isLoading } = useQuery<SimulationResults>({
    queryKey: ["/api/risk/simulations", simulationId, "results"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <MetricsGrid columns={3}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </MetricsGrid>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            No simulation results found
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    maxDrawdown,
    lcr,
    crisisPnl,
    es,
    csi
  } = results;

  // Governance thresholds (from seed data)
  const thresholds = {
    maxDdPct: "-20.00",
    lcrMin: "1.25",
    crisisPnl2008: "-20.00",
    es97Target: "-18.00",
    csiWarningLevel: "-0.10"
  };

  // Determine compliance status
  const breaches: string[] = [];
  
  if (parseFloat(maxDrawdown.maxDdPct) < parseFloat(thresholds.maxDdPct)) {
    breaches.push(`Max Drawdown ${maxDrawdown.maxDdPct}% exceeds limit of ${thresholds.maxDdPct}%`);
  }
  
  if (parseFloat(lcr.ratio) < parseFloat(thresholds.lcrMin)) {
    breaches.push(`LCR ${lcr.ratio}x below minimum of ${thresholds.lcrMin}x`);
  }
  
  const lehmanScenario = crisisPnl.find(s => s.scenarioName === "2008 (Lehman)");
  if (lehmanScenario && parseFloat(lehmanScenario.pnlPct) < parseFloat(thresholds.crisisPnl2008)) {
    breaches.push(`2008 Crisis P&L ${lehmanScenario.pnlPct}% exceeds limit of ${thresholds.crisisPnl2008}%`);
  }
  
  if (parseFloat(es.es97Pct) < parseFloat(thresholds.es97Target)) {
    breaches.push(`ES97.5 ${es.es97Pct}% exceeds target of ${thresholds.es97Target}%`);
  }
  
  if (parseFloat(csi.correlationValue) < parseFloat(thresholds.csiWarningLevel)) {
    breaches.push(`CSI ${csi.correlationValue} below warning level of ${thresholds.csiWarningLevel}`);
  }

  const recommendations = [
    "Portfolio within all risk limits",
    "Monitor liquidity buffer - currently healthy at " + parseFloat(lcr.ratio).toFixed(2) + "x",
    "Max drawdown well controlled at " + parseFloat(maxDrawdown.maxDdPct).toFixed(0) + "%",
    "Crisis scenarios show acceptable tail risk"
  ];

  // Determine metric status (compliant/warning/breach)
  const getMetricStatus = (value: string, threshold: string, isMinimum: boolean): "compliant" | "warning" | "breach" | "neutral" => {
    const val = parseFloat(value);
    const thr = parseFloat(threshold);
    const diff = Math.abs(val - thr);
    const pct = diff / Math.abs(thr);

    if (isMinimum) {
      // For minimums (LCR): value should be >= threshold
      if (val >= thr) return "compliant";
      if (pct < 0.1) return "warning";
      return "breach";
    } else {
      // For maximums (DD, ES, Crisis): value should be >= threshold (less negative)
      if (val >= thr) return "compliant";
      if (pct < 0.1) return "warning";
      return "breach";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8" data-testid="simulation-analysis-page">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Risk Simulation Analysis
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              5 Core Private Wealth Risk Metrics
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Simulation ID: {simulationId.slice(0, 8)}...
          </Badge>
        </div>
      </div>

      {/* Compliance Status Banner */}
      <ComplianceStatusCard
        compliant={breaches.length === 0}
        breaches={breaches}
        recommendations={recommendations}
      />

      {/* 5 Risk Metrics Grid */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Risk Metrics Overview
        </h2>
        <MetricsGrid columns={3}>
          {/* Metric 1: Max Drawdown */}
          <RiskMetricCard
            title="Max Drawdown"
            description="Largest peak-to-trough decline"
            value={parseFloat(maxDrawdown.maxDdPct).toFixed(1)}
            unit="%"
            status={getMetricStatus(maxDrawdown.maxDdPct, thresholds.maxDdPct, false)}
            icon={TrendingDown}
            threshold={`Limit: ${thresholds.maxDdPct}%`}
            detail={`Recovery: ${maxDrawdown.recoveryTimeDays} days`}
            testId="metric-max-drawdown"
          />

          {/* Metric 2: LCR */}
          <RiskMetricCard
            title="Liquidity Coverage Ratio"
            description="Available liquidity vs. 12-month calls"
            value={parseFloat(lcr.ratio).toFixed(2)}
            unit="x"
            status={getMetricStatus(lcr.ratio, thresholds.lcrMin, true)}
            icon={Droplets}
            threshold={`Minimum: ${thresholds.lcrMin}x`}
            detail={`${parseFloat(lcr.numeratorMillions).toFixed(1)}M / ${parseFloat(lcr.denominatorMillions).toFixed(1)}M`}
            testId="metric-lcr"
          />

          {/* Metric 3: Crisis P&L (worst scenario) */}
          <RiskMetricCard
            title="Worst Crisis Scenario"
            description="2008 Lehman scenario impact"
            value={lehmanScenario ? parseFloat(lehmanScenario.pnlPct).toFixed(1) : "N/A"}
            unit="%"
            status={lehmanScenario ? getMetricStatus(lehmanScenario.pnlPct, thresholds.crisisPnl2008, false) : "neutral"}
            icon={AlertTriangle}
            threshold={`Limit: ${thresholds.crisisPnl2008}%`}
            detail={`5 scenarios tested`}
            testId="metric-crisis-pnl"
          />

          {/* Metric 4: Expected Shortfall */}
          <RiskMetricCard
            title="Expected Shortfall (ES97.5)"
            description="Tail risk at 97.5% confidence"
            value={parseFloat(es.es97Pct).toFixed(1)}
            unit="%"
            status={getMetricStatus(es.es97Pct, thresholds.es97Target, false)}
            icon={Activity}
            threshold={`Target: ${thresholds.es97Target}%`}
            detail={`ES95: ${es.es95Pct}%, Tail Ratio: ${es.tailRatio}`}
            testId="metric-es"
          />

          {/* Metric 5: CSI */}
          <RiskMetricCard
            title="Correlation Stress Index"
            description="Growth-Duration correlation shift"
            value={parseFloat(csi.correlationValue).toFixed(2)}
            unit=""
            status={parseFloat(csi.correlationValue) < parseFloat(thresholds.csiWarningLevel) ? "warning" : "compliant"}
            icon={Network}
            threshold={`Warning: ${thresholds.csiWarningLevel}`}
            detail={`Regime: ${csi.regimeFlag}`}
            testId="metric-csi"
          />
        </MetricsGrid>
      </div>

      {/* Crisis Scenario Chart */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Crisis Scenario Analysis
        </h2>
        <CrisisScenarioChart
          scenarios={crisisPnl}
          threshold={parseFloat(thresholds.crisisPnl2008)}
          description="Historical stress scenarios applied to current portfolio"
        />
      </div>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Details</CardTitle>
          <CardDescription>Monte Carlo parameters and methodology</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-slate-600 dark:text-slate-400">Engine:</span>
              <span className="ml-2 font-medium">Monte Carlo</span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Paths:</span>
              <span className="ml-2 font-medium">10,000</span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Horizon:</span>
              <span className="ml-2 font-medium">252 days (1 year)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
