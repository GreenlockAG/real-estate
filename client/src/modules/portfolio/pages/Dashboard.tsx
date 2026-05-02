import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Settings, BarChart3, Bot, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

import SetupGate from "../components/SetupGate";
import DashboardLayoutWrapper from "@/components/Dashboard/DashboardLayoutWrapper";
import TablesView from "../components/TablesView";
import AdvisorPanel from "../components/AdvisorPanel";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "tables">("dashboard");
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [credentialsConfigured, setCredentialsConfigured] = useState(true); // Set to true for demo
  const { toast } = useToast();

  const { data: healthData } = useQuery({
    queryKey: ["/api/healthz"],
    queryFn: api.getHealth,
    enabled: credentialsConfigured,
    refetchInterval: 30000,
  });

  const { data: portfolioMetrics } = useQuery({
    queryKey: ["/api/metrics/portfolio"],
    queryFn: api.getPortfolioMetrics,
    enabled: credentialsConfigured,
  });

  if (!credentialsConfigured) {
    return <SetupGate onCredentialsConfigured={() => setCredentialsConfigured(true)} />;
  }

  const getStatusIcon = (secretsOk: boolean, dbOk: boolean) => {
    if (secretsOk && dbOk) return <CheckCircle className="h-4 w-4 text-secondary" />;
    if (!secretsOk || !dbOk) return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-accent" />;
  };

  const getStatusText = (secretsOk: boolean, dbOk: boolean) => {
    if (secretsOk && dbOk) return "Connected";
    if (!secretsOk) return "Credentials Missing";
    if (!dbOk) return "Database Error";
    return "Warning";
  };

  const formatLastSync = (timestamp: string | undefined) => {
    if (!timestamp) return "Never";
    try {
      const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60));
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Unknown";
    }
  };

  const tabConfig = {
    dashboard: {
      title: 'Portfolio Dashboard',
      subtitle: 'Real-time live data from Airtable'
    },
    tables: {
      title: 'Data Tables',
      subtitle: 'Explore and filter your live portfolio data'
    }
  };

  const currentConfig = tabConfig[activeTab];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{currentConfig.title}</h2>
          <p className="text-sm text-muted-foreground">{currentConfig.subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "dashboard" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid="tab-dashboard"
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("tables")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "tables" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid="tab-tables"
            >
              Tables
            </button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {healthData && getStatusIcon(healthData.secrets_ok, healthData.db_ok)}
            <span data-testid="text-sync-count">
              {healthData?.tables?.length || 0} tables synced
            </span>
          </div>
          
          <Button 
            onClick={() => setAdvisorOpen(!advisorOpen)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            data-testid="button-advisor-toggle"
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Advisor
          </Button>
        </div>
      </header>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "dashboard" && (
          <DashboardLayoutWrapper portfolioMetrics={portfolioMetrics} />
        )}

        {activeTab === "tables" && <TablesView />}
      </div>

      {/* Advisor Panel */}
      <AdvisorPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </div>
  );
}
