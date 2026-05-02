import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface SleeveWeight {
  sleeveType: string;
  targetWeightPct: string;
  currentWeightPct: string;
  notes?: string;
}

export interface SleeveWeightsTableProps {
  sleeves: SleeveWeight[];
  showNotes?: boolean;
  highlightDrift?: boolean;
  testId?: string;
}

export function SleeveWeightsTable({ 
  sleeves, 
  showNotes = false,
  highlightDrift = true,
  testId 
}: SleeveWeightsTableProps) {
  const calculateDrift = (target: string, current: string): number => {
    return parseFloat(current) - parseFloat(target);
  };

  const getDriftColor = (drift: number): string => {
    if (Math.abs(drift) < 1) return "text-green-600 dark:text-green-400";
    if (Math.abs(drift) < 3) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const sleeveLabels: Record<string, string> = {
    GROWTH: "Growth Equities",
    CREDIT: "Fixed Income Credit",
    DURATION: "Duration Hedges",
    TIPS: "Inflation-Linked",
    CTA: "Managed Futures",
    COMMODITIES: "Commodities",
    DIVERSIFIERS: "Alt Diversifiers",
    REAL_ASSETS: "Real Assets",
    LIQUIDITY: "Liquidity"
  };

  const activeSleeves = sleeves.filter(s => parseFloat(s.targetWeightPct) > 0 || parseFloat(s.currentWeightPct) > 0);

  return (
    <div className="rounded-md border" data-testid={testId || "sleeve-weights-table"}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Sleeve</TableHead>
            <TableHead className="text-right">Target %</TableHead>
            <TableHead className="text-right">Current %</TableHead>
            <TableHead className="text-right">Drift</TableHead>
            {showNotes && <TableHead>Notes</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeSleeves.map((sleeve) => {
            const drift = calculateDrift(sleeve.targetWeightPct, sleeve.currentWeightPct);
            const driftColor = getDriftColor(drift);
            
            return (
              <TableRow key={sleeve.sleeveType} data-testid={`sleeve-row-${sleeve.sleeveType}`}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{sleeveLabels[sleeve.sleeveType] || sleeve.sleeveType}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {sleeve.sleeveType}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right" data-testid={`sleeve-target-${sleeve.sleeveType}`}>
                  {parseFloat(sleeve.targetWeightPct).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right" data-testid={`sleeve-current-${sleeve.sleeveType}`}>
                  {parseFloat(sleeve.currentWeightPct).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <span 
                    className={highlightDrift ? driftColor : "text-slate-700 dark:text-slate-300"}
                    data-testid={`sleeve-drift-${sleeve.sleeveType}`}
                  >
                    {drift > 0 ? '+' : ''}{drift.toFixed(1)}%
                  </span>
                </TableCell>
                {showNotes && (
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {sleeve.notes || '-'}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          <TableRow className="bg-slate-50 dark:bg-slate-900 font-semibold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right" data-testid="total-target">
              {activeSleeves.reduce((sum, s) => sum + parseFloat(s.targetWeightPct), 0).toFixed(1)}%
            </TableCell>
            <TableCell className="text-right" data-testid="total-current">
              {activeSleeves.reduce((sum, s) => sum + parseFloat(s.currentWeightPct), 0).toFixed(1)}%
            </TableCell>
            <TableCell className="text-right">-</TableCell>
            {showNotes && <TableCell>-</TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
