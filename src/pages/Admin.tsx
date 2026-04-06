import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, DollarSign, BarChart3, Loader2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdManagement from "@/components/admin/AdManagement";
import AdAnalytics from "@/components/admin/AdAnalytics";
import CustomerManagement from "@/components/admin/CustomerManagement";
import UserAnalytics from "@/components/admin/UserAnalytics";
import AccountManagement from "@/components/admin/AccountManagement";
import { supabase } from "@/integrations/supabase/client";

// Predefined ad placement slots across the website
export const AD_PLACEMENT_SLOTS = [
  { value: "homepage-hero", label: "Homepage - Hero Banner", description: "Top of homepage, full width" },
  { value: "homepage-mid", label: "Homepage - Mid Section", description: "Between property listings on homepage" },
  { value: "homepage-bottom", label: "Homepage - Bottom", description: "Bottom of homepage before footer" },
  { value: "search-top", label: "Search Results - Top", description: "Above search results" },
  { value: "search-between", label: "Search Results - Between Listings", description: "Inserted between property cards" },
  { value: "search-sidebar", label: "Search Results - Sidebar", description: "Right sidebar on search page" },
  { value: "property-detail", label: "Property Detail - Sidebar", description: "Sidebar on property detail page" },
  { value: "property-below", label: "Property Detail - Below Content", description: "Below property details" },
  { value: "broker-page", label: "Brokers Page", description: "Ad slot on brokers listing page" },
  { value: "emi-calculator", label: "EMI Calculator Page", description: "Ad slot on EMI calculator" },
  { value: "global-sticky", label: "Global - Sticky Bottom", description: "Sticky banner at bottom of all pages" },
] as const;

export type AdPlacement = typeof AD_PLACEMENT_SLOTS[number]["value"];

export interface AdminAd {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  ad_type: string;
  status: string;
  customer_name: string;
  price: number;
  views: number;
  clicks: number;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  link_url: string | null;
  link_type: string;
  placement: string;
  created_at: string;
  updated_at: string;
}

export interface AdCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  total_spent: number;
  ads_count: number;
  join_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [customers, setCustomers] = useState<AdCustomer[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Realtime subscriptions
    const adsChannel = supabase
      .channel('admin-ads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_ads' }, () => fetchAds())
      .subscribe();

    const customersChannel = supabase
      .channel('admin-customers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ad_customers' }, () => fetchCustomers())
      .subscribe();

    return () => {
      supabase.removeChannel(adsChannel);
      supabase.removeChannel(customersChannel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAds(), fetchCustomers()]);
    setLoading(false);
  };

  const fetchAds = async () => {
    const { data } = await supabase.from('admin_ads').select('*').order('created_at', { ascending: false });
    if (data) setAds(data as unknown as AdminAd[]);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from('ad_customers').select('*').order('created_at', { ascending: false });
    if (data) setCustomers(data as unknown as AdCustomer[]);
  };

  const totalRevenue = ads.reduce((sum, ad) => sum + ad.price, 0);
  const activeAds = ads.filter(ad => ad.status === "active").length;
  const pendingAds = ads.filter(ad => ad.status === "pending").length;
  const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ad Management Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage customer advertisements and track performance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/add-property')}>
              <Home className="h-4 w-4" />
              Add Property
            </Button>
            <Button variant="premium" className="gap-2" onClick={() => setActiveTab("ads")}>
              <Plus className="h-4 w-4" />
              Create New Ad
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">From all advertisements</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <div className="text-2xl font-bold">{activeAds}</div>
                  <p className="text-xs text-muted-foreground">Currently running</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <div className="text-2xl font-bold">{pendingAds}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across all ads</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="ads">Ad Management</TabsTrigger>
            <TabsTrigger value="analytics">Ad Analytics</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="users"><UserAnalytics /></TabsContent>
          <TabsContent value="accounts"><AccountManagement /></TabsContent>
          <TabsContent value="ads"><AdManagement ads={ads} onRefresh={fetchAds} /></TabsContent>
          <TabsContent value="analytics"><AdAnalytics ads={ads} /></TabsContent>
          <TabsContent value="customers"><CustomerManagement customers={customers} onRefresh={fetchCustomers} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
