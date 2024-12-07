"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Crown, 
  Palette, 
  Sparkles,
  Gift,
  BadgeCheck,
  Shield,
  Zap,
  Star
} from "lucide-react";

interface RewardsShopProps {
  points: number;
}

const REWARDS = [
  {
    id: 1,
    name: "Custom Profile Badge",
    description: "Show off your achievements with a unique profile badge",
    icon: BadgeCheck,
    cost: 500,
    category: "cosmetic"
  },
  {
    id: 2,
    name: "Premium Theme",
    description: "Unlock exclusive color themes for your workspace",
    icon: Palette,
    cost: 1000,
    category: "cosmetic"
  },
  {
    id: 3,
    name: "VIP Status",
    description: "Get a special VIP badge and exclusive features",
    icon: Crown,
    cost: 2000,
    category: "status"
  },
  {
    id: 4,
    name: "Power User Tools",
    description: "Access advanced productivity features",
    icon: Zap,
    cost: 1500,
    category: "feature"
  },
  {
    id: 5,
    name: "Custom Emojis",
    description: "Add your own custom emojis to the workspace",
    icon: Sparkles,
    cost: 800,
    category: "cosmetic"
  },
  {
    id: 6,
    name: "Priority Support",
    description: "Get faster responses from our support team",
    icon: Shield,
    cost: 3000,
    category: "feature"
  }
];

export function RewardsShop({ points }: RewardsShopProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rewards Shop</h3>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold">{points} points available</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map((reward) => (
          <Card key={reward.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <reward.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{reward.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {reward.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {reward.cost} points
                  </span>
                  <Button
                    size="sm"
                    variant={points >= reward.cost ? "default" : "outline"}
                    disabled={points < reward.cost}
                  >
                    {points >= reward.cost ? "Redeem" : "Not enough points"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}