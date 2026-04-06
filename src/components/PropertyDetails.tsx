import React, { useState, useEffect } from 'react';
import BuilderInquiryDialog from '@/components/BuilderInquiryDialog';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  MapPin, 
  IndianRupee, 
  Home, 
  Bed, 
  Bath, 
  Car, 
  Calendar,
  Shield,
  Phone,
  Mail,
  Heart,
  Share2,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface PropertyDetailsProps {
  property?: any;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ 
  property: propProp
}) => {
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [dbProperty, setDbProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (propProp || !id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching property:', error);
      } else if (data) {
        setDbProperty(data);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id, propProp]);

  const rawProp = propProp || dbProperty;

  // Derive property object (safe to compute even if rawProp is null)
  const property = rawProp ? (propProp ? propProp : {
    id: rawProp.id,
    title: rawProp.title || 'Untitled Property',
    price: parseFloat(String(rawProp.price).replace(/[^\d.]/g, '')) || 0,
    priceDisplay: rawProp.price,
    type: rawProp.property_type === 'sale' ? 'For Sale' : 'For Rent',
    bhk: rawProp.bedrooms ? `${rawProp.bedrooms} BHK` : 'N/A',
    area: parseFloat(String(rawProp.area).replace(/[^\d.]/g, '')) || 0,
    areaDisplay: rawProp.area || 'N/A',
    location: rawProp.location,
    city: rawProp.city || 'Surat',
    images: rawProp.image_url ? [rawProp.image_url] : ['/placeholder.svg'],
    amenities: rawProp.furnishing ? [rawProp.furnishing] : [],
    description: rawProp.description || 'No description provided.',
    posted_by: rawProp.posted_by || 'Owner',
    verified: rawProp.is_verified || false,
    rera_id: null,
    phone: rawProp.phone,
    bedrooms: rawProp.bedrooms || 0,
    bathrooms: rawProp.bathrooms || 0,
    furnishing: rawProp.furnishing,
    deposit: rawProp.deposit,
    available_from: rawProp.available_from,
    listing_type: rawProp.listing_type,
    created_at: rawProp.created_at,
    user_id: rawProp.user_id,
  }) : null;

  useEffect(() => {
    if (property) {
      const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      setIsSaved(savedProperties.includes(property.id));
    }
  }, [property?.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="w-full h-96 rounded-lg" />
        <Skeleton className="w-3/4 h-8" />
        <Skeleton className="w-1/2 h-6" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
        <p className="text-muted-foreground">This property may have been removed or doesn't exist.</p>
      </div>
    );
  }

  const handleSaveProperty = () => {
    setIsSaved(!isSaved);
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    if (isSaved) {
      const updated = savedProperties.filter((propId: string) => propId !== property.id);
      localStorage.setItem('savedProperties', JSON.stringify(updated));
      toast({ title: "Property removed from saved list" });
    } else {
      savedProperties.push(property.id);
      localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
      toast({ title: "Property saved successfully" });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} in ${property.location}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <img 
                        src={property.images[currentImageIndex]} 
                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-96 object-cover rounded-t-lg hover:opacity-95 transition-opacity"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
                    <div className="relative w-full h-full bg-black">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => setIsImageDialogOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <img 
                        src={property.images[currentImageIndex]} 
                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                      
                      {property.images.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </>
                      )}
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Navigation arrows for main image */}
                {property.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.verified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {property.rera_id && (
                    <Badge variant="secondary">RERA Approved</Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary"
                    className={isSaved ? "text-red-500" : ""}
                    onClick={handleSaveProperty}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 right-4">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    <Camera className="h-3 w-3 mr-1" />
                    {property.images.length} Photos
                  </Badge>
                </div>
                
                {/* Thumbnail strip */}
                {property.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {property.images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-12 h-12 rounded border-2 overflow-hidden ${
                          currentImageIndex === index ? 'border-white' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {property.images.length > 4 && (
                      <div className="w-12 h-12 rounded bg-black/50 flex items-center justify-center text-white text-xs">
                        +{property.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.location}, {property.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    ₹{property.priceDisplay || ((property.price / 100000).toFixed(1) + 'L')}
                  </p>
                  {property.area > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ₹{Math.round(property.price / property.area)}/sq ft
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Home className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-medium">{property.type}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Bed className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-medium">{property.bhk}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Bath className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-medium">{property.area} sq ft</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Car className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-medium">Parking</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground">{property.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Map integration coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">
                    {property.posted_by === 'Owner' ? 'O' : 'B'}
                  </span>
                </div>
                <p className="font-medium">Posted by {property.posted_by}</p>
                {property.verified && (
                  <Badge variant="secondary" className="mt-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {property.posted_by === 'Builder' ? (
                <Button className="w-full" onClick={() => setShowInquiry(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enquire Now
                </Button>
              ) : (
                <>
                  <Button className="w-full" asChild>
                    <a href={`tel:${property.phone || ''}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  {property.phone && <p className="text-sm text-center text-muted-foreground mt-1">{property.phone}</p>}
                </>
              )}
              
              <p className="text-xs text-muted-foreground text-center">
                By contacting, you agree to our terms and privacy policy
              </p>
            </CardContent>
          </Card>

          {property.posted_by === 'Builder' && (
            <BuilderInquiryDialog
              open={showInquiry}
              onOpenChange={setShowInquiry}
              projectName={property.title}
              builderUserId={property.posted_by || 'unknown'}
              source="property_detail"
            />
          )}

          {/* Property Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property ID</span>
                <span className="font-medium">#{property.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posted Date</span>
                <span className="font-medium">{property.created_at ? new Date(property.created_at).toLocaleDateString('en-IN') : 'N/A'}</span>
              </div>
              {property.rera_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RERA ID</span>
                  <span className="font-medium">{property.rera_id}</span>
                </div>
              )}
              {property.listing_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed By</span>
                  <span className="font-medium capitalize">{property.listing_type}</span>
                </div>
              )}
              {property.furnishing && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Furnishing</span>
                  <span className="font-medium">{property.furnishing}</span>
                </div>
              )}
              {property.deposit && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="font-medium">₹{property.deposit}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Similar Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                More similar properties coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;