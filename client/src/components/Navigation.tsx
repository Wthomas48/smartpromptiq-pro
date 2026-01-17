import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRatingSystemContext } from "@/components/RatingSystemProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, CreditCard, LogOut, ChevronDown, Settings, Menu, X, Users, Coins, Heart, Star, GraduationCap, ShoppingBag, Store, Mic, AudioWaveform, Palette, Music2, Puzzle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import BrainLogo from "@/components/BrainLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
    { href: "/categories", label: "Create Prompt", icon: null, badge: "Start Here!", special: true },
    { href: "/academy", label: "Academy", icon: GraduationCap, badge: "57 Courses", academySpecial: true },
    { href: "/builderiq", label: "BuilderIQ", icon: ShoppingBag, badge: "NEW", builderSpecial: true },
    { href: "/voice-builder", label: "Voice", icon: Mic, badge: "AI", voiceSpecial: true },
    { href: "/intro-outro-builder", label: "Intro/Outro", icon: AudioWaveform, badge: "Video", introSpecial: true },
    { href: "/suno-music-builder", label: "AI Song Studio", icon: Music2, badge: "AI", sunoSpecial: true },
    { href: "/design-studio", label: "Design", icon: Palette, badge: "Print", designSpecial: true },
    { href: "/app-builders", label: "App Market", icon: Store, badge: "100+", marketSpecial: true },
    { href: "/teams", label: "Teams", icon: Users, badge: null },
    { href: "/documentation", label: "Docs", icon: null, badge: null },
    { href: "/contact", label: "Contact", icon: null, badge: null }
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
            <BrainLogo size={32} animate={true} />
            <span className="text-xl font-bold text-slate-900 dark:text-white">SmartPromptIQ™</span>
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
                  } ${
                    (item as any).academySpecial ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/50 dark:border-purple-500/20 hover:shadow-md transition-all' : ''
                  } ${
                    (item as any).builderSpecial ? 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200/50 dark:border-teal-500/20 hover:shadow-md transition-all' : ''
                  } ${
                    (item as any).marketSpecial ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-500/20 hover:shadow-md transition-all' : ''
                  } ${
                    (item as any).voiceSpecial ? 'bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-900/20 dark:to-purple-900/20 border border-cyan-200/50 dark:border-cyan-500/20 hover:shadow-md transition-all' : ''
                  } ${
                    (item as any).introSpecial ? 'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200/50 dark:border-pink-500/20 hover:shadow-md transition-all' : ''
                  } ${
                    (item as any).sunoSpecial ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-500/20 hover:shadow-md transition-all' : ''
                  } ${
                    (item as any).designSpecial ? 'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200/50 dark:border-indigo-500/20 hover:shadow-md transition-all' : ''
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 h-5 text-xs font-bold rounded-full ${
                      item.special
                        ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm animate-pulse'
                        : (item as any).academySpecial
                        ? 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm'
                        : (item as any).builderSpecial
                        ? 'text-white bg-gradient-to-r from-teal-500 to-cyan-500 shadow-sm'
                        : (item as any).marketSpecial
                        ? 'text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm'
                        : (item as any).introSpecial
                        ? 'text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm'
                        : (item as any).sunoSpecial
                        ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm'
                        : (item as any).designSpecial
                        ? 'text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-sm'
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

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Token Balance Indicator */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <Coins className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{user?.tokenBalance || 0} tokens</span>
              </div>
            )}

            {/* Language Switcher - Hidden on mobile */}
            <div className="hidden sm:block">
              <LanguageSwitcher variant="compact" />
            </div>

            {/* Theme Toggle - ALWAYS VISIBLE */}
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
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
                    <Link href="/academy" className="flex items-center w-full cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <GraduationCap className="w-4 h-4 mr-2 text-purple-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">Academy</span>
                        <span className="text-xs text-gray-500">57 Courses Available</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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

                  <DropdownMenuItem asChild>
                    <Link href="/chrome-extension" className="flex items-center w-full cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Puzzle className="w-4 h-4 mr-2 text-purple-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">Chrome Extension</span>
                        <span className="text-xs text-gray-500">Coming Soon</span>
                      </div>
                    </Link>
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
          <div className="lg:hidden" id="mobile-menu" role="menu" aria-orientation="vertical">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {/* Theme Toggle in Mobile Menu */}
              <div className="flex items-center justify-between px-3 py-2 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <ThemeToggle />
              </div>
              {safeMap(mainNavItems, (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-all ${
                    location === item.href
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  } ${
                    (item as any).academySpecial ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-500/20' : ''
                  } ${
                    (item as any).builderSpecial ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 dark:from-teal-900/20 dark:to-cyan-900/20 dark:border-teal-500/20' : ''
                  } ${
                    (item as any).marketSpecial ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-500/20' : ''
                  } ${
                    (item as any).voiceSpecial ? 'bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200 dark:from-cyan-900/20 dark:to-purple-900/20 dark:border-cyan-500/20' : ''
                  } ${
                    (item as any).introSpecial ? 'bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 dark:from-pink-900/20 dark:to-rose-900/20 dark:border-pink-500/20' : ''
                  } ${
                    (item as any).sunoSpecial ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-500/20' : ''
                  } ${
                    (item as any).designSpecial ? 'bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 dark:from-indigo-900/20 dark:to-violet-900/20 dark:border-indigo-500/20' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  role="menuitem"
                >
                  <div className="flex items-center space-x-2">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 h-5 text-xs font-bold rounded-full ${
                      item.special
                        ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm animate-pulse'
                        : (item as any).academySpecial
                        ? 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm'
                        : (item as any).builderSpecial
                        ? 'text-white bg-gradient-to-r from-teal-500 to-cyan-500 shadow-sm'
                        : (item as any).marketSpecial
                        ? 'text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm'
                        : (item as any).voiceSpecial
                        ? 'text-white bg-gradient-to-r from-cyan-500 to-purple-500 shadow-sm'
                        : (item as any).introSpecial
                        ? 'text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm'
                        : (item as any).sunoSpecial
                        ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm'
                        : (item as any).designSpecial
                        ? 'text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-sm'
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
