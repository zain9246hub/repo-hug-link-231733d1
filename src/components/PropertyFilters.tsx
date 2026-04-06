import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { MapPin, Filter, IndianRupee, Home, Search, Zap, Clock } from 'lucide-react';
import { SURAT_AREAS } from '@/data/locations';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface PropertyFiltersProps {
  onClose?: () => void;
}

const PropertyFilters = ({ onClose }: PropertyFiltersProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [searchText, setSearchText] = useState(searchParams.get('location') || '');
  const [urgentOnly, setUrgentOnly] = useState(searchParams.get('urgent') === 'true');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [listingType, setListingType] = useState(searchParams.get('listing_type') || 'all');
  const [postedBy, setPostedBy] = useState(searchParams.get('posted_by') || 'all');

  const togglePropertyType = (type: string) => {
    setPropertyTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams();

    if (area && area !== 'all') {
      params.set('area', area);
      params.set('location', area);
    } else if (searchText.trim()) {
      params.set('location', searchText.trim());
      params.set('area', searchText.trim());
    }

    if (urgentOnly) params.set('urgent', 'true');
    if (listingType && listingType !== 'all') params.set('listing_type', listingType);
    if (postedBy && postedBy !== 'all') params.set('posted_by', postedBy);
    if (propertyTypes.length > 0) params.set('property_type', propertyTypes.join(','));
    if (priceRange[0] > 0) params.set('price_min', priceRange[0].toString());
    if (priceRange[1] < 50000000) params.set('price_max', priceRange[1].toString());

    navigate(`/search?${params.toString()}`);
    onClose?.();
  };

  const handleClear = () => {
    setPriceRange([0, 10000000]);
    setArea('');
    setSearchText('');
    setUrgentOnly(false);
    setPropertyTypes([]);
    setListingType('all');
    setPostedBy('all');
    navigate('/search');
    onClose?.();
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Location */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location (Surat)
          </Label>
          <div>
            <Label htmlFor="area-filter" className="text-sm">Area</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger>
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All Areas</SelectItem>
                {[...SURAT_AREAS].sort().map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by area or project"
              className="pl-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Urgent Sale Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-destructive">
            <Zap className="h-4 w-4" />
            Urgent Sales
          </Label>
          <div className="flex items-center space-x-2">
            <Checkbox id="urgent-only" checked={urgentOnly} onCheckedChange={(v) => setUrgentOnly(!!v)} />
            <Label htmlFor="urgent-only" className="text-sm">Show only urgent sales</Label>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Property Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {['Apartment', 'Bungalow', 'Villa', 'Plot'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type.toLowerCase()}
                  checked={propertyTypes.includes(type.toLowerCase())}
                  onCheckedChange={() => togglePropertyType(type.toLowerCase())}
                />
                <Label htmlFor={type.toLowerCase()} className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Budget Range
          </Label>
          <div className="px-2">
            <Slider
              defaultValue={[0, 10000000]}
              max={50000000}
              step={100000}
              value={priceRange}
              onValueChange={setPriceRange}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{(priceRange[0] / 100000).toFixed(1)}L</span>
            <span>₹{(priceRange[1] / 100000).toFixed(1)}L</span>
          </div>
        </div>

        {/* Listing Type */}
        <div className="space-y-2">
          <Label>Listing Type</Label>
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger>
              <SelectValue placeholder="Select listing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
              <SelectItem value="pg">PG/Hostel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posted By */}
        <div className="space-y-2">
          <Label>Posted By</Label>
          <Select value={postedBy} onValueChange={setPostedBy}>
            <SelectTrigger>
              <SelectValue placeholder="Select poster type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
              <SelectItem value="builder">Builder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Apply Filters */}
        <div className="space-y-2 pt-4 border-t">
          <Button className="w-full" variant="default" onClick={handleApply}>
            Apply Filters
          </Button>
          <Button className="w-full" variant="outline" onClick={handleClear}>
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFilters;
