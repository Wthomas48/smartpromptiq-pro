import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Questionnaire from "@/pages/Questionnaire";
import Generation from "@/pages/Generation";
import Dashboard from "@/pages/Dashboard";
import Teams from "@/pages/Teams";
import TeamDashboard from "@/pages/TeamDashboard";
import Templates from "@/pages/Templates";
import Billing from "@/pages/Billing";
import PricingPage from "@/pages/PricingPage";
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
import StripeKeyManager from "@/pages/StripeKeyManager";
import NotFound from "@/pages/not-found";
import SignIn from "@/pages/SignIn";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import AdminLogin from "@/pages/AdminLogin";

// Simple logout component
function LogoutPage() {
  const { logout } = useAuth();
  
  React.useEffect(() => {
    logout();
  }, [logout]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/demo" component={Demo} />
      <Route path="/signin" component={SignIn} />
      <Route path="/register" component={Register} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/stripe-keys" component={StripeKeyManager} />
      <Route path="/landing" component={Home} />
      <Route path="/logout" component={LogoutPage} />
      <Route path="/templates" component={Templates} />
      <Route path="/pricing" component={PricingPage} />
      
      {/* Conditional routing based on authentication */}
      {!isAuthenticated ? (
        // Show landing page for unauthenticated users
        <Route path="/" component={Home} />
      ) : (
        <>
          {/* Authenticated user routes */}
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/categories" component={Categories} />
          <Route path="/questionnaire/:category" component={Questionnaire} />
          <Route path="/generation" component={Generation} />
          <Route path="/teams" component={Teams} />
          <Route path="/team-dashboard" component={TeamDashboard} />
          <Route path="/billing" component={Billing} />
          <Route path="/pricing" component={PricingPage} />
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
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/custom-questionnaire" component={CustomQuestionnaire} />
          <Route path="/documentation" component={Documentation} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      
      {/* Fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
