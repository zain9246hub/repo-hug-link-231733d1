import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyListingWithAds from '@/components/PropertyListingWithAds';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Grid3X3, MapPin, Filter, Search, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProperties } from '@/hooks/use-properties';
import { Skeleton } from '@/components/ui/skeleton';
import { useAds, toAdSpace } from '@/hooks/use-ads';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUrgentFilter = searchParams.get('urgent') === 'true';
  const areaFilter = searchParams.get('area');
  const locationFilter = searchParams.get('location');
  const listingTypeFilter = searchParams.get('listing_type') || undefined;
  const postedByFilter = searchParams.get('posted_by') || undefined;
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(areaFilter || locationFilter || '');

  const activeLocationFilter = areaFilter || locationFilter || undefined;

  const { properties, loading } = useProperties({
    is_urgent: isUrgentFilter || undefined,
    area: activeLocationFilter,
    listing_type: listingTypeFilter,
  });

  const { ads: searchAds } = useAds(["search-between", "search-top"]);

  const ITEMS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    setSearchInput(activeLocationFilter || '');
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeLocationFilter, isUrgentFilter]);

  const sortedProperties = useMemo(() => [...properties], [properties]);

  const visibleProperties = sortedProperties.slice(0, visibleCount).map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    location: p.location,
    area: p.area,
    image: p.image_url || '/placeholder.svg',
    propertyType: p.property_type as 'sale' | 'rent',
    listingType: p.listing_type as 'owner' | 'broker',
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    isVerified: p.is_verified,
    isUrgent: p.is_urgent,
    urgencyLevel: p.urgency_level as 'high' | 'medium' | 'low' | undefined,
    daysLeft: p.days_left || undefined,
    originalPrice: p.original_price || undefined,
    priceReduction: p.price_reduction || undefined,
  }));

  const hasMore = visibleCount < sortedProperties.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, sortedProperties.length));
  };

  const handleSearch = () => {
    const next = searchInput.trim();
    const nextParams = new URLSearchParams(searchParams);

    if (next) {
      nextParams.set('location', next);
      nextParams.set('area', next);
    } else {
      nextParams.delete('location');
      nextParams.delete('area');
    }

    navigate(`/search?${nextParams.toString()}`);
  };

  const adSpaces = searchAds.map(toAdSpace);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 bg-background border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search properties, location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>
      
      <div className="px-4 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
            {isUrgentFilter && <Zap className="h-5 w-5 text-destructive" />}
            {isUrgentFilter ? 'Urgent Sale Properties' : activeLocationFilter ? `${activeLocationFilter} Properties` : 'All Properties'}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {loading ? 'Loading...' : `${sortedProperties.length} properties found`}
          </p>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          <Button variant="outline" size="sm" className="flex-shrink-0" onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
              <SheetHeader className="sticky top-0 bg-background z-10 pb-4">
                <SheetTitle>Filter Properties</SheetTitle>
              </SheetHeader>
              <div className="mt-4 pb-6">
                <PropertyFilters onClose={() => setShowFilters(false)} />
              </div>
            </SheetContent>
          </Sheet>
          
          <Select defaultValue="relevance">
            <SelectTrigger className="w-36 flex-shrink-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price ↑</SelectItem>
              <SelectItem value="price-high">Price ↓</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" className="flex-shrink-0" onClick={() => setViewMode('grid')}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => navigate('/nomad-map')}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : sortedProperties.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search in a different area.</p>
          </div>
        ) : (
          <PropertyListingWithAds 
            properties={visibleProperties}
            adSpaces={adSpaces}
            adFrequency={3}
            className="grid-cols-1 sm:grid-cols-2"
          />
        )}

        {hasMore && (
          <div className="text-center pt-6">
            <Button variant="outline" className="w-full" onClick={handleLoadMore}>
              Load More Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
