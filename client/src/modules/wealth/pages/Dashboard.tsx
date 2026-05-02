import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar as CalendarIcon,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  Currency,
  COLORS,
  getWealthSnapshot,
  getPortfolioValueHistory,
  getAnnualPerformance,
  getMonthlyPerformance2025,
  getCustodianAssets,
  getAllocationPath,
  getManagerExposure,
  getPositions,
  getPrivateMarketFunds,
  getFeeHistory,
  getCashByBankAndCurrency,
  getFxExposure,
  formatCurrency,
  formatPercent,
  Position,
} from '../data/mockData';
import { format, subYears } from 'date-fns';

type DateRange = {
  from: Date;
  to: Date;
};

export default function WealthDashboard() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2015, 0, 1),
    to: new Date(),
  });
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownData, setDrilldownData] = useState<{ title: string; content: string; details?: Record<string, string | number> } | null>(null);

  const snapshot = useMemo(() => getWealthSnapshot(currency), [currency]);
  const portfolioHistory = useMemo(() => getPortfolioValueHistory(currency), [currency]);
  const annualPerformance = useMemo(() => getAnnualPerformance(currency), [currency]);
  const monthlyPerformance = useMemo(() => getMonthlyPerformance2025(currency), [currency]);
  const custodianAssets = useMemo(() => getCustodianAssets(currency), [currency]);
  const allocationPath = useMemo(() => getAllocationPath(), []);
  const managerExposure = useMemo(() => getManagerExposure(currency), [currency]);
  const positions = useMemo(() => getPositions(currency), [currency]);
  const privateMarketFunds = useMemo(() => getPrivateMarketFunds(currency), [currency]);
  const feeHistory = useMemo(() => getFeeHistory(currency), [currency]);
  const cashByBank = useMemo(() => getCashByBankAndCurrency(currency), [currency]);
  const fxExposure = useMemo(() => getFxExposure(currency), [currency]);

  const handleDrilldown = (title: string, content: string, details?: Record<string, string | number>) => {
    setDrilldownData({ title, content, details });
    setDrilldownOpen(true);
  };

  const getReturnColor = (value: number): string => {
    if (value >= 10) return '#166534';
    if (value >= 5) return '#16a34a';
    if (value >= 0) return '#65a30d';
    if (value >= -5) return '#f97316';
    if (value >= -10) return '#dc2626';
    return '#991b1b';
  };

  const getCurrencySymbol = (curr: Currency): string => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'CHF': return 'CHF';
      case 'GBP': return '£';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-card border-b border-border px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Executive Wealth Report</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive portfolio analysis and performance reporting
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, 'dd-MMM-yyyy')} → {format(dateRange.to, 'dd-MMM-yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-2">
                  <p className="text-sm font-medium">Quick Select</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDateRange({ from: subYears(new Date(), 1), to: new Date() })}
                    >
                      1Y
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDateRange({ from: subYears(new Date(), 3), to: new Date() })}
                    >
                      3Y
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDateRange({ from: subYears(new Date(), 5), to: new Date() })}
                    >
                      5Y
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDateRange({ from: new Date(2015, 0, 1), to: new Date() })}
                    >
                      All
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="default">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* PANE 1: Wealth Snapshot */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Wealth Snapshot</CardTitle>
              <CardDescription>As of {format(new Date(snapshot.asOfDate), 'dd-MMM-yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: COLORS.invested, borderLeftWidth: 4 }}
                  onClick={() => handleDrilldown('Invested Capital', 'Total capital invested across all positions', { 'Current Value': formatCurrency(snapshot.investedCapital, currency), 'Change YTD': formatPercent(snapshot.investedCapitalChange, true) })}
                >
                  <p className="text-sm text-muted-foreground mb-1">Invested Capital</p>
                  <p className="text-2xl font-bold">{formatCurrency(snapshot.investedCapital, currency)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {snapshot.investedCapitalChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${snapshot.investedCapitalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(snapshot.investedCapitalChange, true)}
                    </span>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: COLORS.fx, borderLeftWidth: 4 }}
                  onClick={() => handleDrilldown('FX Impact', 'Currency translation effect on portfolio value', { 'Impact Amount': formatCurrency(snapshot.fxImpact, currency), 'Change': formatPercent(snapshot.fxImpactChange, true) })}
                >
                  <p className="text-sm text-muted-foreground mb-1">FX Impact</p>
                  <p className="text-2xl font-bold">{formatCurrency(snapshot.fxImpact, currency)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {snapshot.fxImpactChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${snapshot.fxImpactChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(snapshot.fxImpactChange, true)}
                    </span>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: COLORS.profit, borderLeftWidth: 4 }}
                  onClick={() => handleDrilldown('Total Profit', 'Cumulative realized and unrealized gains', { 'Total Profit': formatCurrency(snapshot.totalProfit, currency), 'Change YTD': formatPercent(snapshot.totalProfitChange, true) })}
                >
                  <p className="text-sm text-muted-foreground mb-1">Total Profit</p>
                  <p className="text-2xl font-bold">{formatCurrency(snapshot.totalProfit, currency)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {snapshot.totalProfitChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${snapshot.totalProfitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(snapshot.totalProfitChange, true)}
                    </span>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: COLORS.nav, borderLeftWidth: 4 }}
                  onClick={() => handleDrilldown('Current NAV', 'Net Asset Value of total portfolio', { 'NAV': formatCurrency(snapshot.currentNav, currency), 'Change YTD': formatPercent(snapshot.navChange, true) })}
                >
                  <p className="text-sm text-muted-foreground mb-1">Current NAV</p>
                  <p className="text-2xl font-bold">{formatCurrency(snapshot.currentNav, currency)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {snapshot.navChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${snapshot.navChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(snapshot.navChange, true)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PANE 2: Portfolio Value vs Contributions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portfolio Value vs Contributions</CardTitle>
              <CardDescription>Contributed Capital, NAV, and Policy Portfolio NAV (2015 - Today)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={portfolioHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(new Date(val), 'yyyy')}
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tickFormatter={(val) => formatCurrency(val, currency)}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      labelFormatter={(val) => format(new Date(val), 'MMM yyyy')}
                      formatter={(val: number, name: string) => [formatCurrency(val, currency), name]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="contributions" 
                      name="Contributed Capital" 
                      stroke={COLORS.deposit}
                      fill={COLORS.deposit}
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="nav" 
                      name="NAV" 
                      stroke={COLORS.nav}
                      fill={COLORS.nav}
                      fillOpacity={0.5}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="policyNav" 
                      name="Policy Portfolio NAV" 
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PANE 3: Annual Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Annual Performance</CardTitle>
              <CardDescription>Indexed cumulative return vs policy portfolio (base = 100)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={annualPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis 
                      tickFormatter={(val) => val.toFixed(0)}
                      tick={{ fontSize: 11 }}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      formatter={(val: number, name: string) => [val.toFixed(1), name]}
                    />
                    <Legend />
                    <ReferenceLine y={100} stroke="#999" strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="policyReturn" 
                      name="Policy Portfolio" 
                      stroke="#94a3b8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeReturn" 
                      name="Portfolio Return" 
                      stroke={COLORS.nav}
                      strokeWidth={3}
                      dot={{ r: 4, fill: COLORS.nav }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PANE 4: Monthly Performance 2025 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Performance (2025)</CardTitle>
              <CardDescription>Cumulative year-to-date return (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis 
                      tickFormatter={(val) => `${val.toFixed(1)}%`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(val: number, name: string) => [`${val.toFixed(2)}%`, name]}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#666" />
                    <Bar 
                      dataKey="cumulativeYTD" 
                      name="Cumulative YTD" 
                      radius={[4, 4, 0, 0]}
                    >
                      {monthlyPerformance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.cumulativeYTD >= 0 ? COLORS.positive : COLORS.negative} 
                        />
                      ))}
                    </Bar>
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeYTD" 
                      stroke={COLORS.nav}
                      strokeWidth={2}
                      dot={{ r: 3, fill: COLORS.nav }}
                      name="YTD Trend"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PANE 5: Assets by Custodian */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assets by Custodian</CardTitle>
              <CardDescription>Portfolio value by bank (Top 10 Private Banks)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={custodianAssets.map(c => ({ ...c, pct: (c.value / snapshot.currentNav) * 100 }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      tickFormatter={(val) => formatCurrency(val, currency)}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(val: number, name: string) => {
                      if (name === 'Value') return [formatCurrency(val, currency), name];
                      return [`${val.toFixed(1)}%`, 'Share'];
                    }} />
                    <Bar 
                      dataKey="value" 
                      name="Value"
                      radius={[0, 4, 4, 0]}
                      onClick={(data) => handleDrilldown(data.name, 'Custodian details', { 'Value': formatCurrency(data.value, currency), 'Percentage': formatPercent((data.value / snapshot.currentNav) * 100) })}
                      cursor="pointer"
                    >
                      {custodianAssets.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(142, 76%, ${30 + index * 5}%)`}
                        />
                      ))}
                      <LabelList 
                        dataKey="pct" 
                        position="right" 
                        formatter={(val: number) => `${val.toFixed(1)}%`}
                        style={{ fontSize: 11, fill: '#374151' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PANE 6: Asset Allocation Path */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Allocation Path</CardTitle>
              <CardDescription>Current allocation vs 12-month projection vs target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allocationPath}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(val) => `${val}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip formatter={(val: number, name: string) => [`${val}%`, name]} />
                    <Bar dataKey="equity" name="Equity" stackId="a" fill={COLORS.equity}>
                      <LabelList dataKey="equity" position="center" formatter={(val: number) => val >= 10 ? `Equity ${val}%` : ''} style={{ fontSize: 10, fill: 'white' }} />
                    </Bar>
                    <Bar dataKey="privateEquity" name="Private Equity" stackId="a" fill={COLORS.pe}>
                      <LabelList dataKey="privateEquity" position="center" formatter={(val: number) => val >= 10 ? `PE ${val}%` : ''} style={{ fontSize: 10, fill: 'white' }} />
                    </Bar>
                    <Bar dataKey="bonds" name="Bonds" stackId="a" fill={COLORS.bonds}>
                      <LabelList dataKey="bonds" position="center" formatter={(val: number) => val >= 8 ? `Bonds ${val}%` : ''} style={{ fontSize: 10, fill: 'white' }} />
                    </Bar>
                    <Bar dataKey="alternatives" name="Alternatives" stackId="a" fill={COLORS.alts}>
                      <LabelList dataKey="alternatives" position="center" formatter={(val: number) => val >= 10 ? `Alts ${val}%` : ''} style={{ fontSize: 10, fill: 'white' }} />
                    </Bar>
                    <Bar dataKey="cash" name="Cash" stackId="a" fill={COLORS.liquidity}>
                      <LabelList dataKey="cash" position="center" formatter={(val: number) => val >= 4 ? `Cash ${val}%` : ''} style={{ fontSize: 10, fill: 'white' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PANE 7: Manager & Strategy Exposure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manager & Strategy Exposure</CardTitle>
              <CardDescription>Capital deployed by fund manager and asset class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={managerExposure}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="manager" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(val) => formatCurrency(val, currency)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: number) => [formatCurrency(val, currency), '']} />
                    <Legend />
                    <Bar dataKey="equity" name="Equity" fill={COLORS.equity} />
                    <Bar dataKey="privateEquity" name="Private Equity" fill={COLORS.pe} />
                    <Bar dataKey="bonds" name="Bonds" fill={COLORS.bonds} />
                    <Bar dataKey="alternatives" name="Alternatives" fill={COLORS.alts} />
                    <Bar dataKey="cash" name="Cash" fill={COLORS.cash} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PANE 8: Performance by Position */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance by Position</CardTitle>
              <CardDescription>YTD and since-purchase returns (25 positions)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Position</TableHead>
                      <TableHead>Asset Class</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">YTD Return</TableHead>
                      <TableHead className="text-right">Since Purchase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((position) => (
                      <TableRow 
                        key={position.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedPosition(position);
                          handleDrilldown(position.name, `Position details for ${position.name}`, {
                            'Asset Class': position.assetClass,
                            'Manager': position.manager,
                            'Value': formatCurrency(position.value, currency, false),
                            'YTD Return': formatPercent(position.ytdReturn, true),
                            'Since Purchase': formatPercent(position.sincePurchaseReturn, true),
                            'Purchase Date': format(new Date(position.purchaseDate), 'dd-MMM-yyyy'),
                          });
                        }}
                      >
                        <TableCell className="font-medium">{position.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{position.assetClass}</Badge>
                        </TableCell>
                        <TableCell>{position.manager}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(position.value, currency, false)}
                        </TableCell>
                        <TableCell 
                          className="text-right font-mono font-medium"
                          style={{ backgroundColor: getReturnColor(position.ytdReturn), color: 'white' }}
                        >
                          {formatPercent(position.ytdReturn, true)}
                        </TableCell>
                        <TableCell 
                          className="text-right font-mono font-medium"
                          style={{ backgroundColor: getReturnColor(position.sincePurchaseReturn), color: 'white' }}
                        >
                          {formatPercent(position.sincePurchaseReturn, true)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* PANE 9: Private Market Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Private Market Performance</CardTitle>
              <CardDescription>PE & VC value vs invested capital (MOIC)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={privateMarketFunds} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      tickFormatter={(val) => formatCurrency(val, currency)}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      formatter={(val: number, name: string) => [formatCurrency(val, currency), name]}
                      labelFormatter={(label) => {
                        const fund = privateMarketFunds.find(f => f.name === label);
                        return `${label} (MOIC: ${fund?.moic.toFixed(2)}x)`;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="investedCapital" name="Invested Capital" fill={COLORS.deposit} />
                    <Bar dataKey="currentValue" name="Current Value" fill={COLORS.nav} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {privateMarketFunds.map((fund) => (
                  <div key={fund.name} className="text-xs">
                    <span className="font-medium">{fund.name}:</span>{' '}
                    <span className={fund.moic >= 1 ? 'text-green-600' : 'text-red-600'}>
                      {fund.moic.toFixed(2)}x MOIC
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PANE 10: Custody & Bank Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custody & Bank Fees</CardTitle>
              <CardDescription>Fee breakdown by quarter (2020 - Today)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feeHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(val) => formatCurrency(val, currency)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: number) => [formatCurrency(val, currency), '']} />
                    <Legend />
                    <Bar dataKey="custodyFees" name="Custody Fees" stackId="a" fill={COLORS.custody} />
                    <Bar dataKey="managementFees" name="Management Fees" stackId="a" fill={COLORS.profit} />
                    <Bar dataKey="performanceFees" name="Performance Fees" stackId="a" fill={COLORS.fees} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PANE 11: Cash by Bank & Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cash by Bank & Currency</CardTitle>
              <CardDescription>Cash balances matrix (5% liquidity buffer)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Bank</TableHead>
                      <TableHead className="text-right">USD</TableHead>
                      <TableHead className="text-right">EUR</TableHead>
                      <TableHead className="text-right">CHF</TableHead>
                      <TableHead className="text-right">GBP</TableHead>
                      <TableHead className="text-right font-semibold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashByBank.map((row) => {
                      const maxVal = Math.max(row.usd, row.eur, row.chf, row.gbp);
                      const getOpacity = (val: number) => maxVal > 0 ? Math.max(0.1, val / maxVal) : 0;
                      
                      return (
                        <TableRow key={row.bank}>
                          <TableCell className="font-medium">{row.bank}</TableCell>
                          <TableCell 
                            className="text-right font-mono"
                            style={{ backgroundColor: `rgba(37, 99, 235, ${getOpacity(row.usd)})`, color: getOpacity(row.usd) > 0.5 ? 'white' : 'inherit' }}
                          >
                            {formatCurrency(row.usd, currency, false)}
                          </TableCell>
                          <TableCell 
                            className="text-right font-mono"
                            style={{ backgroundColor: `rgba(22, 163, 74, ${getOpacity(row.eur)})`, color: getOpacity(row.eur) > 0.5 ? 'white' : 'inherit' }}
                          >
                            {formatCurrency(row.eur, currency, false)}
                          </TableCell>
                          <TableCell 
                            className="text-right font-mono"
                            style={{ backgroundColor: `rgba(107, 114, 128, ${getOpacity(row.chf)})`, color: getOpacity(row.chf) > 0.5 ? 'white' : 'inherit' }}
                          >
                            {formatCurrency(row.chf, currency, false)}
                          </TableCell>
                          <TableCell 
                            className="text-right font-mono"
                            style={{ backgroundColor: `rgba(23, 23, 23, ${getOpacity(row.gbp)})`, color: getOpacity(row.gbp) > 0.5 ? 'white' : 'inherit' }}
                          >
                            {formatCurrency(row.gbp, currency, false)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(row.total, currency, false)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(cashByBank.reduce((sum, r) => sum + r.usd, 0), currency, false)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(cashByBank.reduce((sum, r) => sum + r.eur, 0), currency, false)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(cashByBank.reduce((sum, r) => sum + r.chf, 0), currency, false)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(cashByBank.reduce((sum, r) => sum + r.gbp, 0), currency, false)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {formatCurrency(cashByBank.reduce((sum, r) => sum + r.total, 0), currency, false)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* PANE 12: FX Exposure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">FX Exposure</CardTitle>
              <CardDescription>Portfolio currency risk allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fxExposure} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(val) => `${val}%`} domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="currency" width={60} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(val: number, name: string, props: any) => {
                        const item = props.payload;
                        return [`${val}% (${formatCurrency(item.value, currency)})`, 'Exposure'];
                      }}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {fxExposure.map((entry) => (
                        <Cell 
                          key={entry.currency} 
                          fill={COLORS[entry.currency.toLowerCase() as keyof typeof COLORS] || COLORS.deposit}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-6">
                {fxExposure.map((fx) => (
                  <div key={fx.currency} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[fx.currency.toLowerCase() as keyof typeof COLORS] }}
                    />
                    <span className="text-sm font-medium">{fx.currency}:</span>
                    <span className="text-sm">{fx.percentage}%</span>
                    <span className="text-sm text-muted-foreground">({formatCurrency(fx.value, currency)})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Drilldown Dialog */}
      <Dialog open={drilldownOpen} onOpenChange={setDrilldownOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{drilldownData?.title}</DialogTitle>
            <DialogDescription>{drilldownData?.content}</DialogDescription>
          </DialogHeader>
          {drilldownData?.details && (
            <div className="space-y-3 py-4">
              {Object.entries(drilldownData.details).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
