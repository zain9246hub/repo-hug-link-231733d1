import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Building2, HardHat, Home, CreditCard, TrendingUp, 
  MessageSquare, Search, Megaphone, ArrowUpRight, ArrowDownRight, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['hsl(var(--muted-foreground))', 'hsl(var(--primary))', 'hsl(var(--accent))'];

const StatCard = ({ icon: Icon, label, value, change, changeType, loading }: {
  icon: any; label: string; value: string | number; change: string; changeType: "up" | "down"; loading?: boolean;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
        </div>
        <Badge variant={changeType === "up" ? "default" : "destructive"} className="gap-1">
          {changeType === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

interface MonthlyData {
  month: string;
  owners: number;
  brokers: number;
  builders: number;
  buyers: number;
}

interface AdMonthlyData {
  month: string;
  banner: number;
  inline: number;
  sponsorship: number;
}

interface FeatureMonthlyData {
  month: string;
  chats: number;
  aiSearch: number;
}

const getMonthLabel = (date: Date) => date.toLocaleString('default', { month: 'short' });

const getLast7Months = () => {
  const months = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ label: getMonthLabel(d), start: new Date(d.getFullYear(), d.getMonth(), 1), end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59) });
  }
  return months;
};

const UserAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [totalBrokers, setTotalBrokers] = useState(0);
  const [totalBuilders, setTotalBuilders] = useState(0);
  const [totalOwners, setTotalOwners] = useState(0);
  const [totalBuyers, setTotalBuyers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [paidSubscribers, setPaidSubscribers] = useState(0);
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState<{ name: string; value: number; color: string }[]>([]);
  const [totalAdApps, setTotalAdApps] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [totalAISearches, setTotalAISearches] = useState(0);
  const [userGrowthData, setUserGrowthData] = useState<MonthlyData[]>([]);
  const [adApplicationsData, setAdApplicationsData] = useState<AdMonthlyData[]>([]);
  const [featureUsageData, setFeatureUsageData] = useState<FeatureMonthlyData[]>([]);
  const [userBreakdown, setUserBreakdown] = useState<any[]>([]);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState(0);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserCounts(),
        fetchSubscriptions(),
        fetchAdApplications(),
        fetchFeatureUsage(),
        fetchMonthlyGrowth(),
        fetchMonthlyAds(),
        fetchMonthlyFeatures(),
      ]);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCounts = async () => {
    const { data: profiles } = await supabase.from("profiles").select("user_type, is_active");
    if (!profiles) return;

    const brokers = profiles.filter(p => p.user_type === 'broker');
    const builders = profiles.filter(p => p.user_type === 'builder');
    const owners = profiles.filter(p => p.user_type === 'owner');
    const buyers = profiles.filter(p => p.user_type === 'buyer');

    setTotalBrokers(brokers.length);
    setTotalBuilders(builders.length);
    setTotalOwners(owners.length);
    setTotalBuyers(buyers.length);
    setTotalUsers(profiles.length);

    setUserBreakdown([
      { type: "Brokers", count: brokers.length, active: brokers.filter(b => b.is_active).length, icon: Building2 },
      { type: "Builders", count: builders.length, active: builders.filter(b => b.is_active).length, icon: HardHat },
      { type: "Owners", count: owners.length, active: owners.filter(o => o.is_active).length, icon: Home },
      { type: "Buyers/Renters", count: buyers.length, active: buyers.filter(b => b.is_active).length, icon: Users },
    ]);
  };

  const fetchSubscriptions = async () => {
    const { data: subs } = await supabase.from("subscriptions").select("plan, status, amount");
    if (!subs) return;

    const activeSubs = subs.filter(s => s.status === 'active');
    const free = activeSubs.filter(s => s.plan === 'free').length;
    const prime = activeSubs.filter(s => s.plan === 'prime').length;
    const elite = activeSubs.filter(s => s.plan === 'elite').length;

    setPaidSubscribers(prime + elite);
    setSubscriptionRevenue(activeSubs.reduce((sum, s) => sum + (s.amount || 0), 0));
    setSubscriptionBreakdown([
      { name: "Free", value: free, color: "hsl(var(--muted-foreground))" },
      { name: "Prime", value: prime, color: "hsl(var(--primary))" },
      { name: "Elite", value: elite, color: "hsl(var(--accent))" },
    ]);
  };

  const fetchAdApplications = async () => {
    const { data: ads } = await supabase.from("ad_applications").select("ad_type");
    setTotalAdApps(ads?.length || 0);
  };

  const fetchFeatureUsage = async () => {
    const { data: features } = await supabase.from("feature_usage").select("feature");
    if (!features) return;
    setTotalChats(features.filter(f => f.feature === 'chat').length);
    setTotalAISearches(features.filter(f => f.feature === 'ai_search').length);
  };

  const fetchMonthlyGrowth = async () => {
    const months = getLast7Months();
    const { data: profiles } = await supabase.from("profiles").select("user_type, created_at");
    if (!profiles) return;

    const monthlyData: MonthlyData[] = months.map(m => {
      const inMonth = profiles.filter(p => {
        const d = new Date(p.created_at);
        return d >= m.start && d <= m.end;
      });
      // Cumulative count up to this month's end
      const cumulative = profiles.filter(p => new Date(p.created_at) <= m.end);
      return {
        month: m.label,
        owners: cumulative.filter(p => p.user_type === 'owner').length,
        brokers: cumulative.filter(p => p.user_type === 'broker').length,
        builders: cumulative.filter(p => p.user_type === 'builder').length,
        buyers: cumulative.filter(p => p.user_type === 'buyer').length,
      };
    });
    setUserGrowthData(monthlyData);
  };

  const fetchMonthlyAds = async () => {
    const months = getLast7Months();
    const { data: ads } = await supabase.from("ad_applications").select("ad_type, created_at");
    if (!ads) return;

    const monthlyData: AdMonthlyData[] = months.map(m => {
      const inMonth = ads.filter(a => {
        const d = new Date(a.created_at);
        return d >= m.start && d <= m.end;
      });
      return {
        month: m.label,
        banner: inMonth.filter(a => a.ad_type === 'banner').length,
        inline: inMonth.filter(a => a.ad_type === 'inline').length,
        sponsorship: inMonth.filter(a => a.ad_type === 'sponsorship').length,
      };
    });
    setAdApplicationsData(monthlyData);
  };

  const fetchMonthlyFeatures = async () => {
    const months = getLast7Months();
    const { data: features } = await supabase.from("feature_usage").select("feature, created_at");
    if (!features) return;

    const monthlyData: FeatureMonthlyData[] = months.map(m => {
      const inMonth = features.filter(f => {
        const d = new Date(f.created_at);
        return d >= m.start && d <= m.end;
      });
      return {
        month: m.label,
        chats: inMonth.filter(f => f.feature === 'chat').length,
        aiSearch: inMonth.filter(f => f.feature === 'ai_search').length,
      };
    });
    setFeatureUsageData(monthlyData);
  };

  const calcChange = (current: number, label: string) => {
    if (current === 0) return { change: "0%", type: "up" as const };
    return { change: `${current}`, type: "up" as const };
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={loading ? "..." : totalUsers.toLocaleString()} change={`${totalUsers}`} changeType="up" loading={loading} />
        <StatCard icon={Building2} label="Brokers" value={loading ? "..." : totalBrokers} change={`${totalBrokers}`} changeType="up" loading={loading} />
        <StatCard icon={HardHat} label="Builders" value={loading ? "..." : totalBuilders} change={`${totalBuilders}`} changeType="up" loading={loading} />
        <StatCard icon={Home} label="Property Owners" value={loading ? "..." : totalOwners.toLocaleString()} change={`${totalOwners}`} changeType="up" loading={loading} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CreditCard} label="Paid Subscribers" value={loading ? "..." : paidSubscribers} change={`${paidSubscribers}`} changeType="up" loading={loading} />
        <StatCard icon={Megaphone} label="Ad Applications" value={loading ? "..." : totalAdApps} change={`${totalAdApps}`} changeType="up" loading={loading} />
        <StatCard icon={MessageSquare} label="City Chats" value={loading ? "..." : totalChats} change={`${totalChats}`} changeType="up" loading={loading} />
        <StatCard icon={Search} label="AI Searches" value={loading ? "..." : totalAISearches} change={`${totalAISearches}`} changeType="up" loading={loading} />
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
          <CardDescription>Cumulative users by type over last 7 months</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[320px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Area type="monotone" dataKey="owners" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Owners" />
                <Area type="monotone" dataKey="brokers" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} name="Brokers" />
                <Area type="monotone" dataKey="builders" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.3} name="Builders" />
                <Area type="monotone" dataKey="buyers" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.2} name="Buyers" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[320px] text-muted-foreground">
              <p>No user data yet. Users will appear here as they sign up.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Distribution of users across plans</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : subscriptionBreakdown.some(s => s.value > 0) ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={subscriptionBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                      {subscriptionBreakdown.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4 flex-1">
                  {subscriptionBreakdown.map((plan) => (
                    <div key={plan.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-muted-foreground">{plan.value} users</span>
                      </div>
                      <Progress value={totalUsers > 0 ? (plan.value / totalUsers) * 100 : 0} className="h-2" />
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground">Revenue: <span className="font-bold text-foreground">₹{subscriptionRevenue.toLocaleString()}/mo</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <p>No subscriptions yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ad Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Applications</CardTitle>
            <CardDescription>Banner, Inline & Sponsorship requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[220px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : adApplicationsData.some(d => d.banner + d.inline + d.sponsorship > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={adApplicationsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="banner" fill="hsl(var(--primary))" name="Banner Ads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inline" fill="hsl(var(--accent))" name="Inline Ads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sponsorship" fill="hsl(var(--secondary))" name="Sponsorships" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                <p>No ad applications yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>City Chat & AI Property Search activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : featureUsageData.some(d => d.chats + d.aiSearch > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={featureUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Line type="monotone" dataKey="chats" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name="City Chats" />
                <Line type="monotone" dataKey="aiSearch" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 4 }} name="AI Property Search" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No feature usage data yet. Data will appear as users interact.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>User Type Breakdown</CardTitle>
          <CardDescription>Real-time metrics by user category</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {userBreakdown.map((row: any) => (
                <div key={row.type} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <row.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{row.type}</p>
                      <p className="text-xs text-muted-foreground">{row.count} total</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{row.active}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{row.count - row.active}</p>
                      <p className="text-xs text-muted-foreground">Inactive</p>
                    </div>
                  </div>
                </div>
              ))}
              {userBreakdown.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No users registered yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;
