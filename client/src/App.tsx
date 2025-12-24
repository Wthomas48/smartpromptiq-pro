import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { RatingSystemProvider } from "@/components/RatingSystemProvider";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Questionnaire from "@/pages/Questionnaire";
import Generation from "@/pages/Generation";
import Dashboard from "@/pages/Dashboard";
import DashboardSimple from "@/pages/DashboardSimple";
import DashboardWorking from "@/pages/DashboardWorking";
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
import SignUp from "@/pages/SignUp";
import AdminLogin from "@/pages/AdminLogin";
import AuthFormTest from "@/pages/AuthFormTest";
import StripeKeyManager from "@/pages/StripeKeyManager";
import { SupabaseSignupTest } from "@/components/SupabaseSignupTest";
import LogoutPage from "@/pages/LogoutPage";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";
import AcademyNavigation from "@/components/AcademyNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminRoute from "@/components/AdminRoute";
import { SecurityProvider } from "@/components/SecurityProvider";
import Academy from "@/pages/Academy";
import AcademyCourses from "@/pages/AcademyCourses";
import AcademyCourseDetail from "@/pages/AcademyCourseDetail";
import AcademyDashboard from "@/pages/AcademyDashboard";
import AcademyLessonViewer from "@/pages/AcademyLessonViewer";
import AcademyDocumentation from "@/pages/AcademyDocumentation";
import AcademyReviews from "@/pages/AcademyReviews";
import AcademyFAQ from "@/pages/AcademyFAQ";
import AcademySignIn from "@/pages/AcademySignIn";
import AcademySignUp from "@/pages/AcademySignUp";
import AcademySearch from "@/pages/AcademySearch";
import AcademyLearningPaths from "@/pages/AcademyLearningPaths";
import Contact from "@/pages/Contact";
import Onboarding from "@/pages/Onboarding";
// BuilderIQ - App Creation Platform
import BuilderIQ from "@/pages/BuilderIQ";
import BuilderIQQuestionnaire from "@/pages/BuilderIQQuestionnaire";
import BuilderIQBlueprint from "@/pages/BuilderIQBlueprint";
import BuilderIQTemplates from "@/pages/BuilderIQTemplates";
import BuilderIQAgents from "@/pages/BuilderIQAgents";
import BuilderIQPreview from "@/pages/BuilderIQPreview";
// Gamification & Marketplace
import GamificationDashboard from "@/pages/GamificationDashboard";
import Marketplace from "@/pages/Marketplace";
import { GamificationProvider } from "@/contexts/GamificationContext";
// Prompt Hub - Playground, Deployment, Builder Marketplace
import PromptPlayground from "@/pages/PromptPlayground";
import DeploymentHub from "@/pages/DeploymentHub";
import AppBuilderMarketplace from "@/pages/AppBuilderMarketplace";
// BuilderIQ Story Analysis - Analyze user stories for app suggestions
import BuilderIQStoryAnalysis from "@/pages/BuilderIQStoryAnalysis";
// Voice Builder - AI Voice Generation
import VoiceBuilder from "@/pages/VoiceBuilder";
// Intro & Outro Music Builder
import IntroOutroBuilder from "@/pages/IntroOutroBuilder";
// Suno AI Music Builder - Prompt-to-Suno Workflow
import SunoMusicBuilder from "@/pages/SunoMusicBuilder";
// Video Builder - Short Video Creation
import VideoBuilder from "@/pages/VideoBuilder";
// AI Design Studio & Print Shop
import DesignStudio from "@/pages/DesignStudio";
// Chrome Extension Landing Page
import ChromeExtension from "@/pages/ChromeExtension";
// Accessibility Settings
import AccessibilitySettings from "@/pages/AccessibilitySettings";
// ElevenLabs Voice System
import { ElevenLabsVoiceProvider } from "@/contexts/ElevenLabsVoiceContext";
import GlobalVoiceWidget from "@/components/GlobalVoiceWidget";
// Audio Store - Cross-builder audio transfer
import { AudioStoreProvider } from "@/contexts/AudioStoreContext";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [forceLoad, setForceLoad] = React.useState(false);

  // Force load after 3 seconds to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Force loading app after timeout');
      setForceLoad(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Check if current route is admin route
  const isAdminRoute = location.startsWith('/admin');

  // Check if current route is academy route
  const isAcademyRoute = location.startsWith('/academy');

  // Check if current route is builderiq route
  // BuilderIQ should show navigation like other pages
  const isBuilderIQRoute = false; // BuilderIQ is now part of main app flow with navigation

  // Show loading state while checking authentication (with timeout)
  if (isLoading && !forceLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">If this takes too long, we'll load the app anyway</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Skip Link for Keyboard/Screen Reader Users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="min-h-screen bg-gray-50">
        {/* Show appropriate navigation based on route */}
        <header role="banner">
          {!isAdminRoute && !isAcademyRoute && !isBuilderIQRoute && <Navigation />}
          {isAcademyRoute && <AcademyNavigation />}
        </header>

        <main id="main-content" role="main" tabIndex={-1}>
          <Switch>
        {/* Public routes - always accessible */}
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/demo" component={Demo} />
        <Route path="/signin" component={SignIn} />
        <Route path="/register" component={Register} />
        <Route path="/signup" component={SignUp} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/auth-test" component={AuthFormTest} />
        <Route path="/supabase-test" component={SupabaseSignupTest} />
        <Route path="/admin" component={() => <AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/dashboard" component={() => <AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/stripe-keys" component={StripeKeyManager} />
        <Route path="/landing" component={Home} />
        <Route path="/logout" component={LogoutPage} />
        <Route path="/templates" component={Templates} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/chrome-extension" component={ChromeExtension} />
        <Route path="/extension" component={ChromeExtension} />
        <Route path="/accessibility" component={AccessibilitySettings} />
        <Route path="/accessibility-settings" component={AccessibilitySettings} />
        <Route path="/verify-email/:token" component={VerifyEmail} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password/:token" component={ResetPassword} />

      {/* BuilderIQ Routes - App Creation Platform */}
      <Route path="/builderiq" component={BuilderIQ} />
      <Route path="/builderiq/questionnaire" component={BuilderIQQuestionnaire} />
      <Route path="/builderiq/preview" component={BuilderIQPreview} />
      <Route path="/builderiq/blueprint" component={BuilderIQBlueprint} />
      <Route path="/builderiq/templates" component={BuilderIQTemplates} />
      <Route path="/builderiq/templates/:industry" component={BuilderIQTemplates} />
      <Route path="/builderiq/agents" component={BuilderIQAgents} />
      <Route path="/builderiq/story" component={BuilderIQStoryAnalysis} />

      {/* Academy Routes */}
      <Route path="/academy" component={Academy} />
      <Route path="/academy/signin" component={AcademySignIn} />
      <Route path="/academy/signup" component={AcademySignUp} />
      <Route path="/academy/search" component={AcademySearch} />
      <Route path="/academy/courses" component={AcademyCourses} />
      <Route path="/academy/course/:slug" component={AcademyCourseDetail} />
      <Route path="/academy/lesson/:lessonId" component={AcademyLessonViewer} />
      <Route path="/academy/dashboard" component={AcademyDashboard} />
      <Route path="/academy/documentation" component={AcademyDocumentation} />
      <Route path="/academy/reviews" component={AcademyReviews} />
      <Route path="/academy/faq" component={AcademyFAQ} />
      <Route path="/academy/paths" component={AcademyLearningPaths} />
      <Route path="/academy/learning-paths" component={AcademyLearningPaths} />

      {/* ALL ROUTES NOW PUBLICLY ACCESSIBLE - FULL ADMIN ACCESS */}
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/categories" component={Categories} />
      <Route path="/questionnaire/:category" component={Questionnaire} />
      <Route path="/generation" component={Generation} />
      <Route path="/generate" component={Generation} />
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
      <Route path="/contact" component={Contact} />

      {/* Gamification & Marketplace */}
      <Route path="/rewards" component={GamificationDashboard} />
      <Route path="/progress" component={GamificationDashboard} />
      <Route path="/marketplace" component={Marketplace} />

      {/* Prompt Hub - Playground, Deployment, Builder Marketplace */}
      <Route path="/playground" component={PromptPlayground} />
      <Route path="/deployment-hub" component={DeploymentHub} />
      <Route path="/app-builders" component={AppBuilderMarketplace} />
      <Route path="/builders" component={AppBuilderMarketplace} />

      {/* Voice Builder - AI Voice Generation */}
      <Route path="/voice-builder" component={VoiceBuilder} />
      <Route path="/voice" component={VoiceBuilder} />

      {/* Intro & Outro Music Builder */}
      <Route path="/intro-outro-builder" component={IntroOutroBuilder} />
      <Route path="/intro-builder" component={IntroOutroBuilder} />

      {/* Suno AI Music Builder - Prompt-to-Suno Workflow */}
      <Route path="/suno-music-builder" component={SunoMusicBuilder} />
      <Route path="/suno" component={SunoMusicBuilder} />
      <Route path="/music-builder" component={SunoMusicBuilder} />

      {/* Video Builder - Short Video Creation */}
      <Route path="/video-builder" component={VideoBuilder} />
      <Route path="/video" component={VideoBuilder} />

      {/* AI Design Studio & Print Shop */}
      <Route path="/design-studio" component={DesignStudio} />
      <Route path="/design" component={DesignStudio} />
      <Route path="/print-shop" component={DesignStudio} />
      <Route path="/ai-art" component={DesignStudio} />

            {/* Fallback route */}
            <Route component={NotFound} />
          </Switch>
        </main>

        {/* Footer for accessibility */}
        <footer role="contentinfo" className="sr-only">
          <p>SmartPromptIQ - AI-Powered Prompt Engineering Platform</p>
        </footer>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <SecurityProvider>
            <TooltipProvider>
              <RatingSystemProvider>
                <GamificationProvider>
                  <AudioStoreProvider>
                    <ElevenLabsVoiceProvider>
                      <Toaster />
                      <Router />
                      {/* Global Voice Widget - Available on all pages */}
                      <GlobalVoiceWidget position="bottom-right" />
                    </ElevenLabsVoiceProvider>
                  </AudioStoreProvider>
                </GamificationProvider>
              </RatingSystemProvider>
            </TooltipProvider>
          </SecurityProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;