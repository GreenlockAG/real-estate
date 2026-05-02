import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, RefreshCw, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SyncManagement() {
  const { toast } = useToast();

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/healthz"],
    queryFn: api.getHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: syncStatuses, isLoading: syncLoading } = useQuery({
    queryKey: ["/api/sync/status"],
    queryFn: api.getSyncStatus,
    refetchInterval: 30000,
  });

  const syncMutation = useMutation({
    mutationFn: api.syncData,
    onSuccess: (data) => {
      toast({
        title: "Sync completed successfully",
        description: data.message,
      });
      // Invalidate all data queries to refresh with latest Airtable data
      queryClient.invalidateQueries({ queryKey: ["/api/healthz"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/net-cashflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/detailed-net-cashflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/funds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reported-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/laddered-bonds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quarterly-forecast"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/performance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/fund-net-cashflows-by-year"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/cumulative-net-cashflow"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/cumulative-net-cashflows-by-fund"] });
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-accent" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <div className="w-2 h-2 bg-muted-foreground rounded-full" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ok':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatLastSync = (timestamp: string | undefined) => {
    if (!timestamp) return 'Never';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getTotalRecords = () => {
    if (!syncStatuses) return 0;
    return syncStatuses.reduce((sum, status) => sum + (status.recordCount || 0), 0);
  };

  const getNextSyncTime = () => {
    if (!healthData?.timestamp) return 'Unknown';
    try {
      const lastSync = new Date(healthData.timestamp);
      const nextSync = new Date(lastSync.getTime() + 30 * 60 * 1000); // 30 minutes
      const remaining = Math.max(0, nextSync.getTime() - Date.now());
      const minutes = Math.ceil(remaining / (1000 * 60));
      return `${minutes}m`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-2">Sync Management</h3>
          <p className="text-muted-foreground">Monitor and control data synchronization with Airtable</p>
        </div>
        
        {/* Sync Controls */}
        <Card className="viz-block h-full w-full mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <CardTitle className="text-lg font-semibold text-foreground">Sync Controls</CardTitle>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                data-testid="button-manual-sync"
              >
                {syncMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Manual Sync
                  </>
                )}
              </Button>
              <Button variant="outline" data-testid="button-settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1" data-testid="text-last-sync">
                  {healthLoading ? '-' : formatLastSync(healthData?.timestamp)}
                </div>
                <div className="text-sm text-muted-foreground">Last Sync</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1" data-testid="text-next-sync">
                  {healthLoading ? '-' : getNextSyncTime()}
                </div>
                <div className="text-sm text-muted-foreground">Next Auto Sync</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1" data-testid="text-total-records">
                  {syncLoading ? '-' : getTotalRecords().toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Connection Status */}
        <Card className="viz-block h-full w-full mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  {healthData?.secrets_ok ? (
                    <CheckCircle className="h-5 w-5 text-secondary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-medium text-foreground">Airtable Credentials</span>
                </div>
                <Badge variant={healthData?.secrets_ok ? 'default' : 'destructive'}>
                  {healthData?.secrets_ok ? 'Connected' : 'Missing'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  {healthData?.db_ok ? (
                    <CheckCircle className="h-5 w-5 text-secondary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-medium text-foreground">Database</span>
                </div>
                <Badge variant={healthData?.db_ok ? 'default' : 'destructive'}>
                  {healthData?.db_ok ? 'Connected' : 'Error'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Table Status */}
        <Card className="viz-block h-full w-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Table Status</CardTitle>
          </CardHeader>
          <CardContent>
            {syncLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading sync status...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {syncStatuses && syncStatuses.length > 0 ? (
                  syncStatuses.map((table) => (
                    <div 
                      key={table.tableName} 
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                      data-testid={`sync-status-${table.tableName}`}
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(table.status)}
                        <div>
                          <div className="font-medium text-foreground capitalize">
                            {table.tableName.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {table.tableName}
                          </div>
                          {table.errorMessage && (
                            <div className="text-xs text-destructive mt-1 max-w-md truncate">
                              {table.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex items-center space-x-4">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {table.recordCount || 0} records
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatLastSync(table.lastSync)}
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-primary hover:bg-primary/10"
                          data-testid={`button-sync-table-${table.tableName}`}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No sync status available</p>
                    <p className="text-xs mt-1">Run your first sync to see table status</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
