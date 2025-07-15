import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  FileText,
  Brain,
  Coins
} from 'lucide-react';

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  unitPrice: number;
  popular?: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  limits: {
    tokens: number | 'unlimited';
    prompts: number | 'unlimited';
    storage: number; // GB
    templates: 'basic' | 'premium' | 'all';
    support: 'email' | 'priority' | 'dedicated';
    teamMembers?: number;
    apiAccess?: boolean;
    analytics?: boolean;
    customIntegrations?: boolean;
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
  const [currentTokens, setCurrentTokens] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'tokens'>('plans');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Token packages based on your HTML
  const tokenPackages: TokenPackage[] = [
    {
      id: 'tokens-50',
      tokens: 50,
      price: 9.99,
      unitPrice: 0.200
    },
    {
      id: 'tokens-150',
      tokens: 150,
      price: 24.99,
      unitPrice: 0.167,
      popular: true
    },
    {
      id: 'tokens-500',
      tokens: 500,
      price: 79.99,
      unitPrice: 0.160
    }
  ];

  // Updated subscription plans based on your HTML
  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        '10 tokens/month',
        '10 prompts per month',
        'Basic templates',
        'Community support'
      ],
      limits: {
        tokens: 10,
        prompts: 10,
        storage: 1,
        templates: 'basic',
        support: 'email'
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      interval: 'month',
      description: 'For professionals and creators',
      features: [
        '500 tokens/month',
        '500 prompts per month',
        'Premium templates',
        'Priority support',
        'Team collaboration',
        'Advanced analytics',
        'Export functionality'
      ],
      limits: {
        tokens: 500,
        prompts: 500,
        storage: 10,
        templates: 'premium',
        support: 'priority',
        teamMembers: 5,
        analytics: true
      },
      popular: true,
      recommended: true,
      stripePriceId: 'price_pro_monthly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      interval: 'month',
      description: 'For agencies and large teams',
      features: [
        'Unlimited tokens',
        'Unlimited prompts',
        'Custom templates',
        'Dedicated support',
        'Advanced analytics',
        'Custom integrations',
        'White-label options',
        'SLA guarantee'
      ],
      limits: {
        tokens: 'unlimited',
        prompts: 'unlimited',
        storage: 100,
        templates: 'all',
        support: 'dedicated',
        teamMembers: 25,
        analytics: true,
        customIntegrations: true
      },
      stripePriceId: 'price_enterprise_monthly'
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
    }
  ];

  const mockInvoices: Invoice[] = [
    {
      id: 'inv_1',
      date: new Date('2024-01-15'),
      amount: 19.99,
      status: 'paid',
      plan: 'Pro Monthly',
      downloadUrl: '#'
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPlan(plans.find(p => p.id === 'free') || null);
      setPaymentMethods(mockPaymentMethods);
      setInvoices(mockInvoices);
    }
  }, [isAuthenticated]);

  const handlePurchaseTokens = async (tokenPackage: TokenPackage) => {
    if (!isAuthenticated) {
      alert('Please sign in to purchase tokens');
      return;
    }

    setIsLoading(true);
    try {
      // Mock token purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentTokens(prev => prev + tokenPackage.tokens);
      alert(`Successfully purchased ${tokenPackage.tokens} tokens!`);
    } catch (error) {
      alert('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentPlan(selectedPlan);
      setShowUpgradeModal(false);
      alert(`Successfully upgraded to ${selectedPlan.name} plan!`);
    } catch (error) {
      alert('Payment failed. Please try again.');
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Brain className="w-8 h-8 text-indigo-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
              <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Smart PromptIQ</h1>
              <p className="text-gray-600">AI-driven content creation with intelligent prompts</p>
            </div>
          </div>

          {/* Current Status */}
          <Card className="border-0 shadow-md mb-6">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{currentTokens}</div>
                  <div className="text-sm text-gray-600">Available Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 capitalize">{currentPlan?.name}</div>
                  <div className="text-sm text-gray-600">Current Plan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${currentPlan?.price || 0}</div>
                  <div className="text-sm text-gray-600">Monthly Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 max-w-md">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'plans'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tokens'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buy Tokens
            </button>
          </div>
        </div>

        {/* Subscription Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Plans</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose the perfect plan for your AI prompt generation needs. Upgrade anytime to unlock more features.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'scale-105 border-2 border-indigo-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-indigo-600 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${getPlanColor(plan.id)} text-white mb-4`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                    
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600 ml-1">/{plan.interval}</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
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
                        'Get Started'
                      ) : plan.id === 'enterprise' ? (
                        'Contact Sales'
                      ) : (
                        `Start ${plan.name} Trial`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enterprise CTA */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <CardContent className="text-center py-8">
                <h3 className="text-2xl font-bold mb-4">Need an Enterprise Solution?</h3>
                <p className="text-lg mb-6 text-indigo-100 max-w-2xl mx-auto">
                  Get custom pricing, dedicated support, and advanced features tailored for your organization's needs.
                </p>
                <Button variant="secondary" size="lg">
                  Contact Sales Team
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Buy Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Buy Additional Tokens</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Purchase tokens for pay-per-use prompt generation. Perfect for occasional users or supplementing your subscription.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {tokenPackages.map((tokenPackage) => (
                <Card 
                  key={tokenPackage.id}
                  className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    tokenPackage.popular ? 'scale-105 border-2 border-green-500' : ''
                  }`}
                >
                  {tokenPackage.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-600 text-white px-4 py-1">
                        Best Value
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">
                      {tokenPackage.tokens}
                    </div>
                    <div className="text-gray-600 mb-4">Tokens</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ${tokenPackage.price}
                    </div>
                    <div className="text-sm text-gray-600">
                      ${tokenPackage.unitPrice.toFixed(3)} per token
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Button
                      onClick={() => handlePurchaseTokens(tokenPackage)}
                      disabled={isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 mr-2" />
                          Purchase Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
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