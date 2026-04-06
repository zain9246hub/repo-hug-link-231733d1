import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { AdminAd } from "@/pages/Admin";

interface AdAnalyticsProps {
  ads: AdminAd[];
}

const AdAnalytics = ({ ads }: AdAnalyticsProps) => {
  const adTypeData = ads.reduce((acc, ad) => {
    const existing = acc.find(item => item.type === ad.ad_type);
    if (existing) { existing.count += 1; existing.revenue += ad.price; }
    else acc.push({ type: ad.ad_type, count: 1, revenue: ad.price });
    return acc;
  }, [] as Array<{ type: string; count: number; revenue: number }>);

  const performanceData = ads.map(ad => ({
    name: ad.title.substring(0, 20) + (ad.title.length > 20 ? "..." : ""),
    views: ad.views,
    clicks: ad.clicks,
    ctr: ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) : 0
  }));

  const revenueData = ads.map(ad => ({ customer: ad.customer_name, revenue: ad.price, status: ad.status }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const statusData = ads.reduce((acc, ad) => {
    const existing = acc.find(item => item.status === ad.status);
    if (existing) existing.count += 1;
    else acc.push({ status: ad.status, count: 1 });
    return acc;
  }, [] as Array<{ status: string; count: number }>);

  const totalRevenue = ads.reduce((sum, ad) => sum + ad.price, 0);
  const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const averageCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0";

  if (ads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No ad data available yet. Create ads in the Ad Management tab to see analytics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div><p className="text-xs text-muted-foreground">From {ads.length} ads</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Views</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalViews.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Clicks</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Average CTR</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{averageCTR}%</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ad Performance</CardTitle><CardDescription>Views and clicks by ad</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
                <Bar dataKey="clicks" fill="hsl(var(--secondary))" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ad Type Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={adTypeData} cx="50%" cy="50%" labelLine={false} label={({ type, count }) => `${type}: ${count}`} outerRadius={80} dataKey="count">
                  {adTypeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Revenue by Customer</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="customer" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ad Status Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ status, count }) => `${status}: ${count}`} outerRadius={80} dataKey="count">
                  {statusData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top Performing Ads</CardTitle><CardDescription>Sorted by CTR</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ads.sort((a, b) => {
              const ctrA = a.views > 0 ? (a.clicks / a.views) * 100 : 0;
              const ctrB = b.views > 0 ? (b.clicks / b.views) * 100 : 0;
              return ctrB - ctrA;
            }).slice(0, 5).map((ad) => {
              const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) : "0";
              return (
                <div key={ad.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{ad.title}</h4>
                    <p className="text-sm text-muted-foreground">by {ad.customer_name}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center"><div className="text-sm font-medium">{ad.views}</div><div className="text-xs text-muted-foreground">Views</div></div>
                    <div className="text-center"><div className="text-sm font-medium">{ad.clicks}</div><div className="text-xs text-muted-foreground">Clicks</div></div>
                    <div className="text-center"><div className="text-sm font-medium">{ctr}%</div><div className="text-xs text-muted-foreground">CTR</div></div>
                    <Badge variant={ad.status === "active" ? "default" : "secondary"}>{ad.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdAnalytics;
