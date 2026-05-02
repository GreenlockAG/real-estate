import { Switch, Route, Redirect } from 'wouter';
import { useModules } from './hooks/useModules';
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

      {/* Real Estate Module Routes */}
      <Route path="/real-estate" component={PortfolioSummary} />
      <Route path="/real-estate/property/:id" component={PropertyPassport} />
      <Route path="/real-estate/property/:id/cashflows" component={CashflowDetails} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}
