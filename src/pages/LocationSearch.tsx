import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, TrendingUp, Home, Building2, ArrowLeft } from 'lucide-react';
import PropertyListingWithAds from '@/components/PropertyListingWithAds';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProperties } from '@/hooks/use-properties';
import { Skeleton } from '@/components/ui/skeleton';
import { useAds, toAdSpace } from '@/hooks/use-ads';
import { supabase } from '@/integrations/supabase/client';
import { SURAT_AREAS } from '@/data/locations';

interface AreaWithCount {
  name: string;
  count: number;
}

const LocationSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || searchParams.get('location') || '');
  const [popularAreas, setPopularAreas] = useState<AreaWithCount[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);

  // Fetch live area counts from database
  useEffect(() => {
    const fetchAreaCounts = async () => {
      setAreasLoading(true);
      const { data, error } = await supabase.rpc('get_published_properties', {
        _city: 'Surat',
        _limit: 1000,
      });

      if (data && !error) {
        const areaMap: Record<string, number> = {};
        data.forEach((p: any) => {
          const location = (p.location || '').toLowerCase();
          for (const area of SURAT_AREAS) {
            if (location.includes(area.toLowerCase())) {
              areaMap[area] = (areaMap[area] || 0) + 1;
              break;
            }
          }
        });

        const sorted = Object.entries(areaMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        // If we have areas with properties, show them; otherwise show all areas
        if (sorted.length > 0) {
          setPopularAreas(sorted);
        } else {
          setPopularAreas(SURAT_AREAS.slice(0, 12).map(name => ({ name, count: 0 })));
        }
      } else {
        setPopularAreas(SURAT_AREAS.slice(0, 12).map(name => ({ name, count: 0 })));
      }
      setAreasLoading(false);
    };

    fetchAreaCounts();
  }, []);

  useEffect(() => {
    const nextArea = searchParams.get('area') || searchParams.get('location') || '';
    setSearchLocation(searchParams.get('location') || nextArea);
    setSelectedArea(nextArea);
  }, [searchParams]);

  const { properties, loading } = useProperties(selectedArea ? { area: selectedArea } : undefined);
  const { ads: locationAds } = useAds(["search-between"]);

  const filteredProperties = properties;

  const mappedProperties = filteredProperties.map(p => ({
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
    isFeatured: p.is_featured,
    isUrgent: p.is_urgent,
    urgencyLevel: p.urgency_level as 'high' | 'medium' | 'low' | undefined,
    daysLeft: p.days_left || undefined,
  }));

  const handleSearch = () => {
    const nextArea = searchLocation.trim();
    if (!nextArea) return;
    navigate(`/search?location=${encodeURIComponent(nextArea)}&area=${encodeURIComponent(nextArea)}`);
  };

  const handleAreaClick = (areaName: string) => {
    setSearchLocation(areaName);
    navigate(`/search?location=${encodeURIComponent(areaName)}&area=${encodeURIComponent(areaName)}`);
  };

  const adSpaces = locationAds.map(toAdSpace);

  // Filter areas based on search input
  const displayAreas = searchLocation.trim()
    ? popularAreas.filter(a => a.name.toLowerCase().includes(searchLocation.toLowerCase()))
    : popularAreas;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-primary py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-primary-foreground mb-2 text-center">Find Properties by Area</h1>
          <p className="text-primary-foreground/80 text-center mb-6">Search properties in Surat's top localities</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search area (e.g., Vesu, Adajan, Pal)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 bg-background"
              />
            </div>
            <Button size="lg" onClick={handleSearch} className="bg-secondary hover:bg-secondary/90">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!selectedArea ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" /> Popular Areas in Surat
            </h2>
            {areasLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {displayAreas.map((area) => (
                  <Card
                    key={area.name}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
                    onClick={() => handleAreaClick(area.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-base text-foreground">{area.name}</h3>
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {area.count} {area.count === 1 ? 'property' : 'properties'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
                {displayAreas.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    No areas found for "{searchLocation}"
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" /> Properties in {selectedArea}
                  </h2>
                  <p className="text-muted-foreground">
                    {loading ? 'Loading...' : `${filteredProperties.length} properties found`}
                  </p>
                </div>
                 <Button variant="outline" onClick={() => navigate('/location-search')}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties in {selectedArea}</h3>
                <p className="text-muted-foreground">Be the first to list a property here!</p>
                <Button className="mt-4" onClick={() => navigate('/list-property')}>List Property</Button>
              </div>
            ) : (
              <PropertyListingWithAds properties={mappedProperties} adSpaces={adSpaces} adFrequency={3} className="grid-cols-1 sm:grid-cols-2" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;
