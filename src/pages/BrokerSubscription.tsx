import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Crown, Shield, Home, CheckCircle, IndianRupee, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const BrokerSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentPlan] = useState<'free' | 'prime' | 'elite'>('free');

  // Detect if accessed from builder context
  const isBuilder = searchParams.get('type') === 'builder';
  const roleLabel = isBuilder ? 'Builder' : 'Broker';

  const plans = [
    {
      id: 'free',
      name: 'Free Basic',
      subtitle: `For New ${roleLabel}s`,
      price: 0,
      icon: Home,
      leadBoost: '+120% Leads',
      gradient: 'from-slate-100 to-blue-50',
      borderColor: 'border-slate-200',
      iconBg: 'bg-gradient-to-br from-slate-200 to-blue-200',
      iconColor: 'text-slate-600',
      buttonVariant: 'outline' as const,
      features: [
        '2 Free Listings every 2 months',
        'Standard Visibility',
        'Basic Support',
      ],
    },
    {
      id: 'prime',
      name: 'Prime Membership',
      subtitle: '',
      price: 999,
      icon: Crown,
      leadBoost: '+300% Leads',
      gradient: 'from-blue-50 to-indigo-100',
      borderColor: 'border-primary/30',
      iconBg: 'bg-gradient-to-br from-primary/20 to-indigo-300',
      iconColor: 'text-primary',
      buttonVariant: 'default' as const,
      popular: true,
      trialText: '7-Day Free Trial',
      features: [
        `Featured ${roleLabel} Badge`,
        'Unlimited Listings',
        'Prime Visibility',
        'Priority Support',
      ],
    },
    {
      id: 'elite',
      name: 'Elite Membership',
      subtitle: '',
      price: 1999,
      icon: Shield,
      leadBoost: '+500% Leads',
      gradient: 'from-purple-50 to-violet-100',
      borderColor: 'border-purple-200',
      iconBg: 'bg-gradient-to-br from-purple-200 to-violet-300',
      iconColor: 'text-purple-600',
      buttonVariant: 'outline' as const,
      recommended: true,
      features: [
        `${roleLabel} Verified Badge`,
        'Unlimited Listings',
        'Top Visibility',
        'Premium Support',
        'Exclusive Leads',
      ],
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return;
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to upgrade.", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planId, isBuilder },
      });

      if (error) throw error;

      toast({
        title: `🎉 Upgraded to ${planId === 'prime' ? 'Prime' : 'Elite'}!`,
        description: `Your ${roleLabel.toLowerCase()} profile now has a verified badge.`,
      });
    } catch (err: any) {
      toast({
        title: "Upgrade Failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-background to-indigo-50/50 pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground text-center">{roleLabel} Plans</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Boost your visibility and get more leads in Surat.
        </p>
      </div>

      {/* Plans Carousel */}
      <div className="px-4 mt-4">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative flex-shrink-0 w-[200px] snap-center rounded-2xl border-2 ${
                plan.popular ? 'border-primary shadow-lg scale-105 z-10' : plan.borderColor
              } bg-gradient-to-br ${plan.gradient} overflow-hidden`}
            >
              {/* Tags */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold text-center py-1 uppercase tracking-wider">
                    Most Popular
                  </div>
                </div>
              )}
              {plan.recommended && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-orange-500 text-white text-[9px] px-1.5">Recommended</Badge>
                </div>
              )}

              {/* Lead Boost Badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-purple-500/90 text-white text-[9px] px-1.5 gap-0.5">
                  <Zap className="h-2.5 w-2.5" />
                  {plan.leadBoost}
                </Badge>
              </div>

              <div className={`pt-${plan.popular ? '10' : '8'} pb-4 px-3 flex flex-col items-center text-center`}>
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-3 shadow-sm`}>
                  <plan.icon className={`h-7 w-7 ${plan.iconColor}`} />
                </div>

                <h3 className="font-bold text-foreground text-sm">{plan.name}</h3>
                {plan.subtitle && <p className="text-[10px] text-muted-foreground">{plan.subtitle}</p>}

                {/* Price */}
                <div className="flex items-baseline gap-0.5 mt-2">
                  {plan.price > 0 ? (
                    <>
                      <IndianRupee className="h-4 w-4 text-foreground" />
                      <span className="text-xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-foreground">Free</span>
                  )}
                </div>

                {plan.trialText && (
                  <Badge variant="outline" className="text-[9px] mt-1.5 border-primary/30 text-primary">
                    {plan.trialText}
                  </Badge>
                )}

                {/* Features */}
                <div className="mt-3 space-y-1.5 w-full text-left">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-foreground leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  variant={plan.buttonVariant}
                  size="sm"
                  className={`w-full mt-4 text-xs h-8 ${
                    plan.popular ? 'bg-primary text-primary-foreground shadow-md' : ''
                  }`}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name.split(' ')[0]}`}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Plan Benefits */}
      <div className="px-4 mt-2">
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-foreground">Free Plan Limit</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              As a free {roleLabel.toLowerCase()}, you can post <strong>2 listings every 2 months</strong>. 
              Upgrade to Prime or Elite for unlimited listings and more leads!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <div className="px-4 mt-4">
        <h3 className="font-bold text-foreground mb-3">Compare Plans</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-muted">
                  <th className="text-left p-3 font-medium text-muted-foreground">Feature</th>
                  <th className="p-3 font-medium text-muted-foreground text-center">Free</th>
                  <th className="p-3 font-medium text-primary text-center">Prime</th>
                  <th className="p-3 font-medium text-purple-600 text-center">Elite</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Listings', free: '2/2mo', prime: '∞', elite: '∞' },
                  { feature: 'Visibility', free: 'Basic', prime: 'Prime', elite: 'Top' },
                  { feature: `${roleLabel} Badge`, free: '—', prime: '✓', elite: '✓' },
                  { feature: 'Verified Badge', free: '—', prime: '—', elite: '✓' },
                  { feature: 'Lead Priority', free: 'Low', prime: 'High', elite: 'Highest' },
                  { feature: 'Support', free: 'Basic', prime: 'Priority', elite: 'Premium' },
                  { feature: 'Exclusive Leads', free: '—', prime: '—', elite: '✓' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-3 font-medium text-foreground">{row.feature}</td>
                    <td className="p-3 text-center text-muted-foreground">{row.free}</td>
                    <td className="p-3 text-center text-primary font-medium">{row.prime}</td>
                    <td className="p-3 text-center text-purple-600 font-medium">{row.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrokerSubscription;
