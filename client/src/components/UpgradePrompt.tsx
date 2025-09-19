import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, ArrowRight, X } from 'lucide-react';
import { PRICING_TIERS, getTierById, type PricingTier } from '@/../../shared/pricing/config';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  requiredTier: string;
  featureName: string;
  featureDescription?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  featureName,
  featureDescription
}) => {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const current = getTierById(currentTier);
  const required = getTierById(requiredTier);

  if (!current || !required) return null;

  const getTierIcon = (tier: PricingTier) => {
    switch (tier.id) {
      case 'starter': return <Star className="w-5 h-5" />;
      case 'pro': return <Crown className="w-5 h-5" />;
      case 'business': return <Zap className="w-5 h-5" />;
      case 'enterprise': return <Crown className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getTierColor = (tier: PricingTier) => {
    switch (tier.id) {
      case 'starter': return 'from-indigo-500 to-purple-600';
      case 'pro': return 'from-purple-500 to-pink-600';
      case 'business': return 'from-pink-500 to-red-600';
      case 'enterprise': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const handleUpgrade = () => {
    setLocation('/pricing');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white relative animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getTierColor(required)} flex items-center justify-center text-white animate-pulse`}>
              {getTierIcon(required)}
            </div>
          </div>

          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Upgrade Required
          </CardTitle>

          <CardDescription className="text-gray-600 mt-2">
            <strong>{featureName}</strong> is available with {required.name} plan and above
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {featureDescription && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">{featureDescription}</p>
            </div>
          )}

          {/* Current vs Required Comparison */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <Star className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Current: {current.name}</p>
                  <p className="text-sm text-gray-500">${current.price.monthly}/month</p>
                </div>
              </div>
              <Badge variant="secondary">Current</Badge>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className={`flex items-center justify-between p-3 bg-gradient-to-r ${getTierColor(required)} bg-opacity-10 rounded-lg border border-opacity-20`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTierColor(required)} flex items-center justify-center text-white`}>
                  {getTierIcon(required)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Upgrade to: {required.name}</p>
                  <p className="text-sm text-gray-500">${required.price.monthly}/month</p>
                </div>
              </div>
              <Badge className={`bg-gradient-to-r ${getTierColor(required)} text-white border-0`}>
                Recommended
              </Badge>
            </div>
          </div>

          {/* Key Features Preview */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">What you'll get with {required.name}:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {required.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
              {required.features.length > 3 && (
                <li className="flex items-center space-x-2 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span>+ {required.features.length - 3} more features</span>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={handleUpgrade}
              className={`w-full bg-gradient-to-r ${getTierColor(required)} hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to {required.name}
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradePrompt;