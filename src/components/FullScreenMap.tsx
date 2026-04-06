import React, { useState, useEffect } from 'react';
import { X, MapPin, Filter, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PropertyMap from './PropertyMap';
import PropertyCard from './PropertyCard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useProperties } from '@/hooks/use-properties';
import { Skeleton } from '@/components/ui/skeleton';

interface FullScreenMapProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { lat: number; lng: number; city: string; address: string };
}

const FullScreenMap = ({ isOpen, onClose, userLocation }: FullScreenMapProps) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filterCity, setFilterCity] = useState('');

  const { properties, loading } = useProperties(filterCity ? { city: filterCity } : undefined);

  const mappedProperties = properties
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id,
      title: p.title,
      location: p.location,
      price: p.price,
      image: p.image_url || '/placeholder.svg',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      propertyType: p.property_type as 'sale' | 'rent',
      listingType: p.listing_type as 'owner' | 'broker',
      isVerified: p.is_verified,
      coordinates: [p.longitude!, p.latitude!] as [number, number],
      city: p.city,
    }));

  useEffect(() => {
    if (userLocation && userLocation.city) {
      setFilterCity(userLocation.city);
    }
  }, [userLocation]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full h-screen w-screen p-0 rounded-none">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Property Map</h2>
              {userLocation && (
                <Badge variant="secondary" className="text-xs">📍 {userLocation.city}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${mappedProperties.length} properties found`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter by city..." value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-40" />
              </div>
              <div className="flex rounded-lg border p-1">
                <Button variant={viewMode === 'map' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('map')} className="h-7 px-3">
                  <MapPin className="h-3 w-3 mr-1" /> Map
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-7 px-3">
                  <List className="h-3 w-3 mr-1" /> List
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {viewMode === 'map' ? (
              <PropertyMap 
                properties={mappedProperties}
                center={userLocation ? [userLocation.lng, userLocation.lat] : [77.2090, 28.6139]}
                zoom={userLocation ? 11 : 6}
              />
            ) : (
              <div className="h-full overflow-auto p-4">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
                  </div>
                ) : mappedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {mappedProperties.map((property) => (
                      <PropertyCard key={property.id} {...property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                    <p className="text-muted-foreground">Try adjusting your location filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenMap;
