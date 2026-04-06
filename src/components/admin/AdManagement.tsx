import React, { useState, useRef, useCallback } from "react";
import { Edit, Trash2, Eye, Plus, MapPin, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AdBanner from "@/components/AdBanner";
import { AD_PLACEMENT_SLOTS, type AdPlacement, type AdminAd } from "@/pages/Admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface AdFormProps {
  ad?: AdminAd;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const AdForm = React.memo(({ ad, onSubmit, onCancel }: AdFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: ad?.title || "",
    description: ad?.description || "",
    cta_text: ad?.cta_text || "",
    ad_type: ad?.ad_type || "horizontal",
    customer_name: ad?.customer_name || "",
    price: ad?.price || 0,
    start_date: ad?.start_date || "",
    end_date: ad?.end_date || "",
    image_url: ad?.image_url || "",
    placement: ad?.placement || "homepage-hero",
    link_url: ad?.link_url || "",
    link_type: ad?.link_type || "website",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(ad?.image_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Only JPEG, PNG and WebP images are allowed.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Image must be under 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('ad-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      toast({ title: "Upload failed", description: uploadError.message || "Something went wrong.", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('ad-images').getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;
    setFormData(prev => ({ ...prev, image_url: publicUrl }));
    setImagePreview(publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded!" });

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
    setImagePreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ad Title</Label>
          <Input value={formData.title} onChange={(e) => updateField("title", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Customer</Label>
          <Input value={formData.customer_name} onChange={(e) => updateField("customer_name", e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} required />
      </div>
      <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
        <Label className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" />Ad Placement</Label>
        <Select value={formData.placement} onValueChange={(v) => updateField("placement", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {AD_PLACEMENT_SLOTS.map((slot) => (
              <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>CTA Text</Label>
          <Input value={formData.cta_text} onChange={(e) => updateField("cta_text", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Ad Type</Label>
          <Select value={formData.ad_type} onValueChange={(v) => updateField("ad_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="banner-carousel">Banner Carousel</SelectItem>
              <SelectItem value="sponsored">Sponsored</SelectItem>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="square">Square</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input type="number" value={formData.price} onChange={(e) => updateField("price", Number(e.target.value))} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={formData.start_date} onChange={(e) => updateField("start_date", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={formData.end_date} onChange={(e) => updateField("end_date", e.target.value)} />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Ad Image (JPEG, PNG, WebP — max 5MB)</Label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Ad preview"
              className="w-full max-w-xs h-32 object-cover rounded-lg border border-border"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
            <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={removeImage}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Upload an image for this ad</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3 p-3 rounded-lg border border-secondary/20 bg-secondary/5">
        <Label className="font-semibold">🔗 Link Settings</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Link Type</Label>
            <Select value={formData.link_type} onValueChange={(v) => updateField("link_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="website">🌐 Website</SelectItem>
                <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{formData.link_type === "whatsapp" ? "WhatsApp Number" : "Destination URL"}</Label>
            <Input value={formData.link_url} onChange={(e) => updateField("link_url", e.target.value)} placeholder={formData.link_type === "whatsapp" ? "919876543210" : "https://example.com"} />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="p-4 border border-border rounded-lg bg-muted/20">
          <AdBanner type={formData.ad_type === 'banner-carousel' || formData.ad_type === 'sponsored' ? 'horizontal' : formData.ad_type as any} title={formData.title || "Ad Title"} description={formData.description || "Ad description"} ctaText={formData.cta_text || "Click Here"} imageUrl={formData.image_url || undefined} />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="premium">{ad ? "Update Ad" : "Create Ad"}</Button>
      </div>
    </form>
  );
});

AdForm.displayName = "AdForm";

// ─── Main Component ──────────────────────────────────────────

interface AdManagementProps {
  ads: AdminAd[];
  onRefresh: () => void;
}

const AdManagement = ({ ads, onRefresh }: AdManagementProps) => {
  const { toast } = useToast();
  const [selectedAd, setSelectedAd] = useState<AdminAd | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleStatusChange = async (adId: string, newStatus: string) => {
    const { error } = await supabase.from('admin_ads').update({ status: newStatus, updated_at: new Date().toISOString() } as any).eq('id', adId);
    if (error) { console.error('Ad status error:', error); toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' }); }
    else onRefresh();
  };

  const handleDeleteAd = async (adId: string) => {
    const { error } = await supabase.from('admin_ads').delete().eq('id', adId);
    if (error) { console.error('Ad delete error:', error); toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' }); }
    else { toast({ title: 'Deleted' }); onRefresh(); }
  };

  const getPlacementLabel = (placement: string) => {
    return AD_PLACEMENT_SLOTS.find(s => s.value === placement)?.label || placement;
  };

  const handleCreate = async (formData: any) => {
    const { error } = await supabase.from('admin_ads').insert(formData as any);
    if (error) { console.error('Ad create error:', error); toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' }); }
    else { toast({ title: 'Ad Created!' }); setIsCreateModalOpen(false); onRefresh(); }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedAd) return;
    const { error } = await supabase.from('admin_ads').update({ ...formData, updated_at: new Date().toISOString() } as any).eq('id', selectedAd.id);
    if (error) { console.error('Ad update error:', error); toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' }); }
    else { toast({ title: 'Ad Updated!' }); setIsEditModalOpen(false); setSelectedAd(null); onRefresh(); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Advertisement Management
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="premium" size="sm" className="gap-2"><Plus className="h-4 w-4" />New Ad</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Advertisement</DialogTitle>
                <DialogDescription>Add a new customer advertisement</DialogDescription>
              </DialogHeader>
              {isCreateModalOpen && (
                <AdForm key="create" onSubmit={handleCreate} onCancel={() => setIsCreateModalOpen(false)} />
              )}
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Manage customer advertisements, choose placements, and track performance</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" />Placement Slots</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {AD_PLACEMENT_SLOTS.map((slot) => {
              const assignedAds = ads.filter(a => a.placement === slot.value && a.status === "active");
              return (
                <div key={slot.value} className={`p-2 rounded-lg border text-xs ${assignedAds.length > 0 ? "border-primary/30 bg-primary/10" : "border-border bg-muted/30"}`}>
                  <div className="font-medium truncate">{slot.label.split(" - ").pop()}</div>
                  <div className="text-muted-foreground truncate">{slot.label.split(" - ")[0]}</div>
                  <Badge variant={assignedAds.length > 0 ? "default" : "outline"} className="mt-1 text-[10px] h-4">
                    {assignedAds.length > 0 ? `${assignedAds.length} active` : "Empty"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {ads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No ads yet. Create your first ad above.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Details</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="font-medium">{ad.title}</div>
                    <div className="text-xs text-muted-foreground">{ad.customer_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]"><MapPin className="h-3 w-3 mr-1" />{getPlacementLabel(ad.placement)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={ad.status} onValueChange={(v) => handleStatusChange(ad.id, v)}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>₹{ad.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="text-sm">{ad.views} views</div>
                    <div className="text-xs text-muted-foreground">{ad.clicks} clicks</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Dialog>
                        <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Ad Preview</DialogTitle></DialogHeader>
                          <div className="p-4">
                            <div className="text-xs text-muted-foreground mb-2">Placement: {getPlacementLabel(ad.placement)}</div>
                            <AdBanner type={ad.ad_type === 'banner-carousel' || ad.ad_type === 'sponsored' ? 'horizontal' : ad.ad_type as any} title={ad.title} description={ad.description} ctaText={ad.cta_text} imageUrl={ad.image_url || undefined} />
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isEditModalOpen && selectedAd?.id === ad.id} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) setSelectedAd(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedAd(ad)}><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader><DialogTitle>Edit Ad</DialogTitle></DialogHeader>
                          {selectedAd?.id === ad.id && (
                            <AdForm key={`edit-${ad.id}`} ad={selectedAd} onSubmit={handleUpdate} onCancel={() => { setIsEditModalOpen(false); setSelectedAd(null); }} />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteAd(ad.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdManagement;
