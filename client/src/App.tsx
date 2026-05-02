import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutProvider } from "@/contexts/LayoutContext";
import ShellLayout from "@/shell/Layout";
import ModuleRouter from "@/shell/ModuleRouter";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutProvider>
        <TooltipProvider>
          <Toaster />
          <ShellLayout>
            <ModuleRouter />
          </ShellLayout>
        </TooltipProvider>
      </LayoutProvider>
    </QueryClientProvider>
  );
}

export default App;
