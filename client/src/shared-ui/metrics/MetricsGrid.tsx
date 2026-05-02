export interface MetricsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  testId?: string;
}

export function MetricsGrid({ 
  children, 
  columns = 3, 
  className = "",
  testId 
}: MetricsGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div 
      className={`grid ${gridCols[columns]} gap-4 ${className}`}
      data-testid={testId || "metrics-grid"}
    >
      {children}
    </div>
  );
}
