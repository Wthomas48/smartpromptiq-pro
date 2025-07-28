import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Crown, Zap, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface UserSubscription {
  subscriptionTier: string;
  tokenBalance: number;
  subscriptionStatus: string;
  subscriptionEndDate: string;
}

// Mock data for demo
const mockSubscription: UserSubscription = {
  subscriptionTier: "pro",
  tokenBalance: 150,
  subscriptionStatus: "active",
  subscriptionEndDate: "2024-12-31"
};

export default function TokenBalance() {
  const [subscription] = useState<UserSubscription>(mockSubscription);
  const [isLoading] = useState(false);

  console.log("?? TokenBalance loaded with mock data:", subscription);

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tokenBalance = subscription?.tokenBalance || 0;
  const tier = subscription?.subscriptionTier || "free";
  const isLowBalance = tokenBalance <= 2;

  const getTierIcon = () => {
    switch (tier) {
      case "pro":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "enterprise":
        return <Crown className="h-4 w-4 text-purple-500" />;
      default:
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case "pro":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "enterprise":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <Card className={`w-full max-w-sm ${isLowBalance ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTierIcon()}
            <Badge className={getTierColor()}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>
          {isLowBalance && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Token Balance</span>
          </div>
          <div className={`text-2xl font-bold ${isLowBalance ? 'text-red-600' : 'text-gray-900'}`}>
            {tokenBalance}
          </div>
        </div>

        {isLowBalance && (
          <div className="space-y-2">
            <p className="text-sm text-red-600">
              Low token balance! Purchase more tokens or upgrade your plan.
            </p>
            <div className="flex gap-2">
              <Link href="/billing" className="flex-1">
                <Button size="sm" className="w-full">
                  Buy Tokens
                </Button>
              </Link>
              {tier === "free" && (
                <Link href="/billing" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {!isLowBalance && tier === "free" && (
          <Link href="/billing">
            <Button size="sm" variant="outline" className="w-full">
              Upgrade Plan
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
