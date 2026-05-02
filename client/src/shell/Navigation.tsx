import { Link, useLocation } from 'wouter';
import { BarChart3, AlertTriangle, FileText, Building } from 'lucide-react';
import { useModules } from './hooks/useModules';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'briefcase': BarChart3,
  'alert-triangle': AlertTriangle,
  'file-text': FileText,
  'building': Building,
};

export default function Navigation() {
  const [location] = useLocation();
  const { enabledModules } = useModules();

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || BarChart3;
    return Icon;
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo and App Title */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Investment Oversight</h1>
            <p className="text-xs text-muted-foreground">Portfolio Platform</p>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {enabledModules.map((module) => {
            const Icon = getIcon(module.icon);
            const isActive = location === module.route || location.startsWith(module.route + '/');
            
            return (
              <Link key={module.id} href={module.route}>
                <div
                  className={`
                    w-full px-3 py-2 rounded-md flex items-center space-x-3 transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                  data-testid={`nav-${module.id}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{module.name}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Phase 1</span>
            <span className="text-primary font-medium">Foundation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
