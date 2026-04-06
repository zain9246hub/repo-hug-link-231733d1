import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, IndianRupee, Home } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import { useToast } from '@/hooks/use-toast';

const ListRental = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isHeavyDeposit, setIsHeavyDeposit] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams.get('heavy-deposit') === 'true') {
      setIsHeavyDeposit(true);
      setFormData({ ...formData, heavyDeposit: true });
    }
  }, [searchParams]);

  const handleSaveDraft = () => {
    const drafts = JSON.parse(localStorage.getItem('rentalDrafts') || '[]');
    const draft = {
      ...formData,
      images: uploadedImages,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    drafts.push(draft);
    localStorage.setItem('rentalDrafts', JSON.stringify(drafts));
    toast({
      title: "Draft saved",
      description: "Your rental listing has been saved as draft",
    });
    navigate('/profile');
  };

  const handlePublish = () => {
    if (!formData.title || !formData.monthlyRent || uploadedImages.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in title, monthly rent and upload at least one image",
        variant: "destructive"
      });
      return;
    }

    const listings = JSON.parse(localStorage.getItem('rentalListings') || '[]');
    const listing = {
      ...formData,
      images: uploadedImages,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'published'
    };
    listings.push(listing);
    localStorage.setItem('rentalListings', JSON.stringify(listings));
    toast({
      title: "Listing published",
      description: "Your rental property has been published successfully",
    });
    navigate('/');
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            {isHeavyDeposit ? 'List Your Heavy Deposit Property' : 'List Your Rental Property'}
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="commercial">Commercial Space</SelectItem>
                    <SelectItem value="shop">Shop</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="pg">PG/Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bhk">BHK Configuration*</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
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
                <Label htmlFor="city">City*</Label>
                <Input id="city" placeholder="Enter city" />
              </div>
              <div>
                <Label htmlFor="locality">Locality*</Label>
                <Input id="locality" placeholder="Enter locality/area" />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode*</Label>
                <Input id="pincode" placeholder="Enter pincode" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Complete Address*</Label>
              <Textarea id="address" placeholder="Enter complete address" />
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="carpet-area">Carpet Area (sq ft)*</Label>
                <Input id="carpet-area" placeholder="Enter carpet area" type="number" />
              </div>
              <div>
                <Label htmlFor="built-area">Built-up Area (sq ft)</Label>
                <Input id="built-area" placeholder="Enter built-up area" type="number" />
              </div>
              <div>
                <Label htmlFor="floor">Floor*</Label>
                <Input id="floor" placeholder="e.g., 2nd Floor out of 10" />
              </div>
              <div>
                <Label htmlFor="age">Property Age*</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Under Construction</SelectItem>
                    <SelectItem value="0-1">0-1 Years</SelectItem>
                    <SelectItem value="1-5">1-5 Years</SelectItem>
                    <SelectItem value="5-10">5-10 Years</SelectItem>
                    <SelectItem value="10+">10+ Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms*</Label>
                <Input id="bathrooms" placeholder="Number of bathrooms" type="number" />
              </div>
              <div>
                <Label htmlFor="balconies">Balconies</Label>
                <Input id="balconies" placeholder="Number of balconies" type="number" />
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Rental Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly-rent">Monthly Rent*</Label>
                <Input 
                  id="monthly-rent" 
                  placeholder="Enter monthly rent" 
                  type="number"
                  value={formData.monthlyRent || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="security-deposit">Security Deposit*{isHeavyDeposit ? ' (Heavy Deposit)' : ''}</Label>
                <Input 
                  id="security-deposit" 
                  placeholder={isHeavyDeposit ? "Enter heavy security deposit (6+ months)" : "Enter security deposit"} 
                  type="number" 
                />
              </div>
              <div>
                <Label htmlFor="furnishing-status">Furnishing Status*</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fully-furnished">Fully Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="available-from">Available From*</Label>
                <Input id="available-from" placeholder="e.g., Immediate, 15th Jan" />
              </div>
              <div>
                <Label htmlFor="lease-duration">Minimum Lease Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-months">3 Months</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="11-months">11 Months</SelectItem>
                    <SelectItem value="1-year">1 Year</SelectItem>
                    <SelectItem value="2-years">2 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tenant-preference">Tenant Preference</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family Only</SelectItem>
                    <SelectItem value="bachelor">Bachelor Only</SelectItem>
                    <SelectItem value="company">Company Lease</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Rental Amenities & Inclusions */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Rental Amenities & Inclusions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'AC in all rooms', 'Refrigerator', 'Washing Machine', 'Microwave',
                'WiFi Included', 'DTH/Cable', 'Inverter/UPS', 'Geyser',
                'Modular Kitchen', 'Wardrobe', 'Sofa Set', 'Dining Table',
                'Bed & Mattress', 'Study Table', 'Cooler/Fan', 'Water Purifier'
              ].map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox id={amenity.toLowerCase().replace(/[^a-z0-9]/g, '-')} />
                  <Label htmlFor={amenity.toLowerCase().replace(/[^a-z0-9]/g, '-')} className="text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Building Amenities */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Building Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Swimming Pool', 'Gym', 'Parking', 'Security',
                'Lift', 'Power Backup', 'Garden', 'Club House',
                'Children Play Area', 'Sports Facility', 'Shopping Center', 'Hospital Nearby'
              ].map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox id={amenity.toLowerCase().replace(' ', '-')} />
                  <Label htmlFor={amenity.toLowerCase().replace(' ', '-')} className="text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <ImageUploader images={uploadedImages} onImagesChange={setUploadedImages} maxImages={5} />

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Description</h3>
            <Textarea 
              placeholder="Describe your rental property in detail. Mention key features, nearby facilities, transportation, and any additional information that tenants should know."
              rows={5}
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-name">Contact Person Name*</Label>
                <Input id="contact-name" placeholder="Enter contact person name" />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone Number*</Label>
                <Input id="contact-phone" placeholder="Enter phone number" />
              </div>
              <div>
                <Label htmlFor="contact-email">Email Address</Label>
                <Input id="contact-email" placeholder="Enter email address" type="email" />
              </div>
              <div>
                <Label htmlFor="best-time">Best Time to Call</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                    <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                    <SelectItem value="anytime">Anytime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
            <Button variant="default" className="flex-1" onClick={handlePublish}>
              Publish Rental Listing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListRental;