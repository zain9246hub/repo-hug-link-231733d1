import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Users, BarChart3, TrendingUp, Eye, Phone,
  IndianRupee, MapPin, Shield, Crown, ChevronRight, Edit2,
  HardHat, Layers, Clock, CheckCircle2, AlertTriangle, Home, Megaphone, MousePointerClick
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import builder1 from '@/assets/builder-1.jpg';
import property1 from '@/assets/property-1.webp';
import property2 from '@/assets/property-2.webp';
import property3 from '@/assets/property-3.webp';

const BuilderDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [leadCount, setLeadCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    if (user) {
      // Fetch leads
      supabase
        .from('builder_inquiries')
        .select('*')
        .eq('builder_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data) {
            setRecentLeads(data);
            setLeadCount(data.length);
          }
        });

      // Fetch subscription status
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setCurrentPlan(data[0].plan);
            setIsVerified(data[0].plan === 'prime' || data[0].plan === 'elite');
          }
        });
    }
  }, [user]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const builderName = user?.user_metadata?.full_name || 'Builder';
  const photo = builder1;

  const projectStats = [
    { label: 'Active Projects', value: 4, icon: Building2, color: 'from-blue-500 to-blue-600' },
    { label: 'Units Sold', value: 128, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Units Available', value: 56, icon: Layers, color: 'from-orange-500 to-orange-600' },
    { label: 'Enquiries', value: 43, icon: Phone, color: 'from-purple-500 to-purple-600' },
  ];

  const quickActions = [
    { label: 'New Project', icon: Plus, path: '/builder-list-project' },
    { label: 'Leads', icon: Users, path: '/builder-leads' },
    { label: 'My Projects', icon: Building2, path: '/builder-projects' },
    { label: 'Subscription', icon: Crown, path: '/broker-subscription?type=builder' },
  ];

  const projects = [
    {
      id: '1', name: 'Sunrise Residency', location: 'Vesu, Surat',
      totalUnits: 120, soldUnits: 85, status: 'Ongoing',
      image: property1, completionPercent: 65, priceRange: '₹45L - ₹1.2Cr',
      views: 1240, clicks: 342, inquiries: 28,
    },
    {
      id: '2', name: 'Green Valley Villas', location: 'Adajan, Surat',
      totalUnits: 40, soldUnits: 32, status: 'Near Completion',
      image: property2, completionPercent: 88, priceRange: '₹90L - ₹1.8Cr',
      views: 890, clicks: 267, inquiries: 19,
    },
    {
      id: '3', name: 'Metro Heights', location: 'Limbayat, Surat',
      totalUnits: 200, soldUnits: 67, status: 'Ongoing',
      image: property3, completionPercent: 35, priceRange: '₹35L - ₹85L',
      views: 2100, clicks: 456, inquiries: 35,
    },
  ];


  const bannerAds = [
    { name: 'Sunrise Residency Launch', status: 'Active', impressions: 12400, clicks: 342, ctr: '2.76%', spent: '₹8,500' },
    { name: 'Green Valley Diwali Offer', status: 'Active', impressions: 8900, clicks: 267, ctr: '3.00%', spent: '₹6,200' },
    { name: 'Metro Heights Early Bird', status: 'Paused', impressions: 4500, clicks: 98, ctr: '2.18%', spent: '₹3,100' },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground text-center">Builder Login Required</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">Please log in to access your builder dashboard and manage your projects.</p>
        <Button onClick={() => navigate('/auth')} className="mt-2">Log In / Sign Up</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-background to-orange-50/50 pb-24">
      {/* Profile Card */}
      <div className="px-4 pt-4">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-3 items-start">
              <img src={photo} alt={builderName} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-foreground text-lg truncate">{builderName}</h2>
                  {isVerified && <Shield className="h-5 w-5 text-primary fill-primary" />}
                  <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/30 text-amber-600">
                    <HardHat className="h-3 w-3" /> Builder
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => navigate('/profile')}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {isVerified && (
                  <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary mb-1">
                    <Shield className="h-3 w-3" /> Verified {currentPlan === 'elite' ? 'Elite' : 'Prime'} Builder
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">RERA Registered Developer</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span>Surat, Gujarat</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-2">
          {projectStats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-3 text-white relative overflow-hidden`}>
              <Icon className="h-5 w-5 absolute top-2 right-2 opacity-30" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-[10px] mt-0.5 opacity-90">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-foreground mb-3">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <button key={label} onClick={() => navigate(path)} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] text-foreground font-medium text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Analytics */}
      <div className="px-4 mt-4">
        <Card className="cursor-pointer" onClick={() => setShowAnalytics(!showAnalytics)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Project Analytics</h3>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showAnalytics ? 'rotate-90' : ''}`} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue (This Quarter)</span>
                <span className="font-semibold text-foreground">₹12.4 Cr</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '72%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Enquiry to Sale Rate</span>
                <span className="font-semibold text-foreground">18%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '18%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Site Visit Conversion</span>
                <span className="font-semibold text-foreground">42%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            {showAnalytics && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Detailed Breakdown</h4>

                {/* Monthly Revenue */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Monthly Revenue Trend</p>
                  {[
                    { month: 'Jan', value: '₹2.8 Cr', percent: 56 },
                    { month: 'Feb', value: '₹3.6 Cr', percent: 72 },
                    { month: 'Mar', value: '₹6.0 Cr', percent: 100 },
                  ].map(m => (
                    <div key={m.month} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-8">{m.month}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${m.percent}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-16 text-right">{m.value}</span>
                    </div>
                  ))}
                </div>

                {/* Project-wise Sales */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Project-wise Sales</p>
                  {[
                    { name: 'Sunrise Residency', sold: 85, total: 120, revenue: '₹5.2 Cr' },
                    { name: 'Green Valley Villas', sold: 32, total: 40, revenue: '₹4.8 Cr' },
                    { name: 'Metro Heights', sold: 67, total: 200, revenue: '₹2.4 Cr' },
                  ].map(p => (
                    <div key={p.name} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">{p.name}</span>
                        <span className="text-xs font-bold text-primary">{p.revenue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(p.sold / p.total) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{p.sold}/{p.total}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Avg. Deal Size', value: '₹72L' },
                    { label: 'Enquiries/Month', value: '43' },
                    { label: 'Site Visits', value: '128' },
                    { label: 'Repeat Buyers', value: '12%' },
                  ].map(m => (
                    <div key={m.label} className="p-2.5 rounded-lg bg-muted/30 text-center">
                      <p className="text-lg font-bold text-foreground">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Banner Ad Analytics */}
      <div className="px-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Banner Ad Analytics</h3>
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7" onClick={() => navigate('/advertise')}>
                <Megaphone className="h-3 w-3 mr-1" /> Buy Ads
              </Button>
            </div>
            <div className="space-y-3">
              {bannerAds.map((ad, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">{ad.name}</p>
                    <Badge variant="outline" className={`text-[10px] ${ad.status === 'Active' ? 'border-emerald-500/30 text-emerald-600' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                      {ad.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="text-sm font-bold text-foreground">{ad.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                      <p className="text-sm font-bold text-foreground">{ad.clicks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="text-sm font-bold text-primary">{ad.ctr}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="text-sm font-bold text-foreground">{ad.spent}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Active Projects</h3>
          <button className="text-xs text-primary" onClick={() => navigate('/builder-projects')}>View All</button>
        </div>
        <div className="space-y-3">
          {projects.map(project => (
            <Card key={project.id} className="overflow-hidden cursor-pointer" onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}>
              <CardContent className="p-0">
                <div className="flex">
                  <img src={project.image} alt={project.name} className="w-28 h-32 object-cover" />
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-foreground text-sm">{project.name}</p>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${
                        project.status === 'Near Completion' ? 'border-emerald-500/30 text-emerald-600' : 'border-primary/30 text-primary'
                      }`}>{project.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span>{project.location}</span>
                    </div>
                    <p className="text-xs text-primary font-semibold mt-1">{project.priceRange}</p>
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{project.soldUnits}/{project.totalUnits} units sold</span>
                        <span>{project.completionPercent}% built</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(project.soldUnits / project.totalUnits) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Project Analytics - shown on tap */}
                {expandedProject === project.id && (
                  <div className="border-t border-border px-4 py-3 bg-muted/20 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-xs font-semibold text-foreground mb-2">Project Performance</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                        <Eye className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{project.views.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                        <MousePointerClick className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{project.clicks}</p>
                        <p className="text-[10px] text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                        <Phone className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{project.inquiries}</p>
                        <p className="text-[10px] text-muted-foreground">Inquiries</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">Share Project</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">Edit</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="px-4 mt-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Recent Enquiries</h3>
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7" onClick={() => navigate('/builder-leads')}>
                View All
              </Button>
            </div>
            {recentLeads.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No enquiries yet</p>
                <p className="text-xs mt-1">Leads will appear when users enquire about your projects</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((enquiry: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{enquiry.name}</p>
                        <p className="text-xs text-muted-foreground">{enquiry.project_name}{enquiry.unit_type ? ` • ${enquiry.unit_type}` : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">{enquiry.budget || '-'}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(enquiry.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuilderDashboard;
