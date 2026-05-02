import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

export interface SleeveAllocation {
  sleeveType: string;
  targetWeightPct: string;
  currentWeightPct: string;
}

interface AllocationStackedBarsProps {
  sleeves: SleeveAllocation[];
  title?: string;
  description?: string;
  testId?: string;
}

const SLEEVE_COLORS: Record<string, string> = {
  GROWTH: '#3b82f6',
  CREDIT: '#10b981',
  DURATION: '#8b5cf6',
  TIPS: '#f59e0b',
  CTA: '#ec4899',
  COMMODITIES: '#eab308',
  DIVERSIFIERS: '#06b6d4',
  REAL_ASSETS: '#84cc16',
  LIQUIDITY: '#6366f1',
};

export function AllocationStackedBars({ sleeves, title, description, testId }: AllocationStackedBarsProps) {
  const activeSleeves = sleeves.filter(s => 
    parseFloat(s.targetWeightPct) > 0 || parseFloat(s.currentWeightPct) > 0
  );

  const targetData = activeSleeves.map(s => ({
    name: s.sleeveType,
    value: parseFloat(s.targetWeightPct),
    color: SLEEVE_COLORS[s.sleeveType] || '#94a3b8',
  }));

  const currentData = activeSleeves.map(s => ({
    name: s.sleeveType,
    value: parseFloat(s.currentWeightPct),
    color: SLEEVE_COLORS[s.sleeveType] || '#94a3b8',
  }));

  const chartData = [
    {
      category: 'Target',
      ...Object.fromEntries(targetData.map(d => [d.name, d.value]))
    },
    {
      category: 'Current',
      ...Object.fromEntries(currentData.map(d => [d.name, d.value]))
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {payload[0].payload.category} Allocation
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {entry.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div data-testid={testId}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
          <XAxis 
            dataKey="category" 
            stroke="#64748b"
            style={{ fontSize: '14px', fontWeight: 500 }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            label={{ value: 'Allocation (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="square"
          />
          
          {activeSleeves.map((sleeve) => (
            <Bar
              key={sleeve.sleeveType}
              dataKey={sleeve.sleeveType}
              stackId="a"
              fill={SLEEVE_COLORS[sleeve.sleeveType] || '#94a3b8'}
              name={sleeve.sleeveType}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Target</div>
          <div className="text-slate-600 dark:text-slate-400">
            {targetData.reduce((sum, d) => sum + d.value, 0).toFixed(1)}% Total
          </div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Current</div>
          <div className="text-slate-600 dark:text-slate-400">
            {currentData.reduce((sum, d) => sum + d.value, 0).toFixed(1)}% Total
          </div>
        </div>
      </div>
    </div>
  );
}
