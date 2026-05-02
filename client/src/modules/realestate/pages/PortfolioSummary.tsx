import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { properties, getLast4QuartersSparkline } from '../data/demoData';
import type { RiskLevel, PropertyStatus } from '../data/types';

const COLORS = {
  garnish: '#18975A',
  aurora: '#99F4C0',
  blue: '#4DBFD8',
  amethyst: '#8B78FD',
};

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const padding = 2;
  
  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={COLORS.blue}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const colors = {
    Low: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    Medium: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
    High: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  };
  const c = colors[level];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: PropertyStatus }) {
  const colors = {
    Operating: 'bg-blue-100 text-blue-800',
    Renovation: 'bg-purple-100 text-purple-800',
    'For Sale': 'bg-orange-100 text-orange-800',
  };
  
  return (
    <Badge variant="secondary" className={colors[status]}>
      {status}
    </Badge>
  );
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

function formatPL(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted.replace('$', '$')}`;
}

const countryFlags: Record<string, string> = {
  AE: '🇦🇪',
  US: '🇺🇸',
  FR: '🇫🇷',
  CH: '🇨🇭',
  GB: '🇬🇧',
};

export default function PortfolioSummary() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-card border-b border-border px-6 py-4 shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Real Estate Portfolio</h2>
          <p className="text-sm text-muted-foreground">Multi-property investor dashboard</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Value (USD)</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                  <TableHead className="text-right">IRR</TableHead>
                  <TableHead>Financing</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Liquidity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16">Trend</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const isPositive = property.plUSD >= 0;
                  const rowBg = isPositive ? 'bg-green-50/50' : 'bg-red-50/50';
                  const sparklineData = getLast4QuartersSparkline(property.id);
                  
                  return (
                    <TableRow key={property.id} className={rowBg}>
                      <TableCell>
                        <img
                          src={property.thumbnail}
                          alt={property.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{property.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <span>{countryFlags[property.countryCode]}</span>
                          <span>{property.country}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(property.currentValueUSD)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatPL(property.plUSD)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({isPositive ? '+' : ''}{property.plPercent.toFixed(1)}%)
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={property.irr >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {property.irr >= 0 ? '+' : ''}{property.irr.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {property.equityPercent}% eq / {property.debtPercent}% debt
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={property.riskLevel} />
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {property.liquidityDays} days
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={property.status} />
                      </TableCell>
                      <TableCell>
                        <Sparkline data={sparklineData} />
                      </TableCell>
                      <TableCell>
                        <Link href={`/real-estate/property/${property.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
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
