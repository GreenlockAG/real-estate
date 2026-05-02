import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'primary' | 'secondary' | 'warning' | 'default';
}

export default function MetricCard({ title, value, change, trend, variant = 'default' }: MetricCardProps) {
  const cardClasses = {
    primary: "metric-card text-primary-foreground",
    secondary: "metric-card secondary text-secondary-foreground", 
    warning: "metric-card warning text-accent-foreground",
    default: "bg-card"
  };

  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const TrendIcon = trendIcon;

  return (
    <Card className={`${cardClasses[variant]} rounded-lg`}>
      <CardContent className="p-6 text-center">
        <div className="text-3xl font-bold mb-2" data-testid={`metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        <div className={`text-sm ${variant === 'default' ? 'text-muted-foreground' : 'opacity-90'}`}>
          {title}
        </div>
        {change && (
          <div className={`text-xs mt-2 flex items-center justify-center ${variant === 'default' ? 'text-secondary' : 'opacity-75'}`}>
            {TrendIcon && <TrendIcon className="w-3 h-3 mr-1" />}
            <span data-testid={`metric-change-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
