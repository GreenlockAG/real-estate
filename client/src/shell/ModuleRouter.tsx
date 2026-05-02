import { Switch, Route, Redirect } from 'wouter';
import { useModules } from './hooks/useModules';
import PortfolioDashboard from '@/modules/portfolio/pages/Dashboard';
import RiskAnalysis from '@/modules/risk/pages/RiskAnalysis';
import WealthDashboard from '@/modules/wealth/pages/Dashboard';
import { PortfolioSummary, PropertyPassport, CashflowDetails } from '@/modules/realestate';
import NotFound from '@/pages/not-found';

export default function ModuleRouter() {
  const { enabledModules } = useModules();

  const firstEnabledModule = enabledModules[0];

  return (
    <Switch>
      {/* Root redirect to first enabled module */}
      {firstEnabledModule && (
        <Route path="/">
          <Redirect to={firstEnabledModule.route} />
        </Route>
      )}

      {/* Portfolio Module Route */}
      <Route path="/portfolio" component={PortfolioDashboard} />
      
      {/* Risk Module Route */}
      <Route path="/risk" component={RiskAnalysis} />
      
      {/* Wealth Module Route */}
      <Route path="/wealth" component={WealthDashboard} />

      {/* Real Estate Module Routes */}
      <Route path="/real-estate" component={PortfolioSummary} />
      <Route path="/real-estate/property/:id" component={PropertyPassport} />
      <Route path="/real-estate/property/:id/cashflows" component={CashflowDetails} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}
