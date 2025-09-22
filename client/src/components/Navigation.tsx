import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRatingSystemContext } from "@/components/RatingSystemProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, CreditCard, LogOut, ChevronDown, Settings, Menu, X, Users, Coins, Heart, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { safeMap, ensureArray } from "@/utils/arrayUtils";

export default function Navigation() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { showRating } = useRatingSystemContext();
  
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleSignIn = () => {
    setLocation('/signin');
  };

  const handleLogout = () => {
    logout();
  };

  const handleGiveFeedback = () => {
    showRating({
      type: 'manual',
      context: {
        page: location,
        userInitiated: true,
        timestamp: Date.now()
      },
      category: 'general',
      priority: 'medium'
    });
  };


  // Navigation items for better organization
  const mainNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: null, badge: null },
    { href: "/teams", label: "Teams 🚀", icon: Users, badge: "4 Active", special: true },
    { href: "/categories", label: "Create New", icon: null, badge: null },
    { href: "/documentation", label: "Docs", icon: null, badge: null }
  ];

  const categoryNavItems = [
    { href: "/templates", label: "All Templates" },
    { href: "/marketing", label: "Marketing" },
    { href: "/product-development", label: "Product Development" },
    { href: "/financial-planning", label: "Financial Planning" },
    { href: "/education", label: "Education" },
    { href: "/personal-development", label: "Personal Development" }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="nav-blur sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center space-x-3" aria-label="SmartPromptIQ Home">
            <Logo size={32} />
            <span className="text-xl font-bold text-slate-900 dark:text-white">SmartPromptIQ</span>
          </Link>
          
          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-1">
              {safeMap(mainNavItems, (item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 relative ${
                    location === item.href
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  } ${
                    item.special ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-500/20 hover:shadow-md transition-all' : ''
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 h-5 text-xs font-bold rounded-full ${
                      item.special
                        ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm animate-pulse'
                        : 'text-white bg-indigo-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              
              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1">
                    <span>Categories</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {safeMap(categoryNavItems, (item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="w-full">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="flex items-center space-x-3">
            {/* Token Balance Indicator */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 rounded-lg border border-indigo-200">
                <Coins className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">{user?.tokenBalance || 0} tokens</span>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            
            {/* User menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {(user as any)?.firstName || user?.name || "User"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link href="/tokens" className="flex items-center w-full cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Coins className="w-4 h-4 mr-2 text-indigo-600" />
                      Manage Tokens
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/billing" className="flex items-center w-full cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Billing & Subscription
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center w-full cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => showRating({
                      type: 'manual',
                      context: { source: 'navigation_menu' },
                      category: 'general',
                      priority: 'medium'
                    })}
                    className="flex items-center w-full cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    Rate App Performance
                  </DropdownMenuItem>


                  <DropdownMenuItem
                    onClick={handleGiveFeedback}
                    className="cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    Give Feedback
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignIn}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {safeMap(mainNavItems, (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                    location === item.href
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 h-5 text-xs font-bold rounded-full ${
                      item.special
                        ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm animate-pulse'
                        : 'text-white bg-indigo-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Categories</div>
                {categoryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
    </nav>
  );
}
