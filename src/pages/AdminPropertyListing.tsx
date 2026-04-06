import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, MapPin, IndianRupee, Zap, AlertTriangle, X, UserPlus, Send, ArrowLeft } from 'lucide-react';
import { SURAT_AREAS } from '@/data/locations';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const AdminPropertyListing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<any>({ city: 'Surat' });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignMethod, setAssignMethod] = useState<'direct' | 'invite'>('direct');
  const [targetEmail, setTargetEmail] = useState('');
  const [targetRole, setTargetRole] = useState('owner');
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const filteredAreas = SURAT_AREAS.filter(area =>
    area.toLowerCase().includes(areaSearch.toLowerCase())
  ).sort();

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Only JPEG, PNG, WebP and GIF images are allowed.", variant: "destructive" });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File too large", description: `${file.name} exceeds the 5MB limit.`, variant: "destructive" });
        continue;
      }
      validFiles.push(file);
    }

    for (const file of validFiles) {
      const fileExt = file.name.split('.').pop();
      const filePath = `admin/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file);
      if (uploadError) {
        toast({ title: "Upload failed", description: "Could not upload image. Please try again.", variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(filePath);
      setUploadedImages(prev => [...prev, urlData.publicUrl]);
    }

    if (validFiles.length > 0) {
      toast({ title: "Images uploaded", description: `${validFiles.length} image(s) added successfully` });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.title || !formData.price) {
      toast({ title: "Missing information", description: "Please fill in title and price", variant: "destructive" });
      return;
    }
    if (!targetEmail) {
      toast({ title: "Missing email", description: "Please enter the target user's email", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (assignMethod === 'direct') {
        // Find user by email via profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id')
          .limit(1000);
        
        // We need to find the user_id for the target email
        // Check if there's a user with that email by looking up auth
        // Since we can't query auth.users, we'll create the property under admin
        // and then try to find the target user
        let targetUserId = user.id; // fallback to admin

        // Try to find user via brokers table (if broker)
        if (targetRole === 'broker') {
          const { data: broker } = await supabase
            .from('brokers')
            .select('user_id')
            .eq('email', targetEmail)
            .single();
          if (broker?.user_id) targetUserId = broker.user_id;
        }

        const propertyData = {
          user_id: targetUserId,
          title: formData.title,
          description: formData.description || '',
          location: formData.locality ? `${formData.locality}, Surat` : 'Surat',
          city: 'Surat',
          price: formData.price,
          image_url: uploadedImages.length > 0 ? uploadedImages[0] : null,
          bedrooms: parseInt(formData.bhk?.replace(/[^0-9]/g, '') || '0') || 0,
          bathrooms: parseInt(formData.bathrooms || '0') || 0,
          area: formData.carpetArea ? `${formData.carpetArea} sq ft` : '',
          property_type: (formData.listingFor || 'sale') as 'sale' | 'rent',
          listing_type: targetRole,
          posted_by: targetRole === 'broker' ? 'Broker' : targetRole === 'builder' ? 'Builder' : 'Owner',
          phone: formData.phone || null,
          is_verified: true,
          is_featured: formData.isFeatured || false,
          is_urgent: formData.urgentSale || false,
          status: 'published',
        };

        const { data: property, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Property created & assigned",
          description: `Property assigned to ${targetEmail} as ${targetRole}`,
        });
      } else {
        // Invite flow: create property under admin, then create invite
        const propertyData = {
          user_id: user.id,
          title: formData.title,
          description: formData.description || '',
          location: formData.locality ? `${formData.locality}, Surat` : 'Surat',
          city: 'Surat',
          price: formData.price,
          image_url: uploadedImages.length > 0 ? uploadedImages[0] : null,
          bedrooms: parseInt(formData.bhk?.replace(/[^0-9]/g, '') || '0') || 0,
          bathrooms: parseInt(formData.bathrooms || '0') || 0,
          area: formData.carpetArea ? `${formData.carpetArea} sq ft` : '',
          property_type: (formData.listingFor || 'sale') as 'sale' | 'rent',
          listing_type: targetRole,
          posted_by: targetRole === 'broker' ? 'Broker' : targetRole === 'builder' ? 'Builder' : 'Owner',
          phone: formData.phone || null,
          is_verified: true,
          is_featured: formData.isFeatured || false,
          is_urgent: formData.urgentSale || false,
          status: 'published',
        };

        const { data: property, error: propError } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();

        if (propError) throw propError;

        // Create invite
        const { error: inviteError } = await supabase
          .from('property_invites')
          .insert({
            property_id: property.id,
            invited_email: targetEmail,
            invited_role: targetRole,
            created_by: user.id,
          });

        if (inviteError) throw inviteError;

        toast({
          title: "Invite sent!",
          description: `Property invite sent to ${targetEmail}. They can accept it from their dashboard.`,
        });
      }

      navigate('/admin');
    } catch (error: any) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate('/admin')}>
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin - Add Property</CardTitle>
          <p className="text-muted-foreground">Create a property and assign or invite a user to own it</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Assignment Method */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Property Assignment
            </h3>
            <Tabs value={assignMethod} onValueChange={(v) => setAssignMethod(v as 'direct' | 'invite')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="direct">Direct Assign</TabsTrigger>
                <TabsTrigger value="invite">Send Invite</TabsTrigger>
              </TabsList>
              <TabsContent value="direct" className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Directly assign this property to a registered user's account.
                </p>
              </TabsContent>
              <TabsContent value="invite" className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Send an invite to the user. The property will transfer when they accept.
                </p>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Target User Email*</Label>
                <Input
                  placeholder="user@example.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Assign As*</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Property Title*</Label>
                <Input placeholder="Enter property title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <Label>Listing For*</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, listingFor: v })}>
                  <SelectTrigger><SelectValue placeholder="Rent or Sell" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sell</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Property Type</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, propertyType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>BHK</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, bhk: v })}>
                  <SelectTrigger><SelectValue placeholder="Select BHK" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1rk">1 RK</SelectItem>
                    <SelectItem value="1bhk">1 BHK</SelectItem>
                    <SelectItem value="2bhk">2 BHK</SelectItem>
                    <SelectItem value="3bhk">3 BHK</SelectItem>
                    <SelectItem value="4bhk">4 BHK</SelectItem>
                    <SelectItem value="5bhk+">5+ BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="Contact phone" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Location
            </h3>
            <div className="relative">
              <Label>Area*</Label>
              <Input
                placeholder="Search area in Surat..."
                value={areaSearch}
                onChange={(e) => {
                  setAreaSearch(e.target.value);
                  setShowAreaDropdown(true);
                }}
                onFocus={() => setShowAreaDropdown(true)}
              />
              {formData.locality && (
                <p className="text-sm text-muted-foreground mt-1">Selected: <span className="font-medium text-foreground">{formData.locality}</span></p>
              )}
              {showAreaDropdown && areaSearch.length >= 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {filteredAreas.slice(0, 50).map((area) => (
                    <button
                      key={area}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => {
                        setFormData({ ...formData, locality: area });
                        setAreaSearch(area);
                        setShowAreaDropdown(false);
                      }}
                    >
                      {area}
                    </button>
                  ))}
                  {filteredAreas.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No areas found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <IndianRupee className="h-5 w-5" /> Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Price*</Label>
                <Input placeholder="Enter price" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div>
                <Label>Carpet Area (sq ft)</Label>
                <Input placeholder="Area" type="number" onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })} />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input placeholder="Number" type="number" onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="featured" onCheckedChange={(c) => setFormData({ ...formData, isFeatured: c })} />
              <Label htmlFor="featured">Featured Listing</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="urgent" onCheckedChange={(c) => setFormData({ ...formData, urgentSale: c })} />
              <Label htmlFor="urgent" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Urgent Sale
              </Label>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Images</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <Input type="file" accept="image/*" multiple className="hidden" id="admin-img-upload" onChange={handleImageUpload} />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('admin-img-upload')?.click()}>Choose Files</Button>
            </div>
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`Upload ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeImage(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Property description" rows={4} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          {/* Submit */}
          <Button className="w-full gap-2" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : assignMethod === 'direct' ? (
              <><UserPlus className="h-4 w-4" /> Create & Assign Property</>
            ) : (
              <><Send className="h-4 w-4" /> Create & Send Invite</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPropertyListing;
