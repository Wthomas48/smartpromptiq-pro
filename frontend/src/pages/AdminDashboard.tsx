import React, { useState, useEffect } from 'react';
import { Users, Activity, CreditCard, AlertTriangle, TrendingUp, Calendar, Search, Filter, Eye, Key, Shield, Lock, Unlock, RefreshCw, Mail, Clock } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  
  // Password Reset & Security Modals
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showStripeKeysModal, setShowStripeKeysModal] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [tokenAdjustment, setTokenAdjustment] = useState('');
  const [stripeKeys, setStripeKeys] = useState({
    publishableKey: '',
    secretKey: '',
    webhookSecret: ''
  });
  const [showKeys, setShowKeys] = useState({
    publishableKey: false,
    secretKey: false,
    webhookSecret: false
  });
  
  const { toast } = useToast();

  // Enhanced test data with security fields
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 2847,
    activeUsers: 1923,
    totalRevenue: 47829,
    monthlyGrowth: 12.5,
    tierBreakdown: {
      free: 1245,
      pro: 1389,
      enterprise: 213
    },
    recentActivity: [
      { id: 1, user: 'john@example.com', action: 'Upgraded to Pro', tier: 'pro', timestamp: '2 mins ago', tokens: 500 },
      { id: 2, user: 'sarah@company.com', action: 'Token usage: 95%', tier: 'free', timestamp: '5 mins ago', tokens: 95 },
      { id: 3, user: 'team@startup.io', action: 'Created custom template', tier: 'enterprise', timestamp: '12 mins ago', tokens: 'unlimited' },
      { id: 4, user: 'user@domain.com', action: 'Payment failed', tier: 'pro', timestamp: '18 mins ago', tokens: 0 },
      { id: 5, user: 'admin@bigcorp.com', action: 'Bulk token usage', tier: 'enterprise', timestamp: '22 mins ago', tokens: 'unlimited' }
    ],
    users: [
      { id: 1, email: 'john@example.com', tier: 'pro', tokensUsed: 347, tokensLimit: 500, lastActive: '2025-06-14', revenue: 19.99, status: 'active', lastPasswordReset: '2025-05-12', loginAttempts: 0, accountLocked: false, lastLogin: '2025-06-15 14:30', passwordExpires: '2025-08-12', twoFactorEnabled: true },
      { id: 2, email: 'sarah@company.com', tier: 'free', tokensUsed: 9, tokensLimit: 10, lastActive: '2025-06-13', revenue: 0, status: 'active', lastPasswordReset: '2025-03-20', loginAttempts: 2, accountLocked: false, lastLogin: '2025-06-15 13:45', passwordExpires: '2025-07-20', twoFactorEnabled: false },
      { id: 3, email: 'team@startup.io', tier: 'enterprise', tokensUsed: 2847, tokensLimit: 'unlimited', lastActive: '2025-06-14', revenue: 99.99, status: 'active', lastPasswordReset: '2025-06-01', loginAttempts: 0, accountLocked: false, lastLogin: '2025-06-15 12:15', passwordExpires: '2025-09-01', twoFactorEnabled: true },
      { id: 4, email: 'user@domain.com', tier: 'pro', tokensUsed: 0, tokensLimit: 500, lastActive: '2025-06-10', revenue: 0, status: 'payment_failed', lastPasswordReset: '2025-04-15', loginAttempts: 5, accountLocked: true, lastLogin: '2025-06-12 10:15', passwordExpires: '2025-07-15', twoFactorEnabled: false },
      { id: 5, email: 'designer@creative.com', tier: 'pro', tokensUsed: 234, tokensLimit: 500, lastActive: '2025-06-15', revenue: 19.99, status: 'active', lastPasswordReset: '2025-02-15', loginAttempts: 4, accountLocked: false, lastLogin: '2025-06-15 09:30', passwordExpires: '2025-06-15', twoFactorEnabled: false }
    ],
    passwordResetHistory: [
      { id: 1, userId: 5, email: 'designer@creative.com', reason: 'Password expired', resetBy: 'admin@smartpromptiq.net', timestamp: '2025-06-15 08:30', method: 'force_reset' },
      { id: 2, userId: 4, email: 'user@domain.com', reason: 'Account locked - too many attempts', resetBy: 'admin@smartpromptiq.net', timestamp: '2025-06-12 11:00', method: 'unlock_and_reset' },
      { id: 3, userId: 2, email: 'sarah@company.com', reason: 'User requested reset', resetBy: 'system', timestamp: '2025-06-13 09:15', method: 'user_requested' },
      { id: 4, userId: 1, email: 'john@example.com', reason: 'Suspicious activity detected', resetBy: 'security@smartpromptiq.net', timestamp: '2025-06-10 10:30', method: 'security_reset' }
    ]
  });

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'payment_failed': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = dashboardData.users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || user.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const getTokenUsagePercentage = (used: number, limit: number | string) => {
    if (limit === 'unlimited') return 0;
    return (used / (limit as number)) * 100;
  };

  // Password Reset & Security Functions
  const handlePasswordReset = (user: any) => {
    setSelectedUser(user);
    setShowPasswordReset(true);
  };

  const handleTokenAdjustment = (user: any) => {
    setSelectedUser(user);
    setShowTokenModal(true);
  };

  const handleSecurityAction = (user: any) => {
    setSelectedUser(user);
    setShowSecurityModal(true);
  };

  const handleStripeKeysModal = () => {
    setShowStripeKeysModal(true);
    loadStripeKeys();
  };

  const loadStripeKeys = async () => {
    try {
      const response = await fetch('/api/admin/stripe-keys', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStripeKeys(data);
      }
    } catch (error) {
      console.error('Failed to load Stripe keys:', error);
    }
  };

  const saveStripeKeys = async () => {
    try {
      const response = await fetch('/api/admin/stripe-keys', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stripeKeys)
      });

      if (response.ok) {
        toast({
          title: "Stripe Keys Updated",
          description: "API keys have been securely saved",
        });
        setShowStripeKeysModal(false);
      } else {
        throw new Error('Failed to save keys');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Stripe keys",
        variant: "destructive",
      });
    }
  };

  const toggleKeyVisibility = (keyType: keyof typeof showKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: Activity },
                { id: 'users', name: 'User Management', icon: Users },
                { id: 'passwords', name: 'Password Management', icon: Key },
                { id: 'security', name: 'Security', icon: Shield }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Stripe API Key Management */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Integration</h3>
                  <Button onClick={handleStripeKeysModal} className="bg-blue-600 hover:bg-blue-700">
                    <Key className="mr-2 h-4 w-4" />
                    Manage Stripe Keys
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600">
                  Securely manage Stripe API keys for payment processing and subscription management on smartpromptiq.net domain.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stripe Keys Management Modal */}
        <Dialog open={showStripeKeysModal} onOpenChange={setShowStripeKeysModal}>
          <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Stripe API Key Management
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Securely manage Stripe API keys for smartpromptiq.net payment processing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Publishable Key */}
              <div>
                <Label htmlFor="publishableKey" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Publishable Key (pk_)
                </Label>
                <div className="relative">
                  <Input
                    id="publishableKey"
                    type={showKeys.publishableKey ? "text" : "password"}
                    placeholder="pk_live_..."
                    value={stripeKeys.publishableKey}
                    onChange={(e) => setStripeKeys(prev => ({ ...prev, publishableKey: e.target.value }))}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleKeyVisibility('publishableKey')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Safe to expose on frontend - used for client-side operations
                </p>
              </div>

              {/* Secret Key */}
              <div>
                <Label htmlFor="secretKey" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Secret Key (sk_)
                </Label>
                <div className="relative">
                  <Input
                    id="secretKey"
                    type={showKeys.secretKey ? "text" : "password"}
                    placeholder="sk_live_..."
                    value={stripeKeys.secretKey}
                    onChange={(e) => setStripeKeys(prev => ({ ...prev, secretKey: e.target.value }))}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleKeyVisibility('secretKey')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  Keep secure - server-side only, never expose on frontend
                </p>
              </div>

              {/* Webhook Secret */}
              <div>
                <Label htmlFor="webhookSecret" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Webhook Secret (whsec_)
                </Label>
                <div className="relative">
                  <Input
                    id="webhookSecret"
                    type={showKeys.webhookSecret ? "text" : "password"}
                    placeholder="whsec_..."
                    value={stripeKeys.webhookSecret}
                    onChange={(e) => setStripeKeys(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleKeyVisibility('webhookSecret')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For webhook signature verification - secure server-side storage
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Security Notice</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Keys are encrypted before storage. Test keys (pk_test_/sk_test_) are recommended for development.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowStripeKeysModal(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveStripeKeys}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Key className="mr-2 h-4 w-4" />
                Save Keys
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;