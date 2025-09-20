import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { RatingSystemProvider } from "@/components/RatingSystemProvider";
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
import TokensPage from "@/pages/TokensPage";
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
import Settings from "@/pages/Settings";
import Demo from "@/pages/Demo";
import SignIn from "@/pages/SignIn";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import StripeKeyManager from "@/pages/StripeKeyManager";
import LogoutPage from "@/pages/LogoutPage";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        {/* Public routes - always accessible */}
        <Route path="/demo" component={Demo} />
        <Route path="/signin" component={SignIn} />
        <Route path="/register" component={Register} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/stripe-keys" component={StripeKeyManager} />
        <Route path="/landing" component={Home} />
        <Route path="/logout" component={LogoutPage} />
        <Route path="/templates" component={Templates} />
        <Route path="/pricing" component={PricingPage} />

      {/* ALL ROUTES NOW PUBLICLY ACCESSIBLE - FULL ADMIN ACCESS */}
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/categories" component={Categories} />
      <Route path="/questionnaire/:category" component={Questionnaire} />
      <Route path="/generation" component={Generation} />
      <Route path="/teams" component={Teams} />
      <Route path="/team-dashboard" component={TeamDashboard} />
      <Route path="/billing" component={Billing} />
      <Route path="/tokens" component={TokensPage} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/product-development" component={ProductDevelopment} />
      <Route path="/financial-planning" component={FinancialPlanning} />
      <Route path="/education" component={Education} />
      <Route path="/personal-development" component={PersonalDevelopment} />
      <Route path="/suggestions-demo" component={PromptSuggestionsDemo} />
      <Route path="/realtime-suggestions" component={RealTimeSuggestionsDemo} />
      <Route path="/feedback-analytics" component={FeedbackAnalyticsDemo} />
      <Route path="/custom-questionnaire" component={CustomQuestionnaire} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/settings" component={Settings} />

      {/* Fallback route */}
      <Route component={NotFound} />
    </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <RatingSystemProvider>
            <Toaster />
            <Router />
          </RatingSystemProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;