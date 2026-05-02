import { useRoute, Link } from 'wouter';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  LabelList,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getPropertyById, getPropertyPassportData } from '../data/demoData';
import type { RiskLevel } from '../data/types';

const COLORS = {
  mint: '#E0FAEF',
  magnolia: '#F4EDFF',
  sky: '#E2FDFF',
  aurora: '#99F4C0',
  periwinkle: '#DCD6FF',
  alpine: '#AEF0FF',
  garnish: '#18975A',
  amethyst: '#8B78FD',
  blue: '#4DBFD8',
  evergreen: '#01472E',
  midnight: '#28224A',
  navy: '#013E46',
};

function RiskDot({ level }: { level: RiskLevel }) {
  const colors = {
    Low: 'bg-green-500',
    Medium: 'bg-amber-500',
    High: 'bg-red-500',
  };
  return <span className={`inline-block w-3 h-3 rounded-full ${colors[level]}`} />;
}

function formatCurrency(value: number, currency: string = 'USD'): string {
  if (currency === 'USD') {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  }
  return `${currency} ${value.toLocaleString()}`;
}

function formatPLValue(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs >= 1000000 ? `$${(abs / 1000000).toFixed(2)}M` : `$${abs.toLocaleString()}`;
  return value >= 0 ? `+${formatted}` : `-${formatted.replace('$', '$')}`;
}

