import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Star, 
  Eye, 
  TrendingUp, 
  CheckCircle, 
  IndianRupee,
  Calendar,
  Megaphone
} from 'lucide-react';

interface PremiumListingCardProps {
  title: string;
  currentPlan?: 'basic' | 'premium' | 'featured';
  onUpgrade: (plan: string) => void;
}

const PremiumListingCard: React.FC<PremiumListingCardProps> = ({
  title,
  currentPlan = 'basic',
  onUpgrade
}) => {
  const plans = [
    {
      id: 'premium',
      name: 'Premium Listing',
      price: 2999,
      duration: '30 days',
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      features: [
        '3x more visibility',
        'Priority in search results',
        'Highlighted listing border',
        'Premium badge',
        'Featured in category'
      ],
      benefits: [
        { icon: Eye, text: '200% more views' },
        { icon: TrendingUp, text: 'Higher inquiry rate' },
        { icon: Star, text: 'Premium placement' }
      ]
    },
    {
      id: 'featured',
      name: 'Featured Listing',
      price: 4999,
      duration: '30 days',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      features: [
        'All Premium features',
        'Top position in search',
        'Homepage banner placement',
        'Social media promotion',
        'Dedicated account manager'
      ],
      benefits: [
        { icon: Crown, text: 'Ultimate visibility' },
        { icon: Megaphone, text: 'Marketing boost' },
        { icon: CheckCircle, text: 'Guaranteed results' }
      ]
    }
  ];

  const currentStats = {
    views: 45,
    inquiries: 3,
    days_active: 7
  };

  return (
    <div className="space-y-6">
      {/* Current Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">{title}</h3>
            <Badge variant={currentPlan === 'basic' ? 'outline' : 'default'}>
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{currentStats.views}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{currentStats.inquiries}</div>
              <div className="text-sm text-muted-foreground">Inquiries</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{currentStats.days_active}</div>
              <div className="text-sm text-muted-foreground">Days Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden">
            <div className={`h-2 ${plan.color}`} />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.id === 'featured' ? (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Star className="h-5 w-5 text-blue-500" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">/ {plan.duration}</span>
                  </div>
                </div>
                {plan.id === 'featured' && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Most Popular
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Benefits Preview */}
              <div className="grid grid-cols-1 gap-3">
                {plan.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    <benefit.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">What's Included:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full" 
                variant={plan.id === 'featured' ? 'default' : 'outline'}
                onClick={() => onUpgrade(plan.id)}
              >
                {currentPlan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Promotional Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-green-800 mb-2">
                🎉 Festival Special Offer!
              </h3>
              <p className="text-green-700 mb-2">
                Get 25% OFF on all premium plans during Diwali season
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Calendar className="h-4 w-4" />
                <span>Valid till 15th November 2024</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-red-500 text-white mb-2">
                LIMITED TIME
              </Badge>
              <div className="text-2xl font-bold text-green-800">
                25% OFF
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Pro Tips to Get More Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span>Add high-quality photos with proper lighting</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span>Include detailed property description with amenities</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span>Keep pricing competitive based on locality rates</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span>Respond quickly to inquiries (within 2 hours)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumListingCard;