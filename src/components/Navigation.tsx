import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CreditCard, LogOut, ChevronDown, Shield, Lock, Eye, EyeOff, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Admin access state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user has admin role (extend this based on your user schema)
  const hasAdminAccess = user && ((user as any).role === 'admin' || (user as any).email === 'admin@smartpromptiq.net' || (user as any).email === 'wthomas19542@gmail.com');

  const handleSignIn = () => {
    setLocation('/signin');
  };

  const handleLogout = () => {
    logout();
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call backend to verify admin credentials
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminCredentials)
      });
      
      if (response.ok) {
        setIsAdminUser(true);
        setShowAdminLogin(false);
        toast({
          title: "Admin Access Granted",
          description: "You now have administrative privileges.",
        });
        // Redirect to admin dashboard
        setLocation('/admin');
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin credentials.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify admin credentials.",
        variant: "destructive"
      });
    }
    
    setAdminCredentials({ email: '', password: '' });
  };

  // Navigation items for better organization
  const mainNavItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/templates", label: "Templates" },
    { href: "/categories", label: "Create New" },
    { href: "/billing", label: "Pricing" },
    { href: "/documentation", label: "Docs" }
  ];

  const categoryNavItems = [
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
    <nav className="nav-blur sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Logo size={32} />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Smart PromptIQ</span>
          </Link>
          
          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-1">
              {mainNavItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${
                    location === item.href 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {item.label}
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
                  {categoryNavItems.map((item) => (
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
                  
                  {/* Admin Access - Show different options based on user role */}
                  {hasAdminAccess || isAdminUser ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center w-full cursor-pointer px-2 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => setShowAdminLogin(true)}
                      className="cursor-pointer px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Admin Access
                    </DropdownMenuItem>
                  )}
                  
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
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === item.href
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
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
      
      {/* Admin Login Modal */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Admin Access</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Enter your admin credentials to access the administrative panel.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="text-gray-700 dark:text-gray-300">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                placeholder="admin@smartpromptiq.net"
                value={adminCredentials.email}
                onChange={(e) => setAdminCredentials({...adminCredentials, email: e.target.value})}
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div>
              <Label htmlFor="admin-password" className="text-gray-700 dark:text-gray-300">Admin Password</Label>
              <div className="relative mt-1">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter admin password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                  className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-xs text-red-600 dark:text-red-400">
                ?? Admin access is logged and monitored. Unauthorized access attempts will be reported.
              </p>
            </div>
            
            <DialogFooter className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdminLogin(false)}
                className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Access Admin Panel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
