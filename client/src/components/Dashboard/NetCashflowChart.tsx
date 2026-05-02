import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NetCashflow {
  id: string;
  airtableId: string;
  fundId: string;
  fundName: string;
  name: string;
  amount: string;
  cashflowDate: string;
  status: string;
  inOut: string;
  currency: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

interface LadderedBond {
  id: string;
  airtableId: string;
  bondName: string;
  issuer: string;
  faceValue: number;
  maturityDate: string;
  currency: string;
  securityId: string;
}

export default function NetCashflowChart() {
  const [distributionRate, setDistributionRate] = useState<string>("100");
  const { data: netCashflows, isLoading: cashflowsLoading } = useQuery({
    queryKey: ["/api/net-cashflows"],
    queryFn: (): Promise<NetCashflow[]> =>
      fetch("/api/net-cashflows").then(res => res.json()),
  });

  const { data: ladderedBonds, isLoading: bondsLoading } = useQuery({
    queryKey: ["/api/laddered-bonds"],
    queryFn: (): Promise<LadderedBond[]> =>
      fetch("/api/laddered-bonds").then(res => res.json()),
  });

  const isLoading = cashflowsLoading || bondsLoading;

  // Generate quarterly data from Q3 2025 to Q2 2030 (5 years)
  const quarterlyData = useMemo(() => {
    if (!netCashflows || !ladderedBonds) return [];

    const startYear = 2025;
    const startQuarter = 3;
    const quarters = [];
    
    // Generate 20 quarters (5 years)
    for (let i = 0; i < 20; i++) {
      const year = startYear + Math.floor((startQuarter + i - 1) / 4);
      const quarter = ((startQuarter + i - 1) % 4) + 1;
      quarters.push({ year, quarter, label: `Q${quarter} ${year}` });
    }

    // Group cashflows and bonds by quarter
    const quarterlyBreakdown = quarters.map(({ year, quarter, label }) => {
      const quarterStart = new Date(year, (quarter - 1) * 3, 1, 0, 0, 0, 0);
      const quarterEnd = new Date(year, quarter * 3, 0, 23, 59, 59, 999);
      
      let positive = 0;
      let negative = 0;
      let maturingBonds = 0;
      const maturingBondsList: LadderedBond[] = [];
      
      // Process cashflows based on in_out field (exclude actual cashflows, include all forecasted)
      netCashflows.forEach(cf => {
        const cashflowDate = new Date(cf.cashflowDate);
        if (cashflowDate >= quarterStart && cashflowDate <= quarterEnd && cf.status !== 'actual') {
          const amount = Math.abs(Number(cf.amount) || 0); // Use absolute value
          
          if (cf.inOut === 'Contribution') {
            // Contributions are negative cashflows (money going OUT to funds)
            negative += amount;
          } else if (cf.inOut === 'Distribution') {
            // Distributions are positive cashflows (money coming IN from funds)
            positive += amount;
          }
        }
      });
      
      // Apply distribution rate to positive cashflows
      const distributionMultiplier = Number(distributionRate) / 100;
      positive = positive * distributionMultiplier;
      
      // Process maturing bonds
      ladderedBonds.forEach(bond => {
        const maturityDate = new Date(bond.maturityDate);
        if (maturityDate >= quarterStart && maturityDate <= quarterEnd) {
          maturingBonds += Number(bond.faceValue) || 0;
          maturingBondsList.push(bond);
        }
      });
      
      const total = positive + negative + maturingBonds;
      
      return {
        quarter: label,
        negative: -negative / 1000000, // Convert to millions and apply negative sign
        positive: positive / 1000000, // Convert to millions (already positive)
        maturingBonds: maturingBonds / 1000000, // Convert to millions
        total: (positive - negative + maturingBonds) / 1000000,
        year,
        quarterNum: quarter,
        maturingBondsList
      };
    });
    
    return quarterlyBreakdown;
  }, [netCashflows, ladderedBonds, distributionRate]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(amount) + 'M';
  };

  return (
    <Card className="viz-block h-full w-full">
      <CardHeader className="flex flex-col space-y-4 pb-6">
        <CardTitle className="text-lg font-semibold">Quarterly Cashflow Analysis</CardTitle>
        <div className="flex items-center space-x-6">
          <Label className="text-sm font-medium text-muted-foreground">Distribution Scenario:</Label>
          <RadioGroup 
            value={distributionRate} 
            onValueChange={setDistributionRate}
            className="flex items-center space-x-6"
            data-testid="distribution-radio-group"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="100" id="dist-100" data-testid="radio-100" />
              <Label htmlFor="dist-100" className="text-sm font-medium cursor-pointer">100%</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="50" id="dist-50" data-testid="radio-50" />
              <Label htmlFor="dist-50" className="text-sm font-medium cursor-pointer">50%</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="dist-0" data-testid="radio-0" />
              <Label htmlFor="dist-0" className="text-sm font-medium cursor-pointer">0%</Label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading cashflow data...</span>
          </div>
        ) : (
          <div className="table-container">
            <Table data-testid="quarterly-cashflow-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Quarter</TableHead>
                  <TableHead className="text-right font-semibold">Negative Cashflows</TableHead>
                  <TableHead className="text-right font-semibold">Positive Cashflows</TableHead>
                  <TableHead className="text-right font-semibold">Maturing Bonds</TableHead>
                  <TableHead className="text-right font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quarterlyData.filter(row => row.total !== 0).map((row, index) => (
                  <TableRow key={row.quarter} data-testid={`row-${row.quarter.replace(' ', '-')}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <TableCell className="font-medium" data-testid={`quarter-${row.quarter.replace(' ', '-')}`}>
                      {row.quarter}
                    </TableCell>
                    <TableCell 
                      className="text-right font-medium" 
                      data-testid={`negative-${row.quarter.replace(' ', '-')}`}
                    >
                      {row.negative !== 0 ? formatAmount(row.negative) : '-'}
                    </TableCell>
                    <TableCell 
                      className="text-right font-medium" 
                      data-testid={`positive-${row.quarter.replace(' ', '-')}`}
                    >
                      {row.positive !== 0 ? formatAmount(row.positive) : '-'}
                    </TableCell>
                    <TableCell 
                      className="text-right font-medium" 
                      data-testid={`bonds-${row.quarter.replace(' ', '-')}`}
                    >
                      {row.maturingBonds !== 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help underline decoration-dotted">
                                {formatAmount(row.maturingBonds)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-3">
                              <div className="space-y-2">
                                <div className="font-semibold text-sm">
                                  Maturing Bonds - {row.quarter}
                                </div>
                                <div className="space-y-1 text-sm">
                                  {row.maturingBondsList.map((bond, index) => (
                                    <div key={bond.id || index} className="border-b pb-1 last:border-b-0">
                                      <div className="font-medium">{bond.bondName}</div>
                                      <div className="flex justify-between">
                                        <span>Nominal:</span>
                                        <span>${(Number(bond.faceValue) / 1000000).toFixed(1)}M</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Maturity:</span>
                                        <span>{new Date(bond.maturityDate).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : '-'}
                    </TableCell>
                    <TableCell 
                      className="text-right font-semibold" 
                      data-testid={`total-${row.quarter.replace(' ', '-')}`}
                    >
                      {row.total !== 0 ? formatAmount(row.total) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}