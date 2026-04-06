import { useState, useEffect } from "react";
import { Plus, Eye, Edit, BarChart3, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AdBanner from "@/components/AdBanner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface CustomerAd {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  ad_type: string;
  status: string;
  price: number;
  views: number;
  clicks: number;
  start_date: string | null;
  end_date: string | null;
  image_url?: string | null;
}

const CustomerPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<CustomerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchAds();
  }, [user?.id]);

  const fetchAds = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('ad_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAds(data.map(d => ({
        id: d.id,
        title: d.title,
        description: '',
        cta_text: 'Learn More',
        ad_type: d.ad_type,
        status: d.status,
        price: d.spent,
        views: d.impressions,
        clicks: d.clicks,
        start_date: d.created_at,
        end_date: null,
      })));
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "expired": return "bg-muted";
      case "rejected": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const totalSpent = ads.reduce((sum, ad) => sum + ad.price, 0);
  const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const activeAdsCount = ads.filter(ad => ad.status === "active").length;

  const handleCreateAd = async (formData: any) => {
    if (!user) return;
    const { error } = await supabase.from('ad_applications').insert({
      user_id: user.id,
      title: formData.title,
      ad_type: formData.type || 'horizontal',
      status: 'pending',
    });
    if (!error) {
      toast({ title: "Ad submitted", description: "Your ad has been submitted for approval." });
      setIsCreateModalOpen(false);
      fetchAds();
    } else {
      toast({ title: "Error", description: "Failed to submit ad.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Portal</h1>
            <p className="text-muted-foreground mt-2">Welcome back{user ? `, ${user.email}` : ''}</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2"><Plus className="h-4 w-4" /> Create New Ad</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Advertisement</DialogTitle>
                <DialogDescription>Submit a new advertisement for approval</DialogDescription>
              </DialogHeader>
              <AdForm onSubmit={handleCreateAd} onCancel={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{activeAdsCount}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalViews.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Advertisements</CardTitle>
            <CardDescription>Manage your active and pending advertisements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No advertisements yet. Create your first ad!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell><Badge variant="outline">{ad.ad_type}</Badge></TableCell>
                      <TableCell><Badge className={getStatusColor(ad.status)}>{ad.status}</Badge></TableCell>
                      <TableCell>₹{ad.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">{ad.views} views / {ad.clicks} clicks</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({ title: "", description: "", ctaText: "", type: "horizontal" });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div className="space-y-2">
        <Label>Ad Title</Label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Ad Type</Label>
        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal">Horizontal</SelectItem>
            <SelectItem value="vertical">Vertical</SelectItem>
            <SelectItem value="square">Square</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Submit for Approval</Button>
      </div>
    </form>
  );
};

export default CustomerPortal;
