import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SetupGateProps {
  onCredentialsConfigured: () => void;
}

export default function SetupGate({ onCredentialsConfigured }: SetupGateProps) {
  const [credentials, setCredentials] = useState({
    apiKey: "",
    baseId: "",
    tableIds: "",
    openaiKey: "",
  });
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfiguring(true);

    try {
      // In a real implementation, this would save credentials to server/environment
      // For this demo, we'll simulate success after validation
      
      if (!credentials.apiKey || !credentials.baseId || !credentials.tableIds) {
        throw new Error("API Key, Base ID, and Table IDs are required");
      }

      const tableIds = credentials.tableIds.split(',').map(id => id.trim());
      if (tableIds.length < 4) {
        throw new Error("At least 4 table IDs are required");
      }

      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Credentials configured successfully",
        description: "Your Airtable connection has been established.",
      });

      onCredentialsConfigured();

    } catch (error) {
      toast({
        title: "Configuration failed",
        description: error instanceof Error ? error.message : "Failed to configure credentials",
        variant: "destructive",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">PE/VC Portfolio Manager</h1>
            <p className="text-muted-foreground mt-2">Configure your Airtable credentials to get started</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="apiKey" className="text-sm font-medium text-foreground">
                Airtable API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="pat..."
                className="mt-2"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                data-testid="input-airtable-api-key"
              />
            </div>
            
            <div>
              <Label htmlFor="baseId" className="text-sm font-medium text-foreground">
                Base ID
              </Label>
              <Input
                id="baseId"
                type="text"
                placeholder="app..."
                className="mt-2"
                value={credentials.baseId}
                onChange={(e) => setCredentials(prev => ({ ...prev, baseId: e.target.value }))}
                data-testid="input-base-id"
              />
            </div>
            
            <div>
              <Label htmlFor="tableIds" className="text-sm font-medium text-foreground">
                Table IDs
              </Label>
              <Input
                id="tableIds"
                type="text"
                placeholder="tblCapCalls,tblDists,tblInvestments,tblFundInfo"
                className="mt-2"
                value={credentials.tableIds}
                onChange={(e) => setCredentials(prev => ({ ...prev, tableIds: e.target.value }))}
                data-testid="input-table-ids"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated table IDs (minimum 4)</p>
            </div>
            
            <div>
              <Label htmlFor="openaiKey" className="text-sm font-medium text-foreground">
                OpenAI API Key (Optional)
              </Label>
              <Input
                id="openaiKey"
                type="password"
                placeholder="sk-..."
                className="mt-2"
                value={credentials.openaiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, openaiKey: e.target.value }))}
                data-testid="input-openai-key"
              />
              <p className="text-xs text-muted-foreground mt-1">Required for ChatGPT Advisor feature</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isConfiguring}
              data-testid="button-configure"
            >
              {isConfiguring ? "Configuring..." : "Configure & Deploy"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Note:</p>
                <p>In a production environment, these credentials would be securely stored as environment variables or in Replit Secrets.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
