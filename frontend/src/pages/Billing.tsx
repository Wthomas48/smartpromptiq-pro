import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BrainLogo, { BrainIcon } from './BrainLogo';
import { useAuth } from '@/hooks/useAuth';
import { 
  CreditCard,
  Check,
  X,
  Crown,
  Zap,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Globe,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  Target,
  Sparkles,
  Lock,
  Unlock,
  FileText
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  limits: {
    prompts: number | 'unlimited';
    storage: number; // GB
    templates: 'basic' | 'premium' | 'all';
    support: 'email' | 'priority' | 'dedicated';
    teamMembers?: number;
    apiAccess?: boolean;
  };
  popular?: boolean;
  recommended?: boolean;
  stripePriceId?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  downloadUrl?: string;
}

export default function Billing() {
  const { user, isAuthenticated } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      description: 'Perfect for getting started with AI prompts',
      features: [
        '10 prompts per month',
        'Basic templates',
        'Email support',
        'Community access',
        'Basic analytics'
      ],
      limits: {
        prompts: 10,
        storage: 1,
        templates: 'basic',
        support: 'email'
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingInterval === 'month' ? 19 : 190,
      interval: billingInterval,
      description: 'Unlimited prompts for power users',
      features: [
        'Unlimited prompts',
        'All premium templates',
        'Priority support',
        'Advanced analytics',
        'Custom templates',
        'Export functionality',
        'API access (100 calls/day)'
      ],
      limits: {
        prompts: 'unlimited',
        storage: 10,
        templates: 'premium',
        support: 'priority',
        apiAccess: true
      },
      popular: true,
      recommended: true,
      stripePriceId: billingInterval === 'month' ? 'price_pro_monthly' : 'price_pro_yearly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingInterval === 'month' ? 99 : 990,
      interval: billingInterval,
      description: 'Advanced features for teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration (up to 25 users)',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security',
        'SLA guarantee',
        'Unlimited API access',
        'White-label options'
      ],
      limits: {
        prompts: 'unlimited',
        storage: 100,
        templates: 'all',
        support: 'dedicated',
        teamMembers: 25,
        apiAccess: true
      },
      stripePriceId: billingInterval === 'month' ? 'price_enterprise_monthly' : 'price_enterprise_yearly'
    }
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 'pm_2',
      type: 'card',
      brand: 'mastercard',
      last4: '8888',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ];

  const mockInvoices: Invoice[] = [
    {
      id: 'inv_1',
      date: new Date('2024-01-15'),
      amount: 19,
      status: 'paid',
      plan: 'Pro Monthly',
      downloadUrl: '#'
    },
    {
      id: 'inv_2',
      date: new Date('2023-12-15'),
      amount: 19,
      status: 'paid',
      plan: 'Pro Monthly',
      downloadUrl: '#'
    },
    {
      id: 'inv_3',
      date: new Date('2023-11-15'),
      amount: 19,
      status: 'paid',
      plan: 'Pro Monthly',
      downloadUrl: '#'
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      // Load current subscription
      setCurrentPlan(plans.find(p => p.id === 'free') || null);
      setPaymentMethods(mockPaymentMethods);
      setInvoices(mockInvoices);
    }
  }, [isAuthenticated]);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      alert('Please sign in to upgrade your plan');
      return;
    }

    if (plan.id === 'free') {
      alert('You are already on the free plan');
      return;
    }

    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);

    try {
      // In a real app, you would:
      // 1. Create a Stripe checkout session on your backend
      // 2. Redirect to Stripe checkout
      // 3. Handle success/cancel redirects
      
      // Mock checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful subscription
      setCurrentPlan(selectedPlan);
      setShowUpgradeModal(false);
      alert(`Successfully upgraded to ${selectedPlan.name} plan!`);
      
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setIsLoading(true);

    try {
      // Mock cancellation
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Subscription cancelled. You will retain access until the end of your billing period.');
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Zap className="w-5 h-5" />;
      case 'pro': return <Crown className="w-5 h-5" />;
      case 'enterprise': return <Shield className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'from-gray-500 to-gray-600';
      case 'pro': return 'from-blue-500 to-indigo-600';
      case 'enterprise': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BrainLogo size={48} variant="simple" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to manage your billing and subscription.</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
              <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-gray-600">Manage your subscription, payment methods, and billing history</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Current Plan Status */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Current Plan</span>
              </CardTitle>
              <CardDescription>Your current subscription and usage</CardDescription>
            </CardHeader>
            <CardContent>
              {currentPlan && (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getPlanColor(currentPlan.id)} text-white`}>
                      {getPlanIcon(currentPlan.id)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{currentPlan.name} Plan</h3>
                      <p className="text-gray-600">{currentPlan.description}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ${currentPlan.price}
                        {currentPlan.price > 0 && <span className="text-sm font-normal text-gray-600">/{currentPlan.interval}</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {currentPlan.id !== 'enterprise' && (
                      <Button onClick={() => handleUpgrade(plans.find(p => p.id === 'pro') || plans[1])}>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    )}
                    {currentPlan.id !== 'free' && (
                      <Button variant="outline" onClick={handleCancelSubscription}>
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Usage Statistics */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Prompts Used</span>
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    8 / {currentPlan?.limits.prompts === 'unlimited' ? '∞' : currentPlan?.limits.prompts}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">This month</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Storage Used</span>
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    2.1 / {currentPlan?.limits.storage}GB
                  </div>
                  <div className="text-xs text-green-600 mt-1">Total storage</div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-800">Templates</span>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900 capitalize">
                    {currentPlan?.limits.templates}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">Access level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Choose Your Plan</CardTitle>
                  <CardDescription>Select the plan that best fits your needs</CardDescription>
                </div>
                
                {/* Billing Toggle */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBillingInterval('month')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      billingInterval === 'month'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingInterval('year')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      billingInterval === 'year'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yearly
                    <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Save 17%</Badge>
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border rounded-xl p-6 transition-all duration-200 ${
                      plan.popular
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-indigo-600 text-white px-3 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${getPlanColor(plan.id)} text-white mb-4`}>
                        {getPlanIcon(plan.id)}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                      
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                        {plan.price > 0 && (
                          <span className="text-gray-600">/{plan.interval}</span>
                        )}
                        {billingInterval === 'year' && plan.price > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            Save ${Math.round((plan.price * 12 / 10) - plan.price)} vs monthly
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleUpgrade(plan)}
                      className="w-full"
                      variant={currentPlan?.id === plan.id ? "outline" : (plan.popular ? "default" : "outline")}
                      disabled={currentPlan?.id === plan.id}
                    >
                      {currentPlan?.id === plan.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Current Plan
                        </>
                      ) : plan.id === 'free' ? (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Downgrade to Free
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to {plan.name}
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          {currentPlan?.id !== 'free' && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Payment Methods</span>
                    </CardTitle>
                    <CardDescription>Manage your payment methods</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium capitalize">{method.brand}</span>
                            <span className="text-gray-600">•••• {method.last4}</span>
                            {method.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing History */}
          {currentPlan?.id !== 'free' && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Billing History</span>
                </CardTitle>
                <CardDescription>Your past invoices and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-500' :
                          invoice.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium">{invoice.plan}</div>
                          <p className="text-sm text-gray-600">
                            {invoice.date.toLocaleDateString()} • ${invoice.amount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {invoice.status}
                        </Badge>
                        {invoice.status === 'paid' && (
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Upgrade to {selectedPlan.name}</CardTitle>
              <CardDescription>
                Complete your upgrade to unlock premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{selectedPlan.name} Plan</span>
                    <span className="text-xl font-bold">${selectedPlan.price}/{selectedPlan.interval}</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">What's included:</h4>
                  <ul className="space-y-1">
                    {selectedPlan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <Button 
                    onClick={handleStripeCheckout} 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpgradeModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}