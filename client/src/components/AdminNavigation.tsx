import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Shield, Users, Activity, Settings, Database, BarChart3,
  Mail, Bell, Lock, Globe, Server, Coins, FileText,
  ChevronDown, LogOut, Home, Menu, X
} from 'lucide-react';

interface AdminNavigationProps {
  adminUser: any;
  onLogout: () => void;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ adminUser, onLogout }) => {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminMenuItems = [
    {
      label: 'Dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      path: '/admin',
      description: 'Overview & Analytics'
    },
    {
      label: 'User Management',
      icon: <Users className="h-4 w-4" />,
      path: '/admin/users',
      description: 'Manage all users'
    },
    {
      label: 'System Monitor',
      icon: <Server className="h-4 w-4" />,
      path: '/admin/system',
      description: 'System health & logs'
    },
    {
      label: 'Database Admin',
      icon: <Database className="h-4 w-4" />,
      path: '/admin/database',
      description: 'Database management'
    },
    {
      label: 'Email Center',
      icon: <Mail className="h-4 w-4" />,
      path: '/admin/emails',
      description: 'Email campaigns & logs'
    },
    {
      label: 'Security Center',
      icon: <Lock className="h-4 w-4" />,
      path: '/admin/security',
      description: 'Security & permissions'
    },
    {
      label: 'API Management',
      icon: <Globe className="h-4 w-4" />,
      path: '/admin/api',
      description: 'API keys & usage'
    },
    {
      label: 'Financial Reports',
      icon: <Coins className="h-4 w-4" />,
      path: '/admin/finance',
      description: 'Revenue & billing'
    },
    {
      label: 'Content Manager',
      icon: <FileText className="h-4 w-4" />,
      path: '/admin/content',
      description: 'Manage app content'
    },
    {
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      path: '/admin/settings',
      description: 'Admin preferences'
    }
  ];

  const appAccessItems = [
    {
      label: 'User Dashboard',
      icon: <Home className="h-4 w-4" />,
      path: '/dashboard',
      description: 'View as regular user'
    },
    {
      label: 'Generate Prompts',
      icon: <Activity className="h-4 w-4" />,
      path: '/generation',
      description: 'Create prompts'
    },
    {
      label: 'Categories',
      icon: <FileText className="h-4 w-4" />,
      path: '/categories',
      description: 'Browse categories'
    },
    {
      label: 'Templates',
      icon: <FileText className="h-4 w-4" />,
      path: '/templates',
      description: 'Prompt templates'
    },
    {
      label: 'User Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      path: '/analytics',
      description: 'User analytics view'
    }
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-red-100 text-xs">SmartPromptIQ</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Admin Functions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-red-700/50">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Tools
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                {adminMenuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center space-x-3 p-3 cursor-pointer"
                  >
                    {item.icon}
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* App Access Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-red-700/50">
                  <Home className="h-4 w-4 mr-2" />
                  App Access
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <div className="p-2 text-xs text-gray-500 font-medium">
                  Full access to all user features
                </div>
                <DropdownMenuSeparator />
                {appAccessItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center space-x-3 p-3 cursor-pointer"
                  >
                    {item.icon}
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin Info & Logout */}
            <div className="flex items-center space-x-4 border-l border-red-300 pl-4">
              <div className="text-right">
                <p className="font-medium text-sm">{adminUser?.firstName} {adminUser?.lastName}</p>
                <p className="text-red-100 text-xs">{adminUser?.email}</p>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="border-red-300 text-white hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-red-700/50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-red-300 pt-4 pb-4">
            <div className="space-y-2">
              {/* Admin info */}
              <div className="px-4 py-2 border-b border-red-300 mb-4">
                <p className="font-medium">{adminUser?.firstName} {adminUser?.lastName}</p>
                <p className="text-red-100 text-sm">{adminUser?.email}</p>
              </div>

              {/* Admin Tools */}
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-red-100 mb-2">Admin Tools</p>
                <div className="space-y-1">
                  {adminMenuItems.slice(0, 5).map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => handleNavigation(item.path)}
                      className="w-full justify-start text-white hover:bg-red-700/50"
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* App Access */}
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-red-100 mb-2">App Access</p>
                <div className="space-y-1">
                  {appAccessItems.slice(0, 3).map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => handleNavigation(item.path)}
                      className="w-full justify-start text-white hover:bg-red-700/50"
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <div className="px-4 pt-4 border-t border-red-300">
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="w-full border-red-300 text-white hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavigation;