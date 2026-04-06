import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Phone, AlertCircle, Calendar, Plus, Users, BarChart3, 
  Clock, Shield, Crown, ChevronRight, Edit2, MessageSquare,
  IndianRupee, MapPin, Eye, Bed, Bath, Maximize, Loader2, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import broker1 from '@/assets/broker-1.jpg';

interface BrokerData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  photo_url: string | null;
  experience_years: number;
  specialization: string;
  areas: string[];
  rating: number;
  total_reviews: number;
  properties_sold: number;
  verified: boolean;
  bio: string | null;
}

interface PropertyListing {
  id: string;
  title: string;
  location: string;
  price: string;
  listing_type: string;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string | null;
  image_url: string | null;
  status: string | null;
  created_at: string | null;
}

interface LeadData {
  id: string;
  name: string;
  property_interest: string | null;
  phone: string;
  status: string;
  created_at: string;
}

const BrokerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [broker, setBroker] = useState<BrokerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'prime' | 'elite'>('free');
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Live data states
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pendingLeads, setPendingLeads] = useState(0);
  const [todayLeads, setTodayLeads] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [convertedLeads, setConvertedLeads] = useState(0);
  const [freeListingsUsed, setFreeListingsUsed] = useState(0);

  const freeListingsTotal = 2;

  const getNextResetDate = () => {
    const now = new Date();
    const month = now.getMonth();
    const nextResetMonth = month + (2 - (month % 2));
    const resetDate = new Date(now.getFullYear(), nextResetMonth, 1);
    return resetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) { setLoading(false); return; }
      
      const { data } = await supabase
        .from('brokers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) setBroker(data as BrokerData);

      const brokerId = (data as any)?.id;

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (subData && subData.length > 0) {
        const plan = subData[0].plan as 'free' | 'prime' | 'elite';
        setCurrentPlan(plan);
      }

      const { data: propData } = await supabase
        .from('properties')
        .select('id, title, location, price, listing_type, property_type, bedrooms, bathrooms, area, image_url, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (propData) setListings(propData);

      const { count: listCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setTotalListings(listCount || 0);

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 2), 1);
      const { count: periodCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', periodStart.toISOString());
      setFreeListingsUsed(periodCount || 0);

      if (brokerId) {
        const { data: leadData } = await supabase
          .from('broker_inquiries')
          .select('id, name, property_interest, phone, status, created_at')
          .eq('broker_id', brokerId)
          .order('created_at', { ascending: false })
          .limit(5);
        if (leadData) setLeads(leadData);

        const { count: leadCount } = await supabase
          .from('broker_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('broker_id', brokerId);
        setTotalLeads(leadCount || 0);

        const { count: pendCount } = await supabase
          .from('broker_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('broker_id', brokerId)
          .eq('status', 'pending');
        setPendingLeads(pendCount || 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
          .from('broker_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('broker_id', brokerId)
          .gte('created_at', todayStart.toISOString());
        setTodayLeads(todayCount || 0);

        const { count: convCount } = await supabase
          .from('broker_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('broker_id', brokerId)
          .eq('status', 'converted');
        setConvertedLeads(convCount || 0);

        const { count: clientCount } = await supabase
          .from('broker_clients')
          .select('*', { count: 'exact', head: true })
          .eq('broker_id', brokerId);
        setTotalClients(clientCount || 0);
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const isVerified = broker?.verified || false;

  const handleAddPropertyClick = () => {
    if (!isVerified) {
      setShowPaymentModal(true);
    } else {
      navigate('/list-property');
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    // Cashfree integration placeholder — secrets will be added later
    // For now, show a message that payment gateway is being set up
    setTimeout(() => {
      setPaymentLoading(false);
      toast.error('Payment gateway is being configured. Please try again later.');
    }, 1500);
  };

  const stats = [
    { label: 'Total Listings', value: totalListings, icon: Home, color: 'from-blue-500 to-blue-600', iconColor: 'text-blue-100' },
    { label: isVerified ? 'Leads' : 'Leads (Unlock after verification)', value: totalLeads, icon: Phone, color: 'from-emerald-500 to-emerald-600', iconColor: 'text-emerald-100' },
    { label: 'Pending', value: pendingLeads, icon: AlertCircle, color: 'from-orange-500 to-orange-600', iconColor: 'text-orange-100' },
    { label: "Today's", value: todayLeads, icon: Calendar, color: 'from-red-500 to-red-600', iconColor: 'text-red-100' },
  ];

  const quickActions = [
    { label: 'Add Property', icon: Plus, action: handleAddPropertyClick },
    { label: 'Pending Leads', icon: Clock, action: () => navigate('/broker-leads') },
    { label: 'My Clients', icon: Users, action: () => navigate('/broker-clients') },
    { label: 'Subscription', icon: Crown, action: () => navigate('/broker-subscription') },
  ];

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const responseRate = totalLeads > 0 ? Math.round(((totalLeads - pendingLeads) / totalLeads) * 100) : 0;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground text-center">Broker Login Required</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">Please log in to access your broker dashboard and manage your listings.</p>
        <Button onClick={() => navigate('/auth')} className="mt-2">
          Log In / Sign Up
        </Button>
      </div>
    );
  }

  const brokerName = broker?.name || user?.user_metadata?.full_name || 'Broker';
  const brokerPhone = broker?.phone || 'Not set';
  const brokerAreas = broker?.areas?.length ? broker.areas : [];
  const photo = broker?.photo_url || broker1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-background to-indigo-50/50 pb-24">
      {/* Payment Modal */}
      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-[360px] mx-auto rounded-2xl p-0 border-0 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-xl bg-background/95">
          <div className="p-6 pb-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">Complete your broker verification</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Start posting properties and unlock your broker profile
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 space-y-2.5">
            {[
              'Post up to 2 properties',
              'Get verified badge',
              'Higher visibility to buyers',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="px-6 pt-2 pb-1 text-center">
            <p className="text-xs text-muted-foreground tracking-wide">₹99 one-time registration fee • Lifetime access</p>
          </div>

          <div className="px-6 pt-3 pb-2 space-y-2.5">
            <Button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="w-full h-12 rounded-xl text-[15px] font-semibold shadow-lg shadow-primary/20"
            >
              {paymentLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
              ) : (
                'Unlock Access for ₹99'
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Secure payment • No hidden charges</p>
          </div>

          <div className="px-6 pb-5">
            <Button
              variant="ghost"
              onClick={() => setShowPaymentModal(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-[360px] mx-auto rounded-2xl p-0 border-0 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-xl bg-background/95">
          <div className="p-6 pb-2 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">You are now a Verified Broker!</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Congratulations! You can now start posting your properties and unlock exclusive benefits.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pt-2 pb-1 text-center">
            <p className="text-xs text-muted-foreground tracking-wide">₹99 registration fee • Lifetime access</p>
          </div>

          <div className="px-6 pt-4 pb-2">
            <Button
              className="w-full h-12 rounded-xl text-[15px] font-semibold shadow-lg shadow-primary/20"
              onClick={() => { setShowSuccessModal(false); navigate('/list-property'); }}
            >
              Post Your First Property
            </Button>
          </div>

          <div className="px-6 pb-5">
            <Button
              variant="ghost"
              onClick={() => setShowSuccessModal(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Card */}
      <div className="px-4 pt-4">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-3 items-start">
              <img src={photo} alt={brokerName} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-foreground text-lg truncate">{brokerName}</h2>
                  {isVerified && <Shield className="h-5 w-5 text-primary fill-primary" />}
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => navigate('/profile')}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {isVerified ? (
                  <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary mb-1">
                    <Shield className="h-3 w-3" /> Verified {currentPlan === 'elite' ? 'Elite' : 'Prime'} Broker
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs gap-1 border-orange-400/50 text-orange-600 mb-1">
                    <Lock className="h-3 w-3" /> Not Verified
                  </Badge>
                )}
                {brokerAreas.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{brokerAreas.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{brokerPhone}</span>
                  <span className="text-primary">|</span>
                  <MessageSquare className="h-3 w-3 text-primary" />
                  <span className="text-primary">WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Membership Info */}
            <div className="flex items-center gap-3 mt-3 p-2.5 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1.5 text-sm">
                {isVerified ? (
                  <Crown className="h-4 w-4 text-primary" />
                ) : (
                  <Home className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">
                  {isVerified
                    ? currentPlan === 'elite' ? 'Elite Membership' : 'Prime Membership'
                    : 'Basic Account'}
                </span>
                <Badge variant={isVerified ? 'default' : 'outline'} className="text-[10px] px-1.5">
                  {isVerified ? 'Active' : 'Not Verified'}
                </Badge>
              </div>
              <Button
                size="sm"
                variant={isVerified ? 'outline' : 'default'}
                className="ml-auto text-xs h-7"
                onClick={() => isVerified ? navigate('/broker-subscription') : setShowPaymentModal(true)}
              >
                {isVerified ? 'Upgrade' : 'Get Verified – ₹99'}
              </Button>
            </div>

            {/* Listing Quota */}
            {!isVerified ? (
              <div className="mt-2 p-2.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-700 dark:text-orange-300 font-medium">Listings: 0 (Available after verification)</span>
                </div>
              </div>
            ) : currentPlan === 'free' ? (
              <div className="mt-2 p-2.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-700 dark:text-orange-300 font-medium">Free Listings: {freeListingsUsed}/{freeListingsTotal} used</span>
                  <span className="text-orange-600 dark:text-orange-400">Resets: {getNextResetDate()}</span>
                </div>
                <div className="w-full bg-orange-200 dark:bg-orange-900 rounded-full h-1.5 mt-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(freeListingsUsed / freeListingsTotal) * 100}%` }} />
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-2">
          {stats.map(({ label, value, icon: Icon, color, iconColor }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-3 text-white relative overflow-hidden`}>
              <Icon className={`h-5 w-5 ${iconColor} absolute top-2 right-2 opacity-50`} />
              <p className="text-2xl font-bold">{!isVerified && label.includes('Unlock') ? 0 : value}</p>
              <p className="text-[10px] mt-0.5 opacity-90 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Quick Actions</h3>
              <button className="text-xs text-primary flex items-center gap-0.5">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
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

      {/* Recent Listings */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Recent Listings</h3>
          <button className="text-xs text-primary" onClick={() => navigate('/my-listings')}>View All</button>
        </div>
        {listings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Home className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isVerified ? 'No listings yet' : 'No listings yet (Post after verification)'}
              </p>
              <Button size="sm" className="mt-3" onClick={handleAddPropertyClick}>
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {listings.map(listing => {
              const daysAgo = listing.created_at ? Math.floor((Date.now() - new Date(listing.created_at).getTime()) / 86400000) : 0;
              const typeLabel = listing.property_type === 'rent' ? 'For Rent' : 'For Sale';
              return (
                <Card key={listing.id} className="overflow-hidden cursor-pointer" onClick={() => setExpandedListing(expandedListing === listing.id ? null : listing.id)}>
                  <CardContent className="p-0">
                    <div className="flex">
                      {listing.image_url ? (
                        <img src={listing.image_url} alt={listing.title} className="w-28 h-28 object-cover" loading="lazy" />
                      ) : (
                        <div className="w-28 h-28 bg-muted flex items-center justify-center">
                          <Home className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-foreground">{listing.price}</p>
                          <Badge variant="outline" className={`text-[10px] ${listing.status === 'published' ? 'border-emerald-500/30 text-emerald-600' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                            {listing.status === 'published' ? '● Active' : listing.status || 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-0.5">{listing.title}</p>
                        <p className="text-xs text-muted-foreground">{listing.location}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="text-primary font-medium">{typeLabel}</span>
                          {listing.area && (
                            <>
                              <span>|</span>
                              <Maximize className="h-3 w-3" />
                              <span>{listing.area}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {listing.bedrooms != null && listing.bedrooms > 0 && (
                              <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{listing.bedrooms}</span>
                            )}
                            {listing.bathrooms != null && listing.bathrooms > 0 && (
                              <>
                                <span>|</span>
                                <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{listing.bathrooms}</span>
                              </>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{daysAgo}d ago</span>
                        </div>
                      </div>
                    </div>
                    {expandedListing === listing.id && (
                      <div className="border-t border-border px-4 py-3 bg-muted/20 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex gap-2 mt-1">
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">Share Listing</Button>
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); navigate('/my-listings'); }}>Edit</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics Overview */}
      <div className="px-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Performance Analytics</h3>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Clients</span>
                <span className="font-semibold text-foreground">{totalClients}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(totalClients * 10, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lead Conversion Rate</span>
                <span className="font-semibold text-foreground">{conversionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${conversionRate}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Rate</span>
                <span className="font-semibold text-foreground">{responseRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${responseRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <div className="px-4 mt-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Recent Customer Leads</h3>
              <Badge variant="outline" className="text-xs">{pendingLeads} New</Badge>
            </div>
            {leads.length === 0 ? (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isVerified ? 'No leads yet' : '0 (Unlock after verification)'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => {
                  const handleAction = () => {
                    if (lead.status === 'pending') {
                      window.open(`tel:${lead.phone}`, '_self');
                    } else {
                      navigate('/broker-leads');
                    }
                  };
                  return (
                    <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{lead.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.property_interest || 'General inquiry'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] cursor-pointer hover:bg-primary/10 transition-colors ${
                            lead.status === 'pending' ? 'border-orange-500/30 text-orange-600' :
                            lead.status === 'converted' ? 'border-emerald-500/30 text-emerald-600' :
                            ''
                          }`}
                          onClick={handleAction}
                        >
                          {lead.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(lead.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
                {leads.length > 0 && (
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/broker-leads')}>
                    View All Leads <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrokerDashboard;
