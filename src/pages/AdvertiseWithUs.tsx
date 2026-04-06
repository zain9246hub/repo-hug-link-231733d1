import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, BarChart3, Eye, Users, Star, ArrowRight, CheckCircle, IndianRupee, Image, Layout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

const adPlans = [
  {
    id: "banner",
    name: "Banner Carousel",
    icon: Image,
    price: "₹2,999",
    duration: "per week",
    description: "Your ad displayed in the homepage banner carousel seen by every visitor.",
    features: [
      "Full-width banner placement",
      "Auto-rotating carousel slot",
      "Custom image & CTA link",
      "Average 10,000+ impressions/week",
    ],
    popular: false,
  },
  {
    id: "sponsored",
    name: "Sponsored Property",
    icon: Star,
    price: "₹4,999",
    duration: "per week",
    description: "Premium spotlight in the Sponsored Properties section with builder branding.",
    features: [
      "Featured in Sponsored section",
      "Builder/brand logo display",
      "High-visibility placement",
      "Average 15,000+ impressions/week",
    ],
    popular: true,
  },
  {
    id: "inline",
    name: "Inline Ad",
    icon: Layout,
    price: "₹999",
    duration: "per week",
    description: "Inline ad cards placed between property listings throughout the app.",
    features: [
      "Mixed into property feeds",
      "Horizontal or square format",
      "Appears in search results too",
      "Average 5,000+ impressions/week",
    ],
    popular: false,
  },
];

function useLiveStats() {
  const [stats, setStats] = useState({
    visitors: 0,
    impressions: 0,
    advertisers: 0,
    avgCtr: "0",
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch profiles count as proxy for visitors
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch ad applications (active advertisers)
      const { data: adApps } = await supabase
        .from('ad_applications')
        .select('impressions, clicks');

      const totalImpressions = adApps?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0;
      const totalClicks = adApps?.reduce((sum, a) => sum + (a.clicks || 0), 0) || 0;
      const activeAdvertisers = adApps?.length || 0;
      const avgCtr = totalImpressions > 0
        ? ((totalClicks / totalImpressions) * 100).toFixed(1)
        : "0";

      setStats({
        visitors: profileCount || 0,
        impressions: totalImpressions,
        advertisers: activeAdvertisers,
        avgCtr,
      });
    };
    fetchStats();
  }, []);

  return stats;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return n.toString();
}

const AdvertiseWithUs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const liveStats = useLiveStats();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const statsDisplay = [
    { label: "Registered Users", value: formatNumber(liveStats.visitors), icon: Users },
    { label: "Total Impressions", value: formatNumber(liveStats.impressions), icon: Eye },
    { label: "Active Advertisers", value: formatNumber(liveStats.advertisers), icon: Megaphone },
    { label: "Avg. CTR", value: `${liveStats.avgCtr}%`, icon: BarChart3 },
  ];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    adType: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "Our team will contact you within 24 hours to discuss your advertising needs.",
    });
    setIsApplyOpen(false);
    setFormData({ name: "", email: "", phone: "", company: "", adType: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Megaphone className="h-3 w-3 mr-1" /> Advertise With Us
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Reach Thousands of Property Seekers
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-6">
            Promote your brand, services, or properties directly to active home buyers and renters across India.
          </p>
          <Button
            size="lg"
            className="bg-gradient-primary text-primary-foreground shadow-lg"
            onClick={() => {
              setSelectedPlan("");
              setIsApplyOpen(true);
            }}
          >
            Get Started <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {statsDisplay.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-4 pb-3">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Ad Plans */}
      <section className="px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Advertising Plans</h2>
            <p className="text-muted-foreground">Choose the format that works best for your brand</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all hover:shadow-xl hover:-translate-y-1 ${
                  plan.popular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow">
                      <Sparkles className="h-3 w-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-6">
                  <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">/{plan.duration}</span>
                  </div>
                  <Separator />
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular ? "bg-gradient-primary text-primary-foreground" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setFormData((prev) => ({ ...prev, adType: plan.id }));
                      setIsApplyOpen(true);
                    }}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-10 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Apply", desc: "Fill out the form with your ad details and preferred plan." },
              { step: "2", title: "Review", desc: "Our team reviews your submission and contacts you within 24 hrs." },
              { step: "3", title: "Go Live", desc: "Once approved, your ad goes live and starts reaching users." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for Advertising</DialogTitle>
            <DialogDescription>
              Fill in your details and we'll get back to you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Type</Label>
              <Select
                value={formData.adType}
                onValueChange={(v) => setFormData({ ...formData, adType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ad type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner Carousel</SelectItem>
                  <SelectItem value="sponsored">Sponsored Property</SelectItem>
                  <SelectItem value="inline">Inline Ad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us about your advertising goals..." />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">
              Submit Application
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertiseWithUs;
