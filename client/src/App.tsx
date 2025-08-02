import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Questionnaire from "@/pages/Questionnaire";
const Generation = () => {
  try {
    return require("@/pages/Generation").default;
  } catch {
    return () => <div>Generation page not found</div>;
  }
};
import Dashboard from "@/pages/Dashboard";
import Teams from "@/pages/Teams";
import Templates from "@/pages/Templates";
import Billing from "@/pages/Billing";
import Analytics from "@/pages/Analytics";
import Marketing from "@/pages/Marketing";
import ProductDevelopment from "@/pages/ProductDevelopment";
import FinancialPlanning from "@/pages/FinancialPlanning";
import Education from "@/pages/Education";
import PersonalDevelopment from "@/pages/PersonalDevelopment";
import PromptSuggestionsDemo from "@/pages/PromptSuggestionsDemo";
import RealTimeSuggestionsDemo from "@/pages/RealTimeSuggestionsDemo";
import FeedbackAnalyticsDemo from "@/pages/FeedbackAnalyticsDemo";
import AdminDashboard from "@/pages/AdminDashboard";
import CustomQuestionnaire from "@/pages/CustomQuestionnaire";
import Documentation from "@/pages/Documentation";
import Demo from "@/pages/Demo";
import StarterProject from "@/pages/StarterProject";
import ProjectStatus from "@/pages/ProjectStatus";
import StripeKeyManager from "@/pages/StripeKeyManager";
import NotFound from "@/pages/not-found";
import SignIn from "@/pages/SignIn";
import Register from "@/pages/Register";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/generation" component={Generation} />

      <Route path="/demo" component={Demo} />
      <Route path="/signin" component={SignIn} />
      <Route path="/register" component={Register} />
      <Route path="/starter-project" component={StarterProject} />
      <Route path="/stripe-keys" component={StripeKeyManager} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Home} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/categories" component={Categories} />
          <Route path="/questionnaire/:category" component={Questionnaire} />
          <Route path="/generation" component={Generation} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/teams" component={Teams} />
          <Route path="/templates" component={Templates} />
          <Route path="/billing" component={Billing} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/marketing" component={Marketing} />
          <Route path="/product-development" component={ProductDevelopment} />
          <Route path="/financial-planning" component={FinancialPlanning} />
          <Route path="/education" component={Education} />
          <Route path="/personal-development" component={PersonalDevelopment} />
          <Route path="/suggestions-demo" component={PromptSuggestionsDemo} />
          <Route path="/realtime-suggestions" component={RealTimeSuggestionsDemo} />
          <Route path="/feedback-analytics" component={FeedbackAnalyticsDemo} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/custom-questionnaire" component={CustomQuestionnaire} />
          <Route path="/documentation" component={Documentation} />
          <Route path="/project-status/:id" component={ProjectStatus} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