export default function PropertyPassport() {
  const [, params] = useRoute('/real-estate/property/:id');
  const propertyId = params?.id || 'dubai';
  const [maintenanceExpanded, setMaintenanceExpanded] = useState(false);

  const property = getPropertyById(propertyId);
  const passportData = getPropertyPassportData(propertyId);

  if (!property) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  if (!passportData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Detailed data only available for Dubai Marina Penthouse</p>
      </div>
    );
  }

  const { valuations, performanceIndex, growthIndex, plItems } = passportData;

  const valuationChartData = valuations.map((v) => ({
    quarter: v.quarter.replace('20', "'"),
    valueUSD: v.valueUSD / 1000000,
    valueLocal: v.valueLocal,
    fxRate: v.fxRate,
    growth: v.growthPercent,
  }));

  return (
    <div className="flex h-full">
      <div
        className="w-[20%] shrink-0 p-6 h-full overflow-y-auto sticky top-0"
        style={{ backgroundColor: '#BBC9C5' }}
      >
        <div className="space-y-6">
          <img
            src={property.thumbnail}
            alt={property.name}
            className="w-full aspect-[4/3] rounded-lg object-cover shadow-md"
          />

          <div>
            <h1 className="text-xl font-bold text-slate-900">{property.name}</h1>
            <p className="text-sm text-slate-600 mt-1">
              📍 {property.city}, {property.country}
            </p>
          </div>

          <div className="h-px bg-slate-300" />

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Current Value</p>
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(property.currentValueUSD)}
              </p>
              <p className="text-sm text-slate-600">
                {formatCurrency(property.currentValueLocal, property.localCurrency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Profit / Loss</p>
              <p
                className={`text-lg font-bold ${property.plUSD >= 0 ? 'text-green-700' : 'text-red-700'}`}
              >
                {formatPLValue(property.plUSD)}
                <span className="text-sm ml-1">
                  ({property.plUSD >= 0 ? '+' : ''}{property.plPercent.toFixed(1)}%)
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">IRR</p>
              <p className="text-lg font-bold text-slate-900">
                {property.irr >= 0 ? '+' : ''}{property.irr.toFixed(1)}%
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Financing Structure</p>
              <p className="text-sm font-medium text-slate-900">
                {property.equityPercent}% equity / {property.debtPercent}% debt
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">FX Exposure</p>
              <p className="text-sm font-medium text-slate-900">
                {property.localCurrency}/USD
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Leverage</p>
              <p className="text-sm font-medium text-slate-900">{property.leverage.toFixed(2)}x</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Risk Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <RiskDot level={property.riskLevel} />
                  <span className="text-sm font-medium text-slate-900">{property.riskLevel}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
              <Badge variant="secondary" className="mt-1">{property.status}</Badge>
            </div>

            <div className="h-px bg-slate-300" />

            <Link
              href={`/real-estate/property/${propertyId}/cashflows`}
              className="flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
              style={{ color: COLORS.garnish }}
            >
              Transaction History →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-100 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Valuation (M2M)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={valuationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `$${v}M`}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'valueUSD') return [`$${value.toFixed(2)}M`, 'Value (USD)'];
                    return [value, name];
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                        <p className="font-medium">{data.quarter}</p>
                        <p>USD: ${(data.valueUSD).toFixed(2)}M</p>
                        <p>AED: {data.valueLocal.toLocaleString()}</p>
                        <p>FX Rate: {data.fxRate}</p>
                        {data.growth !== null && (
                          <p className={data.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                            Growth: {data.growth >= 0 ? '+' : ''}{data.growth}%
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="valueUSD"
                  fill={COLORS.garnish}
                  radius={[4, 4, 0, 0]}
                  name="valueUSD"
                >
                  <LabelList
                    dataKey="valueUSD"
                    position="top"
                    formatter={(v: number) => `${v.toFixed(1)}M`}
                    style={{ fontSize: 10, fill: '#374151' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valuation Bridge (Q4 2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={(() => {
                  const items = passportData.waterfall;
                  const costBasis = items[0]?.valueUSD || 0;
                  let cumulative = costBasis;
                  
                  return items.map((item, idx) => {
                    let offset = 0;
                    let barValue = 0;
                    
                    if (idx === 0) {
                      offset = 0;
                      barValue = item.valueUSD / 1000000;
                    } else if (item.isTotal) {
                      offset = 0;
                      barValue = item.valueUSD / 1000000;
                    } else {
                      if (item.valueUSD >= 0) {
                        offset = cumulative / 1000000;
                        barValue = item.valueUSD / 1000000;
                        cumulative += item.valueUSD;
                      } else {
                        cumulative += item.valueUSD;
                        offset = cumulative / 1000000;
                        barValue = Math.abs(item.valueUSD) / 1000000;
                      }
                    }
                    
                    return {
                      ...item,
                      offset,
                      barValue,
                      topValue: (offset + barValue),
                    };
                  });
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `$${v.toFixed(1)}M`}
                  domain={[0, 6]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const barEntry = payload.find((p) => p.dataKey === 'barValue');
                    const data = barEntry?.payload;
                    if (!data) return null;
                    const isPositive = data.valueUSD >= 0;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                        <p className="font-medium">{data.name}</p>
                        <p className={data.isTotal ? 'font-bold' : isPositive ? 'text-green-600' : 'text-red-600'}>
                          USD: {isPositive ? '+' : ''}{(data.valueUSD / 1000000).toFixed(2)}M
                          {!data.isTotal && ` (${data.percent >= 0 ? '+' : ''}${data.percent}%)`}
                        </p>
                        <p className="text-muted-foreground">
                          AED: {data.valueAED.toLocaleString()}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="offset" stackId="stack" fill="transparent" />
                <Bar dataKey="barValue" stackId="stack" radius={[4, 4, 0, 0]}>
                  {passportData.waterfall.map((item, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={item.isTotal ? COLORS.evergreen : item.valueUSD >= 0 ? COLORS.garnish : '#ef4444'}
                    />
                  ))}
                  <LabelList
                    dataKey="topValue"
                    position="top"
                    formatter={(v: number) => `${v.toFixed(1)}M`}
                    style={{ fontSize: 10, fill: '#374151' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {passportData.waterfall.filter(w => !w.isTotal).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`font-mono ${item.valueUSD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.valueUSD >= 0 ? '+' : ''}{(item.valueUSD / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-muted-foreground">
                    ({item.percent >= 0 ? '+' : ''}{item.percent}%)
                  </span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Index (IRR vs Opportunity Cost)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={performanceIndex}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="quarter"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v.replace('20', "'")}
                />
                <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                        <p className="font-medium">{data.quarter}</p>
                        <p>Property IRR: {data.quarterlyIRR}%</p>
                        <p>USD Deposit: {data.quarterlyBenchmark}%</p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="propertyIndex"
                  stroke={COLORS.evergreen}
                  strokeWidth={3}
                  dot={false}
                  name="Property IRR"
                />
                <Line
                  type="monotone"
                  dataKey="benchmarkIndex"
                  stroke={COLORS.blue}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="3M USD Deposit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Index (vs Dubai RE Benchmark)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthIndex}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="quarter"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v.replace('20', "'")}
                />
                <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                        <p className="font-medium">{data.quarter}</p>
                        <p>Property Growth: {data.quarterlyGrowth >= 0 ? '+' : ''}{data.quarterlyGrowth}%</p>
                        <p>Dubai RE Index: {data.quarterlyBenchmark}%</p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="propertyIndex"
                  stroke={COLORS.garnish}
                  strokeWidth={3}
                  dot={false}
                  name="Property Growth"
                />
                <Line
                  type="monotone"
                  dataKey="benchmarkIndex"
                  stroke={COLORS.blue}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Dubai RE Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quarterly P&L (AED)</CardTitle>
              <Link
                href={`/real-estate/property/${propertyId}/cashflows`}
                className="text-sm font-medium hover:underline"
                style={{ color: COLORS.garnish }}
              >
                View Details →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Q1 2025</TableHead>
                  <TableHead className="text-right">Q2 2025</TableHead>
                  <TableHead className="text-right">Q3 2025</TableHead>
                  <TableHead className="text-right">Q4 2025</TableHead>
                  <TableHead className="text-right">USD Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plItems.map((item, idx) => {
                  if (item.isSubItem && !maintenanceExpanded) return null;

                  const isNetProfit = item.category === 'Net Profit';
                  const formatValue = (val: number) => {
                    if (val === 0) return '—';
                    const formatted = Math.abs(val).toLocaleString();
                    return val < 0 ? `-$${formatted}` : `$${formatted}`;
                  };

                  return (
                    <TableRow
                      key={idx}
                      className={`
                        ${isNetProfit ? 'font-bold bg-slate-50' : ''}
                        ${item.isSubItem ? 'text-sm text-muted-foreground' : ''}
                      `}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.isSubItem && <span className="ml-4">└</span>}
                          {item.isExpandable && (
                            <button
                              onClick={() => setMaintenanceExpanded(!maintenanceExpanded)}
                              className="p-0.5 hover:bg-slate-200 rounded"
                            >
                              {maintenanceExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <span>{item.category}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${item.q1 < 0 ? 'text-red-600' : ''}`}
                      >
                        {formatValue(item.q1)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${item.q2 < 0 ? 'text-red-600' : ''}`}
                      >
                        {formatValue(item.q2)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${item.q3 < 0 ? 'text-red-600' : ''}`}
                      >
                        {formatValue(item.q3)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${item.q4 < 0 ? 'text-red-600' : ''}`}
                      >
                        {formatValue(item.q4)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${item.usdTotal < 0 ? 'text-red-600' : ''}`}
                      >
                        {formatValue(item.usdTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
