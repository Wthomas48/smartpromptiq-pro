import React, { useState } from 'react';
import { Key, Shield, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const StripeKeyManager = () => {
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
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  const toggleKeyVisibility = (keyType: keyof typeof showKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  const saveStripeKeys = async () => {
    if (!stripeKeys.publishableKey || !stripeKeys.secretKey) {
      toast({
        title: "Missing Required Keys",
        description: "Please enter both Publishable Key and Secret Key",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
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
          title: "Success",
          description: "Stripe API keys have been securely saved",
        });
        // Clear form after successful save
        setStripeKeys({
          publishableKey: '',
          secretKey: '',
          webhookSecret: ''
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save keys');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save Stripe keys",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Stripe API Keys</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your Stripe API keys for smartpromptiq.net
            </p>
          </div>

          <div className="space-y-6">
            {/* Publishable Key */}
            <div>
              <Label htmlFor="publishableKey" className="text-sm font-medium text-gray-700 mb-2 block">
                Publishable Key *
              </Label>
              <div className="relative">
                <Input
                  id="publishableKey"
                  type={showKeys.publishableKey ? "text" : "password"}
                  placeholder="pk_live_... or pk_test_..."
                  value={stripeKeys.publishableKey}
                  onChange={(e) => setStripeKeys(prev => ({ ...prev, publishableKey: e.target.value }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleKeyVisibility('publishableKey')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                >
                  {showKeys.publishableKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Safe to expose on frontend - used for client-side operations
              </p>
            </div>

            {/* Secret Key */}
            <div>
              <Label htmlFor="secretKey" className="text-sm font-medium text-gray-700 mb-2 block">
                Secret Key *
              </Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showKeys.secretKey ? "text" : "password"}
                  placeholder="sk_live_... or sk_test_..."
                  value={stripeKeys.secretKey}
                  onChange={(e) => setStripeKeys(prev => ({ ...prev, secretKey: e.target.value }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleKeyVisibility('secretKey')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                >
                  {showKeys.secretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-red-500 mt-1">
                Keep secure - server-side only, never expose on frontend
              </p>
            </div>

            {/* Webhook Secret */}
            <div>
              <Label htmlFor="webhookSecret" className="text-sm font-medium text-gray-700 mb-2 block">
                Webhook Secret (Optional)
              </Label>
              <div className="relative">
                <Input
                  id="webhookSecret"
                  type={showKeys.webhookSecret ? "text" : "password"}
                  placeholder="whsec_..."
                  value={stripeKeys.webhookSecret}
                  onChange={(e) => setStripeKeys(prev => ({ ...prev, webhookSecret: e.target.value }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleKeyVisibility('webhookSecret')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                >
                  {showKeys.webhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                For webhook signature verification
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Security Notice</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Keys are securely processed and logged for admin verification. 
                    Use test keys (pk_test_/sk_test_) for development.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={saveStripeKeys}
              disabled={saving || !stripeKeys.publishableKey || !stripeKeys.secretKey}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Stripe Keys
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need your Stripe keys? Visit{" "}
              <a 
                href="https://dashboard.stripe.com/apikeys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500"
              >
                Stripe Dashboard
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeKeyManager;