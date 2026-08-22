import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';

// Page Imports
import Dashboard from '@/pages/dashboard';
import Roadmap from '@/pages/roadmap';
import Planner from '@/pages/planner';
import VisionBoard from '@/pages/vision-board';
import Documents from '@/pages/documents';
import Wins from '@/pages/wins';
import Milestones from '@/pages/milestones';
import Quotes from '@/pages/quotes';
import Settings from '@/pages/settings';
import CalendarPage from '@/pages/calendar';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/gis">
          {() => <Roadmap category="gis" title="GIS Tracker" />}
        </Route>
        <Route path="/university">
          {() => <Roadmap category="university" title="University Apps" />}
        </Route>
        <Route path="/applications">
          {() => <Roadmap category="applications" title="Job Applications" />}
        </Route>
        <Route path="/research">
          {() => <Roadmap category="research" title="Research Papers" />}
        </Route>
        <Route path="/planner" component={Planner} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/vision" component={VisionBoard} />
        <Route path="/documents" component={Documents} />
        <Route path="/wins" component={Wins} />
        <Route path="/milestones" component={Milestones} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
