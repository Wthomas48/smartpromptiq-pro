import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Import pages with fallbacks for missing ones
const Home = () => {
  try {
    const HomeComponent = require("@/pages/Home").default;
    return <HomeComponent />;
  } catch {
    return <div className="p-8 text-center">Home page - Under construction</div>;
  }
};

const Categories = () => {
  try {
    const CategoriesComponent = require("@/pages/Categories").default;
    return <CategoriesComponent />;
  } catch {
    return <div className="p-8 text-center">Categories page - Under construction</div>;
  }
};

const Questionnaire = () => {
  try {
    const QuestionnaireComponent = require("@/pages/Questionnaire").default;
    return <QuestionnaireComponent />;
  } catch {
    return <div className="p-8 text-center">Questionnaire page - Under construction</div>;
  }
};

const Generation = () => {
  try {
    const GenerationComponent = require("@/pages/Generation").default;
    return <GenerationComponent />;
  } catch {
    return <div className="p-8 text-center">Generation page - Under construction</div>;
  }
};

const Dashboard = () => {
  try {
    const DashboardComponent = require("@/pages/Dashboard").default;
    return <DashboardComponent />;
  } catch {
    return <div className="p-8 text-center">Dashboard page - Under construction</div>;
  }
};

const SignIn = () => {
  try {
    const SignInComponent = require("@/pages/SignIn").default;
    return <SignInComponent />;
  } catch {
    return <div className="p-8 text-center">SignIn page - Under construction</div>;
  }
};

const Register = () => {
  try {
    const RegisterComponent = require("@/pages/Register").default;
    return <RegisterComponent />;
  } catch {
    return <div className="p-8 text-center">Register page - Under construction</div>;
  }
};

const NotFound = () => <div className="p-8 text-center">404 - Page Not Found</div>;

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route path="/register" component={Register} />
      
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/categories" component={Categories} />
          <Route path="/questionnaire/:category" component={Questionnaire} />
          <Route path="/generation" component={Generation} />
        </>
      ) : (
        <Route path="/" component={Home} />
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
