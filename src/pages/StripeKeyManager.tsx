import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key, Save } from 'lucide-react';

export const StripeKeyManager = () => {
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Here you would typically save to your backend or local storage
    console.log('Saving Stripe keys...');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8" />
          Stripe Key Manager
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your Stripe API keys for payment processing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys Configuration</CardTitle>
          <CardDescription>
            Enter your Stripe publishable and secret keys. These will be used for payment processing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publishable-key">Publishable Key</Label>
            <Input
              id="publishable-key"
              placeholder="pk_test_..."
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret-key">Secret Key</Label>
            <div className="relative">
              <Input
                id="secret-key"
                type={showSecretKey ? 'text' : 'password'}
                placeholder="sk_test_..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={!publishableKey || !secretKey}
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? 'Saved!' : 'Save Keys'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeKeyManager;
