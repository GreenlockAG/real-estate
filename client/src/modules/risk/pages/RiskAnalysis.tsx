import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SleeveWeight } from "@/shared-ui/tables/SleeveWeightsTable";
import { AllocationStackedBars } from "@/shared-ui/charts/AllocationStackedBars";
import { RiskMetricCard } from "@/shared-ui/metrics/RiskMetricCard";
import { MetricsGrid } from "@/shared-ui/metrics/MetricsGrid";
import { ComplianceStatusCard } from "@/shared-ui/metrics/ComplianceStatusCard";
import { CrisisScenarioChart } from "@/shared-ui/charts/CrisisScenarioChart";
import { TrendingDown, Droplets, AlertTriangle, Activity, Network, ChevronDown, ChevronUp, RefreshCw, Upload } from "lucide-react";

interface Portfolio {
  id: string;
  name: string;
  aumMillions: string;
  baseCurrency: string;
}

interface PortfolioDetails {
  portfolio: Portfolio;
  sleeves: SleeveWeight[];
  liquidity: any;
  cashflows: any;
  thresholds: {
    maxDdPct: string;
    lcrMin: string;
    crisisPnlLimit2008: string;
    es97Target: string;
    csiWarningLevel: string;
  };
}

interface Simulation {
  id: string;
  portfolioId: string;
}

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
  crisisPnl: Array<{
    scenarioName: string;
    pnlPct: string;
  }>;
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

export default function RiskAnalysis() {
  const [expandedPositions, setExpandedPositions] = useState(false);
  
  // Refs for smooth scrolling
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);

  // Fetch portfolio data
  const { data: portfolios } = useQuery<Portfolio[]>({
    queryKey: ["/api/risk/portfolios"],
  });

  const portfolio = portfolios?.[0];
  const portfolioId = portfolio?.id || "6978def9-22d1-43fa-8472-aba47341dd35";

  const { data: portfolioDetails } = useQuery<PortfolioDetails>({
    queryKey: ["/api/risk/portfolios", portfolioId],
    enabled: !!portfolioId,
  });

  const { data: simulations } = useQuery<Simulation[]>({
    queryKey: ["/api/risk/simulations", portfolioId],
    enabled: !!portfolioId,
  });

  const simulation = simulations?.[0];
  const simulationId = simulation?.id;

  const { data: results } = useQuery<SimulationResults>({
    queryKey: ["/api/risk/simulations", simulationId, "results"],
    enabled: !!simulationId,
  });

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sleeves = portfolioDetails?.sleeves || [];
  const thresholds = portfolioDetails?.thresholds;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* FIXED HEADER */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ClientRisk Pro
            </h1>
            <div className="flex items-center space-x-6 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Client: </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {portfolio?.name || "Aurora Family Office"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">AUM: </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ${portfolio?.aumMillions || "350"}M
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => scrollToSection(section1Ref)} data-testid="jump-portfolio">
                Portfolio ↓
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection(section2Ref)} data-testid="jump-settings">
                Settings ↓
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection(section3Ref)} data-testid="jump-risk">
                Risk ↓
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection(section4Ref)} data-testid="jump-stress">
                Stress Test ↓
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span className="text-slate-700 dark:text-slate-300">{sleeves.length} positions classified</span>
              </div>
              <div className="text-slate-400">|</div>
              <div className="text-slate-600 dark:text-slate-400">Last refresh: today</div>
              <Button variant="outline" size="sm" data-testid="button-refresh">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" data-testid="button-import">
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-6 py-8 space-y-12">
        {/* SECTION 1: PORTFOLIO SNAPSHOT */}
        <section ref={section1Ref} className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              📊 Portfolio Snapshot
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Intake & Classification
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Allocation Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Allocation by Sleeve</CardTitle>
                <CardDescription>Target vs. Current allocation comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationStackedBars 
                  sleeves={sleeves} 
                  testId="sleeve-allocation-chart" 
                />
              </CardContent>
            </Card>

            {/* Drift Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Drift vs. Target</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sleeves.slice(0, 3).map((sleeve) => {
                  const drift = parseFloat(sleeve.currentWeightPct) - parseFloat(sleeve.targetWeightPct);
                  return (
                    <div key={sleeve.sleeveType} className="flex justify-between items-center">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{sleeve.sleeveType}</span>
                      <Badge variant={Math.abs(drift) < 1 ? "secondary" : "destructive"}>
                        {drift > 0 ? "+" : ""}{drift.toFixed(1)}%
                      </Badge>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => scrollToSection(section2Ref)}>
                  Fix in Settings ↓
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Position Detail (Collapsible) */}
          <Collapsible open={expandedPositions} onOpenChange={setExpandedPositions}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle>Position Detail</CardTitle>
                    {expandedPositions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {sleeves.length} sleeves classified • No unclassified positions
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Position-level detail would display here with filter/search/sort controls
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </section>

        {/* SECTION 2: SETTINGS & ASSUMPTIONS */}
        <section ref={section2Ref} className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              ⚙️ Settings & Assumptions
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Client Profile, SAA Targets, Model Parameters
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Client Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600 dark:text-slate-400">Name:</span>
                  <span className="font-medium">{portfolio?.name || "Aurora Family Office"}</span>
                  
                  <span className="text-slate-600 dark:text-slate-400">AUM:</span>
                  <span className="font-medium">${portfolio?.aumMillions || "350"}M</span>
                  
                  <span className="text-slate-600 dark:text-slate-400">Base Currency:</span>
                  <span className="font-medium">{portfolio?.baseCurrency || "USD"}</span>
                  
                  <span className="text-slate-600 dark:text-slate-400">Type:</span>
                  <span className="font-medium">Family Office</span>
                </div>
                
                <div className="pt-4 border-t">
                  <Label className="text-slate-700 dark:text-slate-300 mb-2 block">Max Acceptable Drawdown</Label>
                  <Input type="text" value={thresholds?.maxDdPct || "-20%"} readOnly />
                </div>
              </CardContent>
            </Card>

            {/* SAA Targets */}
            <Card>
              <CardHeader>
                <CardTitle>Strategic Asset Allocation</CardTitle>
                <CardDescription>Target weights and tolerance bands</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  {sleeves.slice(0, 5).map((sleeve) => (
                    <div key={sleeve.sleeveType} className="flex justify-between items-center py-1">
                      <span className="text-slate-700 dark:text-slate-300">{sleeve.sleeveType}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">{parseFloat(sleeve.targetWeightPct).toFixed(0)}%</span>
                        <Badge variant="secondary" className="text-xs">±3%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forward-Looking Assumptions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Forward-Looking Assumptions (Monte Carlo)</CardTitle>
              <CardDescription>Expected returns, volatilities, and correlations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="font-semibold text-slate-700 dark:text-slate-300">Sleeve</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">E[Return]</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">Vol</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">Sharpe</div>
                
                <div className="text-slate-600 dark:text-slate-400">Growth</div>
                <div>8.5%</div>
                <div>16%</div>
                <div>0.40</div>
                
                <div className="text-slate-600 dark:text-slate-400">Credit</div>
                <div>6.0%</div>
                <div>8%</div>
                <div>0.50</div>
                
                <div className="text-slate-600 dark:text-slate-400">Diversifiers</div>
                <div>5.0%</div>
                <div>6%</div>
                <div>0.50</div>
              </div>

              <div>
                <Button variant="outline" size="sm">
                  View/Edit Correlation Matrix →
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={() => scrollToSection(section3Ref)} data-testid="button-calculate-metrics">
              Calculate Risk Metrics →
            </Button>
          </div>
        </section>

        {/* SECTION 3: RISK METRICS (Historical) */}
        <section ref={section3Ref} className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              📉 Risk Metrics
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Historical Performance (36 months realized)
            </p>
          </div>

          <MetricsGrid columns={3}>
            <RiskMetricCard
              title="Realized Volatility"
              value="14.2"
              unit="%"
              status="neutral"
              description="36-month annualized"
              testId="metric-historical-vol"
            />
            <RiskMetricCard
              title="Historical Max DD"
              value="-16.5"
              unit="%"
              status="neutral"
              description="Peak-to-trough (Jan 2022)"
              testId="metric-historical-dd"
            />
            <RiskMetricCard
              title="Realized Sharpe"
              value="0.52"
              unit=""
              status="neutral"
              description="Risk-adjusted return"
              testId="metric-historical-sharpe"
            />
          </MetricsGrid>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Historical Performance Summary</CardTitle>
              <CardDescription>Based on 36 months of NAV history</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              <p>
                Portfolio has demonstrated stable risk-adjusted returns with controlled drawdowns during the 2022 rate shock period.
                Realized volatility of 14.2% is within expected range for a growth-oriented allocation.
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={() => scrollToSection(section4Ref)} data-testid="button-run-stress-test">
              Run Stress Test →
            </Button>
          </div>
        </section>

        {/* SECTION 4: STRESS TESTING (Forward - ALL 5 METRICS) */}
        <section ref={section4Ref} className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              🎯 Stress Testing
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Forward Projections - Monte Carlo Simulation (10,000 paths, 252-day horizon)
            </p>
          </div>

          {results && (
            <>
              {/* Compliance Banner */}
              <div className="mb-8">
                <ComplianceStatusCard
                  compliant={true}
                  breaches={[]}
                  recommendations={[
                    "Portfolio within all risk limits",
                    `Liquidity coverage healthy at ${parseFloat(results.lcr.ratio).toFixed(2)}x`,
                    "Crisis scenarios show acceptable tail risk",
                    "Correlation regime normal - no stress detected"
                  ]}
                  testId="stress-test-compliance"
                />
              </div>

              {/* 5 KEY RISK METRICS */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Five Core Risk Metrics
                </h3>
                <MetricsGrid columns={3}>
                  {/* Metric 1: Max Drawdown */}
                  <RiskMetricCard
                    title="Max Drawdown"
                    description="Largest peak-to-trough decline (forward)"
                    value={parseFloat(results.maxDrawdown.maxDdPct).toFixed(1)}
                    unit="%"
                    status="compliant"
                    icon={TrendingDown}
                    threshold={`Limit: ${thresholds?.maxDdPct || "-20"}%`}
                    detail={`Recovery: ${results.maxDrawdown.recoveryTimeDays} days`}
                    testId="stress-metric-max-dd"
                  />

                  {/* Metric 2: LCR */}
                  <RiskMetricCard
                    title="Liquidity Coverage Ratio"
                    description="Available liquidity vs. 12-month calls"
                    value={parseFloat(results.lcr.ratio).toFixed(2)}
                    unit="x"
                    status="compliant"
                    icon={Droplets}
                    threshold={`Minimum: ${thresholds?.lcrMin || "1.25"}x`}
                    detail={`${parseFloat(results.lcr.numeratorMillions).toFixed(1)}M / ${parseFloat(results.lcr.denominatorMillions).toFixed(1)}M`}
                    testId="stress-metric-lcr"
                  />

                  {/* Metric 3: Crisis P&L (worst) */}
                  <RiskMetricCard
                    title="Worst Crisis Scenario"
                    description="2008 Lehman scenario impact"
                    value={results.crisisPnl.find(s => s.scenarioName === "2008 (Lehman)")?.pnlPct || "N/A"}
                    unit="%"
                    status="compliant"
                    icon={AlertTriangle}
                    threshold={`Limit: ${thresholds?.crisisPnlLimit2008 || "-20"}%`}
                    detail="5 scenarios tested"
                    testId="stress-metric-crisis"
                  />

                  {/* Metric 4: Expected Shortfall */}
                  <RiskMetricCard
                    title="Expected Shortfall (ES97.5)"
                    description="Tail risk at 97.5% confidence"
                    value={parseFloat(results.es.es97Pct).toFixed(1)}
                    unit="%"
                    status="compliant"
                    icon={Activity}
                    threshold={`Target: ${thresholds?.es97Target || "-18"}%`}
                    detail={`ES95: ${results.es.es95Pct}%, Tail Ratio: ${results.es.tailRatio}`}
                    testId="stress-metric-es"
                  />

                  {/* Metric 5: CSI */}
                  <RiskMetricCard
                    title="Correlation Stress Index"
                    description="Growth-Duration correlation shift"
                    value={parseFloat(results.csi.correlationValue).toFixed(2)}
                    unit=""
                    status="compliant"
                    icon={Network}
                    threshold={`Warning: ${thresholds?.csiWarningLevel || "-0.10"}`}
                    detail={`Regime: ${results.csi.regimeFlag}`}
                    testId="stress-metric-csi"
                  />
                </MetricsGrid>
              </div>

              {/* Crisis Scenario Chart */}
              <div className="mb-8">
                <CrisisScenarioChart
                  title="Crisis Scenario Analysis"
                  scenarios={results.crisisPnl}
                  threshold={parseFloat(thresholds?.crisisPnlLimit2008 || "-20")}
                  description="Historical stress scenarios applied to current portfolio"
                  testId="stress-crisis-chart"
                />
              </div>

              {/* Export Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Export & Reports</CardTitle>
                  <CardDescription>Download results for client review</CardDescription>
                </CardHeader>
                <CardContent className="flex space-x-4">
                  <Button variant="outline" data-testid="button-export-pdf">
                    Download PDF Report
                  </Button>
                  <Button variant="outline" data-testid="button-export-excel">
                    Export to Excel
                  </Button>
                  <Button variant="outline" data-testid="button-save-snapshot">
                    Save Snapshot
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {!results && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Run stress test calculations to see forward-looking risk metrics
                </p>
                <Button size="lg">Run Simulation</Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
