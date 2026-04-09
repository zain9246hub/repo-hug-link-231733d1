import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, IndianRupee, Zap, AlertTriangle } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import { INDIAN_STATES, getCitiesByState } from '@/data/locations';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const PropertyListingForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setCities(getCitiesByState(state));
    setFormData({ ...formData, state });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveToDatabase = async (status: 'published' | 'draft') => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to list a property", variant: "destructive" });
      navigate('/auth');
      return;
    }

    if (status === 'published' && (!formData.title || !formData.price)) {
      toast({ title: "Missing information", description: "Please fill in title and price", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const propertyData = {
      user_id: user.id,
      title: formData.title || 'Untitled Property',
      description: formData.description || '',
      location: formData.locality ? `${formData.locality}, ${formData.city || ''}` : formData.city || '',
      city: formData.city || '',
      price: formData.price || '',
      image_url: uploadedImages.length > 0 ? uploadedImages[0] : null,
      
      bedrooms: parseInt(formData.bhk?.replace(/[^0-9]/g, '') || '0') || 0,
      bathrooms: parseInt(formData.bathrooms || '0') || 0,
      area: formData.carpetArea ? `${formData.carpetArea} sq ft` : '',
      property_type: 'sale' as const,
      listing_type: formData.listedBy || 'owner',
      posted_by: formData.listedBy === 'broker' ? 'Broker' : 'Owner',
      phone: formData.phone || null,
      is_verified: false,
      is_featured: false,
      is_urgent: formData.urgentSale || false,
      status,
    };

    const { error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select('id')
      .single();

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: "Failed to save listing. Please try again.", variant: "destructive" });
      console.error('Error saving property:', error);
      return;
    }

    toast({
      title: status === 'published' ? "Listing published" : "Draft saved",
      description: status === 'published' ? "Your property has been published successfully" : "Your property listing has been saved as draft",
    });
    navigate('/my-listings');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            List Your Property
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property-title">Property Title*</Label>
                <Input 
                  id="property-title" 
                  placeholder="Enter property title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="property-type">Property Type*</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, propertyType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger>
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
                <Label htmlFor="bhk">BHK Configuration*</Label>
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
                <Label htmlFor="listed-by">Listed By*</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, listedBy: v })}>
                  <SelectTrigger><SelectValue placeholder="Select listing type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="state">State*</Label>
                <Select onValueChange={handleStateChange} value={selectedState}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City*</Label>
                <Select disabled={!selectedState} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                  <SelectTrigger><SelectValue placeholder={selectedState ? "Select city" : "Select state first"} /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="locality">Locality*</Label>
                <Input id="locality" placeholder="Enter locality/area" onChange={(e) => setFormData({ ...formData, locality: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Complete Address*</Label>
              <Textarea id="address" placeholder="Enter complete address" onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="carpet-area">Carpet Area (sq ft)*</Label>
                <Input id="carpet-area" placeholder="Enter carpet area" type="number" onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms*</Label>
                <Input id="bathrooms" placeholder="Number of bathrooms" type="number" onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="floor">Floor*</Label>
                <Input id="floor" placeholder="e.g., 2nd Floor out of 10" onChange={(e) => setFormData({ ...formData, floor: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Urgent Sale Section */}
          <div className="space-y-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-destructive">
              <Zap className="h-5 w-5" />
              Urgent Sale Options
            </h3>
            <div className="flex items-center space-x-2">
              <Checkbox id="urgent-sale" onCheckedChange={(checked) => setFormData({ ...formData, urgentSale: checked })} />
              <Label htmlFor="urgent-sale" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                This is an urgent sale - I need to sell quickly
              </Label>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Expected Price*</Label>
                <Input 
                  id="price" 
                  placeholder="Enter price" 
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="original-price">Original Market Price (Optional)</Label>
                <Input id="original-price" placeholder="If offering below market price" onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} />
              </div>
            </div>
          </div>

          <ImageUploader images={uploadedImages} onImagesChange={setUploadedImages} maxImages={5} />

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Description</h3>
            <Textarea 
              placeholder="Describe your property in detail."
              rows={5}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Button variant="outline" className="flex-1" onClick={() => saveToDatabase('draft')} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button variant="default" className="flex-1" onClick={() => saveToDatabase('published')} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyListingForm;
