import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BrainLogo, { BrainIcon } from './BrainLogo';
import { useAuth } from '@/hooks/useAuth';
import { 
  Settings as SettingsIcon,
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Key,
  Download,
  Trash2,
  Camera,
  Edit3,
  Save,
  X,
  Check,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  HelpCircle,
  ExternalLink,
  AlertTriangle,
  Crown,
  BarChart3,
  Clock,
  Target,
  Zap,
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    bio: string;
    company: string;
    role: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
    soundEffects: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showUsageStats: boolean;
    allowAnalytics: boolean;
    twoFactorEnabled: boolean;
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due';
    nextBilling: Date;
    usage: {
      promptsUsed: number;
      promptsLimit: number;
      storageUsed: number;
      storageLimit: number;
    };
  };
}

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || 'demo@smartpromptiq.com',
      avatar: '',
      bio: 'AI enthusiast and prompt engineer',
      company: 'SmartPromptIQ',
      role: 'Marketing Manager'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      weeklyDigest: true,
      soundEffects: true
    },
    privacy: {
      profileVisible: true,
      showUsageStats: true,
      allowAnalytics: true,
      twoFactorEnabled: false
    },
    subscription: {
      plan: 'free',
      status: 'active',
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usage: {
        promptsUsed: 8,
        promptsLimit: 10,
        storageUsed: 2.4,
        storageLimit: 5
      }
    }
  });

  const [formData, setFormData] = useState(settings);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BrainLogo size={48} variant="simple" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your account settings.</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSettings(formData);
      setIsEditing(false);
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleCancel = () => {
    setFormData(settings);
    setIsEditing(false);
  };

  const updateFormData = (section: keyof UserSettings, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {formData.profile.firstName[0]}{formData.profile.lastName[0]}
              </div>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {formData.profile.firstName} {formData.profile.lastName}
                  </h2>
                  <p className="text-gray-600">{formData.profile.role} at {formData.profile.company}</p>
                  <p className="text-sm text-gray-500">{formData.profile.email}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getPlanBadgeColor(settings.subscription.plan)}>
                    {settings.subscription.plan === 'free' && <><Zap className="w-3 h-3 mr-1" />Free</>}
                    {settings.subscription.plan === 'pro' && <><Crown className="w-3 h-3 mr-1" />Pro</>}
                    {settings.subscription.plan === 'enterprise' && <><Crown className="w-3 h-3 mr-1" />Enterprise</>}
                  </Badge>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile information and bio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.profile.firstName}
                onChange={(e) => updateFormData('profile', 'firstName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.profile.lastName}
                onChange={(e) => updateFormData('profile', 'lastName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.profile.email}
              onChange={(e) => updateFormData('profile', 'email', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={formData.profile.company}
                onChange={(e) => updateFormData('profile', 'company', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={formData.profile.role}
                onChange={(e) => updateFormData('profile', 'role', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.profile.bio}
              onChange={(e) => updateFormData('profile', 'bio', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {isEditing && (
            <div className="flex items-center space-x-3 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Appearance */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>Customize how SmartPromptIQ looks and feels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> }
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateFormData('preferences', 'theme', theme.value)}
                  className={`p-3 border rounded-lg flex items-center justify-center space-x-2 ${
                    formData.preferences.theme === theme.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {theme.icon}
                  <span className="text-sm font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={formData.preferences.language}
              onChange={(e) => updateFormData('preferences', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={formData.preferences.timezone}
              onChange={(e) => updateFormData('preferences', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">Greenwich Mean Time (GMT)</option>
              <option value="Europe/Paris">Central European Time (CET)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Sound Effects</p>
              <p className="text-xs text-gray-500">Play sounds for notifications and interactions</p>
            </div>
            <button
              onClick={() => updateFormData('preferences', 'soundEffects', !formData.preferences.soundEffects)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.preferences.soundEffects ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.preferences.soundEffects ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Current Plan</span>
          </CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold capitalize">{settings.subscription.plan} Plan</h3>
              <p className="text-sm text-gray-600">
                {settings.subscription.plan === 'free' && 'Perfect for getting started'}
                {settings.subscription.plan === 'pro' && 'Unlimited prompts and premium features'}
                {settings.subscription.plan === 'enterprise' && 'Advanced features for teams'}
              </p>
            </div>
            <Badge className={getPlanBadgeColor(settings.subscription.plan)}>
              {settings.subscription.status}
            </Badge>
          </div>

          {/* Usage Stats */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Prompts Used</span>
                <span className="text-sm text-gray-600">
                  {settings.subscription.usage.promptsUsed}/{settings.subscription.usage.promptsLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{
                    width: `${(settings.subscription.usage.promptsUsed / settings.subscription.usage.promptsLimit) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Storage Used</span>
                <span className="text-sm text-gray-600">
                  {settings.subscription.usage.storageUsed}GB/{settings.subscription.usage.storageLimit}GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{
                    width: `${(settings.subscription.usage.storageUsed / settings.subscription.usage.storageLimit) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {settings.subscription.plan === 'free' ? (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Upgrade to Pro</h4>
                  <p className="text-sm text-gray-600">Unlock unlimited prompts and premium features</p>
                </div>
                <Button>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Next Billing</h4>
                  <p className="text-sm text-gray-600">
                    Your next billing date is {settings.subscription.nextBilling.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline">
                    Manage Billing
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: 'Free',
                price: '$0',
                features: ['10 prompts/month', 'Basic templates', 'Email support'],
                recommended: false
              },
              {
                name: 'Pro',
                price: '$19',
                features: ['Unlimited prompts', 'Premium templates', 'Priority support', 'Analytics'],
                recommended: true
              },
              {
                name: 'Enterprise',
                price: '$99',
                features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom templates'],
                recommended: false
              }
            ].map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-lg p-4 ${
                  plan.recommended ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                {plan.recommended && (
                  <Badge className="bg-indigo-600 text-white mb-2">Recommended</Badge>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold mb-4">{plan.price}<span className="text-sm font-normal text-gray-600">/month</span></p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.name.toLowerCase() === settings.subscription.plan ? "outline" : "default"}
                  disabled={plan.name.toLowerCase() === settings.subscription.plan}
                >
                  {plan.name.toLowerCase() === settings.subscription.plan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
              <SettingsIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account preferences and subscription</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 border'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
            {activeTab === 'subscription' && renderSubscriptionTab()}
            
            {/* Placeholder for other tabs */}
            {!['profile', 'preferences', 'subscription'].includes(activeTab) && (
              <Card className="border-0 shadow-md">
                <CardContent className="text-center py-12">
                  <BrainLogo size={64} variant="simple" className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tabs.find(t => t.id === activeTab)?.label} Settings
                  </h3>
                  <p className="text-gray-600 mb-4">This section is coming soon!</p>
                  <Button variant="outline">Back to Profile</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}