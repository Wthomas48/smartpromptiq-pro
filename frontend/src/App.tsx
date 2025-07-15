// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navigation from './components/Navigation';

// Main Pages - Your existing components
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

// Core Components - Connect your existing files
import PromptBuilder from './components/PromptBuilder';
import Analytics from './components/Analytics';
import Templates from './components/Templates';
import Categories from './components/Categories';
import QuickStart from './components/QuickStart';
import Questionnaire from './components/Questionnaire';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';

// Simple placeholder for missing components
const PlaceholderPage = ({ title, description }: { title: string; description?: string }) => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-xl text-gray-600 mb-8">
        {description || 'This feature is ready to be connected...'}
      </p>
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
        <p className="text-gray-500">Component exists and ready for connection.</p>
        <p className="text-sm text-gray-400 mt-2">Check your components folder!</p>
      </div>
      <div className="mt-8">
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navigation />
          <Routes>
            {/* 🏠 MAIN PAGES */}
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* 🔧 CORE FEATURES - Your existing components */}
            <Route path="/create" element={<PromptBuilder />} />
            <Route path="/prompt-builder" element={<PromptBuilder />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/quick-start" element={<QuickStart />} />
            
            {/* 👑 ADMIN ROUTES */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            
            {/* 📊 ANALYTICS & TRACKING */}
            <Route path="/usage" element={<PlaceholderPage title="Usage Tracker" description="Track your prompt usage and performance" />} />
            <Route path="/history" element={<PlaceholderPage title="Activity History" description="View your complete activity history" />} />
            
            {/* 👤 USER & PROFILE */}
            <Route path="/profile" element={<PlaceholderPage title="User Profile" description="Manage your profile and preferences" />} />
            <Route path="/login" element={<PlaceholderPage title="Sign In" description="Access your SmartPromptIQ account" />} />
            <Route path="/signup" element={<PlaceholderPage title="Sign Up" description="Create your SmartPromptIQ account" />} />
            
            {/* 💼 WORKSPACE & COLLABORATION */}
            <Route path="/workspace" element={<PlaceholderPage title="Team Workspace" description="Collaborate with your team" />} />
            <Route path="/saved" element={<PlaceholderPage title="Saved Prompts" description="Your saved and favorited prompts" />} />
            <Route path="/shared" element={<PlaceholderPage title="Shared Prompts" description="Prompts shared with you" />} />
            
            {/* 💳 BILLING & SUBSCRIPTION */}
            <Route path="/billing" element={<PlaceholderPage title="Billing" description="Manage your subscription and billing" />} />
            <Route path="/tokens" element={<PlaceholderPage title="Token Balance" description="Monitor your token usage" />} />
            
            {/* 🚀 ADVANCED FEATURES */}
            <Route path="/optimization" element={<PlaceholderPage title="Prompt Optimization" description="AI-powered prompt optimization" />} />
            <Route path="/refinement" element={<PlaceholderPage title="Prompt Refinement" description="Refine and improve your prompts" />} />
            <Route path="/suggestions" element={<PlaceholderPage title="AI Suggestions" description="Get AI-powered suggestions" />} />
            
            {/* ❓ HELP & SUPPORT */}
            <Route path="/help" element={<PlaceholderPage title="Help Center" description="Get help and support" />} />
            <Route path="/docs" element={<PlaceholderPage title="Documentation" description="API and user documentation" />} />
            <Route path="/tutorials" element={<PlaceholderPage title="Tutorials" description="Learn how to use SmartPromptIQ" />} />
            <Route path="/faq" element={<PlaceholderPage title="FAQ" description="Frequently asked questions" />} />
            
            {/* 🔧 ADMIN & MANAGEMENT */}
            <Route path="/cache" element={<PlaceholderPage title="Cache Management" description="Manage system cache and performance" />} />
            <Route path="/feedback" element={<PlaceholderPage title="Feedback" description="Send feedback and suggestions" />} />
            
            {/* 📝 SPECIFIC PROMPT ROUTES */}
            <Route path="/prompt/:id" element={<PlaceholderPage title="Prompt Details" description="View and edit specific prompt" />} />
            <Route path="/template/:id" element={<PlaceholderPage title="Template Details" description="View and use specific template" />} />
            <Route path="/category/:slug" element={<PlaceholderPage title="Category View" description="Browse prompts by category" />} />
            
            {/* 🔍 SEARCH & DISCOVERY */}
            <Route path="/search" element={<PlaceholderPage title="Search Results" description="Find prompts and templates" />} />
            <Route path="/trending" element={<PlaceholderPage title="Trending" description="Discover trending prompts" />} />
            <Route path="/popular" element={<PlaceholderPage title="Popular" description="Most popular prompts and templates" />} />
            
            {/* 🏆 GAMIFICATION ROUTES */}
            <Route path="/achievements" element={<PlaceholderPage title="Achievements" description="View your achievements and progress" />} />
            <Route path="/leaderboard" element={<PlaceholderPage title="Leaderboard" description="See top performers" />} />
            <Route path="/challenges" element={<PlaceholderPage title="Challenges" description="Daily and weekly challenges" />} />
            
            {/* 🔌 API & INTEGRATIONS */}
            <Route path="/api" element={<PlaceholderPage title="API Access" description="Manage API keys and integrations" />} />
            <Route path="/webhooks" element={<PlaceholderPage title="Webhooks" description="Configure webhook endpoints" />} />
            <Route path="/exports" element={<PlaceholderPage title="Data Export" description="Export your data" />} />
            
            {/* 📱 MOBILE SPECIFIC */}
            <Route path="/mobile" element={<PlaceholderPage title="Mobile App" description="Download our mobile app" />} />
            
            {/* ⚠️ ERROR HANDLING */}
            <Route path="/error" element={<PlaceholderPage title="Error" description="Something went wrong" />} />
            <Route path="/maintenance" element={<PlaceholderPage title="Maintenance" description="System maintenance in progress" />} />
            
            {/* ⭐ SPECIAL PAGES */}
            <Route path="/welcome" element={<PlaceholderPage title="Welcome!" description="Welcome to SmartPromptIQ" />} />
            <Route path="/onboarding" element={<PlaceholderPage title="Getting Started" description="Let's set up your account" />} />
            <Route path="/success" element={<PlaceholderPage title="Success!" description="Action completed successfully" />} />
            
            {/* 🏪 MARKETPLACE (Future) */}
            <Route path="/marketplace" element={<PlaceholderPage title="Marketplace" description="Browse and share prompt templates" />} />
            <Route path="/store" element={<PlaceholderPage title="Template Store" description="Premium templates and add-ons" />} />
            
            {/* 📈 ADVANCED ANALYTICS */}
            <Route path="/reports" element={<PlaceholderPage title="Reports" description="Generate detailed reports" />} />
            <Route path="/insights" element={<PlaceholderPage title="AI Insights" description="AI-powered insights and recommendations" />} />
            
            {/* 🔒 SECURITY */}
            <Route path="/security" element={<PlaceholderPage title="Security Settings" description="Manage security and privacy" />} />
            <Route path="/audit" element={<PlaceholderPage title="Audit Log" description="Security and activity audit log" />} />
            
            {/* ⭐ PREMIUM FEATURES */}
            <Route path="/premium" element={<PlaceholderPage title="Premium Features" description="Upgrade to unlock premium features" />} />
            <Route path="/enterprise" element={<PlaceholderPage title="Enterprise" description="Enterprise solutions" />} />
            
            {/* 📞 CONTACT & SUPPORT */}
            <Route path="/contact" element={<PlaceholderPage title="Contact Us" description="Get in touch with our team" />} />
            <Route path="/support" element={<PlaceholderPage title="Support" description="Get help from our support team" />} />
            
            {/* ⚖️ LEGAL */}
            <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="Our privacy policy" />} />
            <Route path="/terms" element={<PlaceholderPage title="Terms of Service" description="Terms and conditions" />} />
            <Route path="/cookies" element={<PlaceholderPage title="Cookie Policy" description="How we use cookies" />} />
            
            {/* 🚫 CATCH-ALL - 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist. It might have been moved or deleted.
                  </p>
                  <div className="space-x-4">
                    <a 
                      href="/" 
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Go Home
                    </a>
                    <a 
                      href="/dashboard" 
                      className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Dashboard
                    </a>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;