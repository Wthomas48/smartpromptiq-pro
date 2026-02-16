import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRatingSystemContext } from "@/components/RatingSystemProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  User, CreditCard, LogOut, ChevronDown, ChevronLeft, ChevronRight, Settings, Menu,
  Users, Coins, Heart, Star, GraduationCap, ShoppingBag, Store, Mic, AudioWaveform,
  Palette, Music2, Puzzle, Bot, LayoutDashboard, Sparkles, FileText, HelpCircle,
  FolderOpen, TrendingUp, Briefcase, Calculator, BookOpen, UserCircle, X,
  Image as ImageIcon,
  Globe,
  Eye,
  Code2,
  Brain
} from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import BrainLogo from "@/components/BrainLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

// Sidebar context for managing collapsed state across components
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { isCollapsed: false, setIsCollapsed: () => {}, isMobileOpen: false, setIsMobileOpen: () => {} };
  }
  return context;
};

// Navigation item types
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Organized navigation sections
const navigationSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/categories", label: "Create Prompt", icon: Sparkles, badge: "Start", badgeColor: "from-purple-500 to-pink-500" },
    ]
  },
  {
    title: "AI Studio",
    items: [
      { href: "/academy", label: "Academy", icon: GraduationCap, badge: "57", badgeColor: "from-purple-600 to-indigo-600" },
      { href: "/builderiq", label: "BuilderIQ", icon: ShoppingBag, badge: "NEW", badgeColor: "from-teal-500 to-cyan-500" },
      { href: "/agents", label: "AI Agents", icon: Bot, badge: "Embed", badgeColor: "from-violet-500 to-purple-500" },
      { href: "/document-chat", label: "Doc Chat", icon: FileText, badge: "NEW", badgeColor: "from-amber-500 to-orange-500" },
      { href: "/web-search", label: "Web Search", icon: Globe, badge: "NEW", badgeColor: "from-blue-500 to-cyan-500" },
      { href: "/image-analysis", label: "Vision AI", icon: Eye, badge: "NEW", badgeColor: "from-purple-500 to-pink-500" },
      { href: "/code-interpreter", label: "Code Run", icon: Code2, badge: "NEW", badgeColor: "from-emerald-500 to-teal-500" },
      { href: "/memory", label: "Memory", icon: Brain, badge: "NEW", badgeColor: "from-indigo-500 to-violet-500" },
    ]
  },
  {
    title: "Creative Tools",
    items: [
      { href: "/voice-builder", label: "Voice AI", icon: Mic, badgeColor: "from-cyan-500 to-purple-500" },
      { href: "/intro-outro-builder", label: "Intro/Outro", icon: AudioWaveform, badgeColor: "from-pink-500 to-rose-500" },
      { href: "/suno-music-builder", label: "AI Music", icon: Music2, badgeColor: "from-purple-500 to-pink-500" },
      { href: "/image-generator", label: "Image AI", icon: ImageIcon, badge: "NEW", badgeColor: "from-emerald-500 to-teal-500" },
      { href: "/design-studio", label: "Design Studio", icon: Palette, badgeColor: "from-indigo-500 to-violet-500" },
    ]
  },
  {
    title: "Marketplace",
    items: [
      { href: "/app-builders", label: "App Market", icon: Store, badge: "100+", badgeColor: "from-orange-500 to-amber-500" },
      { href: "/teams", label: "Teams", icon: Users },
    ]
  },
  {
    title: "Categories",
    items: [
      { href: "/templates", label: "All Templates", icon: FolderOpen },
      { href: "/marketing", label: "Marketing", icon: TrendingUp },
      { href: "/product-development", label: "Product Dev", icon: Briefcase },
      { href: "/financial-planning", label: "Finance", icon: Calculator },
      { href: "/education", label: "Education", icon: BookOpen },
      { href: "/personal-development", label: "Personal", icon: UserCircle },
    ]
  },
  {
    title: "Support",
    items: [
      { href: "/documentation", label: "Documentation", icon: FileText },
      { href: "/contact", label: "Contact", icon: HelpCircle },
    ]
  }
];

