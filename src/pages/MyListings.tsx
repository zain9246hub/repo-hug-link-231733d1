import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Home, Edit, Trash2, MapPin, IndianRupee, Calendar, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMyProperties, Property } from '@/hooks/use-properties';
import { Skeleton } from '@/components/ui/skeleton';

const LISTING_EXPIRY_DAYS = 30;

const getDaysRemaining = (property: Property): number => {
  const createdAt = new Date(property.created_at);
  const expiryDate = new Date(createdAt.getTime() + LISTING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const diff = expiryDate.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const isExpired = (property: Property): boolean => {
  return getDaysRemaining(property) === 0;
};

const MyListings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { properties, loading, deleteProperty, renewProperty } = useMyProperties();

  const publishedProperties = properties.filter(p => p.status === 'published' && p.property_type === 'sale');
  const draftProperties = properties.filter(p => p.status === 'draft' && p.property_type === 'sale');
  const publishedRentals = properties.filter(p => p.status === 'published' && p.property_type === 'rent');
  const draftRentals = properties.filter(p => p.status === 'draft' && p.property_type === 'rent');

  const handleDelete = async (id: string) => {
    const { error } = await deleteProperty(id);
    if (!error) {
      toast({ title: "Listing deleted", description: "Your listing has been removed successfully" });
    } else {
      toast({ title: "Error", description: "Failed to delete listing", variant: "destructive" });
    }
  };

  const handleRenew = async (id: string) => {
    const { error } = await renewProperty(id);
    if (!error) {
      toast({ title: "Listing renewed", description: "Your listing has been renewed for 30 more days" });
    } else {
      toast({ title: "Error", description: "Failed to renew listing", variant: "destructive" });
    }
  };

  const ListingCard = ({ property }: { property: Property }) => {
    const isRental = property.property_type === 'rent';
    const expired = isExpired(property);
    const daysLeft = getDaysRemaining(property);

    return (
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${expired ? 'opacity-60 border-destructive/30' : ''}`}>
        <div className="relative">
          {property.image_url ? (
            <img src={property.image_url} alt={property.title} className="w-full h-48 object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <Home className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1">
            {expired ? (
              <Badge className="bg-destructive text-destructive-foreground">Expired</Badge>
            ) : (
              <Badge className={property.status === 'draft' ? 'bg-yellow-500' : 'bg-green-500'}>
                {property.status === 'draft' ? 'Draft' : 'Published'}
              </Badge>
            )}
          </div>
          {!expired && daysLeft <= 7 && (
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="bg-background/80 text-amber-600 border-amber-500/30 text-[10px]">
                <AlertTriangle className="h-3 w-3 mr-1" /> {daysLeft}d left
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
            {property.location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {property.location}
              </div>
            )}
          </div>
          {property.price && (
            <div className="flex items-center text-primary font-bold">
              <IndianRupee className="h-4 w-4 mr-1" />
              {property.price} {isRental && <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>}
            </div>
          )}
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {expired ? 'Expired' : `Expires in ${daysLeft} days`}
          </div>
          <div className="flex gap-2 pt-2">
            {expired ? (
              <Button size="sm" className="flex-1" onClick={() => handleRenew(property.id)}>
                <RefreshCw className="h-3 w-3 mr-1" /> Renew (30 days)
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/list-property?edit=${property.id}`)}>
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(property.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="w-full h-48" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSection = (title: string, description: string, items: Property[]) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => <ListingCard key={p.id} property={p} />)}
          </div>
        ) : (
          <EmptyState message={`No ${title.toLowerCase()} yet`} />
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Listings</h1>
        <p className="text-muted-foreground">Manage your property and rental listings</p>
      </div>

      <Tabs defaultValue="property-sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="property-sales">Property Sales</TabsTrigger>
          <TabsTrigger value="rentals">Rentals</TabsTrigger>
        </TabsList>

        <TabsContent value="property-sales" className="space-y-6">
          {renderSection("Published Listings", "Your active property sale listings", publishedProperties)}
          {renderSection("Draft Listings", "Your saved property sale drafts", draftProperties)}
        </TabsContent>

        <TabsContent value="rentals" className="space-y-6">
          {renderSection("Published Listings", "Your active rental listings", publishedRentals)}
          {renderSection("Draft Listings", "Your saved rental drafts", draftRentals)}
        </TabsContent>
      </Tabs>

      <div className="mt-8 pb-20 flex gap-3">
        <Button onClick={() => navigate('/list-property')} className="flex-1 h-12 text-sm">
          <Home className="h-4 w-4 mr-2 flex-shrink-0" /> List Property for Sale
        </Button>
        <Button onClick={() => navigate('/list-rental')} variant="secondary" className="flex-1 h-12 text-sm">
          <Home className="h-4 w-4 mr-2 flex-shrink-0" /> List Rental Property
        </Button>
      </div>
    </div>
  );
};

export default MyListings;
