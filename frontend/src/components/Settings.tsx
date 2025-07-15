// src/components/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Settings as SettingsIcon, User, Bell, Shield, CreditCard, 
  Save, RefreshCw, CheckCircle, AlertTriangle, Crown, 
  Download, Trash2, Eye, EyeOff, Copy, Plus, Lock,
  Camera, Globe, Phone, Building, Mail
} from 'lucide-react';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    company: string;
    location: string;
    phone: string;
  };
  preferences: {
    theme: string;
    notifications: boolean;
    autoSave: boolean;
    emailDigest: boolean;
  };
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Mock settings data
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSettings: UserSettings = {
        profile: {
          firstName: user?.firstName || 'John',
          lastName: user?.lastName || 'Doe',
          email: user?.email || 'demo@smartpromptiq.com',
          bio: 'Senior Marketing Manager passionate about AI-powered content creation.',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          phone: '+1 (555) 123-4567'
        },
        preferences: {
          theme: 'light',
          notifications: true,
          autoSave: true,
          emailDigest: true
        }
      };
      
      setSettings(mockSettings);
      setIsLoading(false);
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!settings) return;
    
    setSaveStatus('saving');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser({
        firstName: settings.profile.firstName,
        lastName: settings.profile.lastName,
        email: settings.profile.email
      });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved!';
      case 'error': return 'Error - Retry';
      default: return 'Save Changes';
    }
  };

  const getSaveButtonIcon = () => {
    switch (saveStatus) {
      case 'saving': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'saved': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Save className="w-4 h-4" />;
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <SettingsIcon className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Settings...</h3>
            <p className="text-gray-600">Fetching your account preferences</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                Account Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account preferences and configuration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1">
                <Crown className="w-4 h-4 mr-1 text-yellow-600" />
                Pro Plan
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'profile', name: 'Profile', icon: User },
                { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
                { id: 'privacy', name: 'Privacy', icon: Shield },
                { id: 'billing', name: 'Billing', icon: CreditCard }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <Input
                          value={settings.profile.firstName}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            profile: { ...prev.profile, firstName: e.target.value }
                          } : prev)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <Input
                          value={settings.profile.lastName}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            profile: { ...prev.profile, lastName: e.target.value }
                          } : prev)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          profile: { ...prev.profile, email: e.target.value }
                        } : prev)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        placeholder="Tell us about yourself..."
                        value={settings.profile.bio}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          profile: { ...prev.profile, bio: e.target.value }
                        } : prev)}
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company
                        </label>
                        <Input
                          value={settings.profile.company}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            profile: { ...prev.profile, company: e.target.value }
                          } : prev)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <Input
                          value={settings.profile.location}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            profile: { ...prev.profile, location: e.target.value }
                          } : prev)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          profile: { ...prev.profile, phone: e.target.value }
                        } : prev)}
                      />
                    </div>

                    <Button 
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="w-full md:w-auto"
                    >
                      {getSaveButtonIcon()}
                      <span className="ml-2">{getSaveButtonText()}</span>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    App Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize how SmartPromptIQ works for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'auto'].map((theme) => (
                        <button
                          key={theme}
                          className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                            settings.preferences.theme === theme 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSettings(prev => prev ? {
                            ...prev,
                            preferences: { ...prev.preferences, theme }
                          } : prev)}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'notifications', label: 'Push Notifications', desc: 'Receive notifications in your browser' },
                      { key: 'autoSave', label: 'Auto-save', desc: 'Automatically save changes as you type' },
                      { key: 'emailDigest', label: 'Email Digest', desc: 'Weekly summary of your activity' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{setting.label}</div>
                          <div className="text-xs text-gray-600">{setting.desc}</div>
                        </div>
                        <button
                          onClick={() => setSettings(prev => prev ? {
                            ...prev,
                            preferences: { 
                              ...prev.preferences, 
                              [setting.key]: !(prev.preferences as any)[setting.key] 
                            }
                          } : prev)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            (settings.preferences as any)[setting.key] ? 'bg-indigo-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              (settings.preferences as any)[setting.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                  >
                    {getSaveButtonIcon()}
                    <span className="ml-2">{getSaveButtonText()}</span>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>
                    Manage your privacy settings and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Security Recommendation</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Enable two-factor authentication to significantly improve your account security.
                    </p>
                    <Button size="sm" variant="outline" className="text-yellow-800 border-yellow-300">
                      <Lock className="w-3 h-3 mr-2" />
                      Setup 2FA
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Profile Visibility</h3>
                      <div className="space-y-2">
                        {[
                          { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
                          { value: 'private', label: 'Private', desc: 'Only you can see your profile' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              defaultChecked={option.value === 'public'}
                              className="w-4 h-4 text-indigo-600"
                            />
                            <div>
                              <div className="text-sm font-medium">{option.label}</div>
                              <div className="text-xs text-gray-600">{option.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Data Retention</h3>
                      <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                        <option value={365}>1 year</option>
                        <option value={1095}>3 years</option>
                        <option value={-1}>Keep forever</option>
                      </select>
                      <p className="text-xs text-gray-600 mt-1">
                        How long to keep your deleted data before permanent removal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">Pro Plan</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        Advanced features and priority support
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">$29</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Monthly Usage</span>
                        <span>347 / 1000</span>
                      </div>
                      <Progress value={34.7} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Next billing date</span>
                        <div className="font-medium">2024-02-15</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment method</span>
                        <div className="font-medium">**** **** **** 4567</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Update Payment
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">
                    {settings.profile.firstName[0]}{settings.profile.lastName[0]}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prompts Created</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">89%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-medium text-orange-600">12 days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Account Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}