// Single nav item component
function NavItemComponent({ item, isCollapsed, onClick }: { item: NavItem; isCollapsed: boolean; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === item.href;
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
        isActive
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn(
        "flex-shrink-0 transition-colors",
        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300",
        isCollapsed ? "w-5 h-5" : "w-4 h-4"
      )} />

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className={cn(
              "inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white bg-gradient-to-r shadow-sm",
              item.badgeColor || "from-indigo-500 to-indigo-600"
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}

      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className={cn(
              "inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white bg-gradient-to-r",
              item.badgeColor || "from-indigo-500 to-indigo-600"
            )}>
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// Sidebar section component
function SidebarSection({ section, isCollapsed, onItemClick }: { section: NavSection; isCollapsed: boolean; onItemClick?: () => void }) {
  return (
    <div className="mb-6">
      {!isCollapsed && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {section.title}
        </h3>
      )}
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavItemComponent key={item.href} item={item} isCollapsed={isCollapsed} onClick={onItemClick} />
        ))}
      </div>
    </div>
  );
}

// Desktop sidebar component
function DesktopSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (v: boolean) => void }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo area */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <Link href="/landing" className="flex items-center gap-2">
          <BrainLogo size={28} animate={true} />
          {!isCollapsed && (
            <span className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">
              SmartPromptIQ
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4 px-3">
        {navigationSections.map((section) => (
          <SidebarSection key={section.title} section={section} isCollapsed={isCollapsed} />
        ))}
      </ScrollArea>

      {/* Collapse toggle button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// Mobile sidebar sheet
function MobileSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <SheetTitle className="flex items-center gap-2">
            <BrainLogo size={24} animate={false} />
            <span className="text-lg font-bold">SmartPromptIQ</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] py-4 px-3">
          {navigationSections.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              isCollapsed={false}
              onItemClick={() => setIsOpen(false)}
            />
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Top bar component
function TopBar({ onMobileMenuClick }: { onMobileMenuClick: () => void }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { showRating } = useRatingSystemContext();
  const { isCollapsed } = useSidebar();

  const handleSignIn = () => setLocation('/signin');
  const handleLogout = () => logout();

  const handleGiveFeedback = () => {
    showRating({
      type: 'manual',
      context: { page: location, userInitiated: true, timestamp: Date.now() },
      category: 'general',
      priority: 'medium'
    });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-all duration-300",
        isAuthenticated && "lg:pl-64",
        isAuthenticated && isCollapsed && "lg:pl-[68px]"
      )}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {isAuthenticated && (
            <button
              onClick={onMobileMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo for mobile / non-authenticated */}
          {(!isAuthenticated || true) && (
            <Link href="/landing" className="flex lg:hidden items-center gap-2">
              <BrainLogo size={28} animate={true} />
              <span className="text-lg font-bold text-slate-900 dark:text-white">SmartPromptIQ</span>
            </Link>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Token Balance */}
          {isAuthenticated && (
            <Link href="/tokens" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-sm transition-shadow">
              <Coins className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {user?.tokenBalance || 0}
              </span>
            </Link>
          )}

          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher variant="compact" />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu / Auth buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {((user as any)?.firstName || user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium">
                    {(user as any)?.firstName || user?.name || "User"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* User info */}
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {(user as any)?.firstName || user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                <DropdownMenuItem asChild>
                  <Link href="/tokens" className="flex items-center cursor-pointer">
                    <Coins className="w-4 h-4 mr-2 text-indigo-600" />
                    Manage Tokens
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/billing" className="flex items-center cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/chrome-extension" className="flex items-center cursor-pointer">
                    <Puzzle className="w-4 h-4 mr-2 text-purple-500" />
                    Chrome Extension
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleGiveFeedback} className="cursor-pointer">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Rate & Feedback
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button size="sm" onClick={handleSignIn} className="bg-indigo-600 hover:bg-indigo-700">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Main Navigation component with Sidebar Provider
export default function Navigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setIsCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Close mobile menu on route change
  const [location] = useLocation();
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {/* Desktop Sidebar */}
      <DesktopSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />

      {/* Top Bar */}
      <TopBar onMobileMenuClick={() => setIsMobileOpen(true)} />
    </SidebarContext.Provider>
  );
}

// Export sidebar context hook and collapsed state for layout purposes
export { SidebarContext };
