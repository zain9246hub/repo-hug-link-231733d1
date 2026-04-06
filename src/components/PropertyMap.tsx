import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import EnhancedPropertyMap from './EnhancedPropertyMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, MapPin, Bed, Bath, Square, IndianRupee, Building2, Calendar, User } from 'lucide-react';

// Enhanced Property interface with rental-specific fields
interface PropertyWithLocation {
  id: string;
  title: string;
  location: string;
  price: string;
  monthlyRent?: string;
  deposit?: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  propertyType: "sale" | "rent";
  listingType: "owner" | "broker";
  isVerified?: boolean;
  furnishing?: "furnished" | "semi-furnished" | "unfurnished";
  availableFrom?: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface PropertyMapProps {
  properties?: PropertyWithLocation[];
  center?: [number, number];
  zoom?: number;
}

const PropertyMap = ({ 
  properties = [], 
  center = [77.2090, 28.6139], // Delhi coordinates as default
  zoom = 12 
}: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithLocation | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [listingFilter, setListingFilter] = useState<'all' | 'owner' | 'broker'>('all');

  // Filter properties based on active filters
  const getFilteredProperties = () => {
    let filtered = properties;
    
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(p => p.propertyType === propertyFilter);
    }
    
    if (listingFilter !== 'all') {
      filtered = filtered.filter(p => p.listingType === listingFilter);
    }
    
    return filtered;
  };

  const propertiesData = getFilteredProperties();

  // Get marker style based on property type and listing type
  const getMarkerStyle = (property: PropertyWithLocation) => {
    const isRental = property.propertyType === 'rent';
    const isOwner = property.listingType === 'owner';
    
    const baseColor = isRental ? 'hsl(var(--secondary))' : 'hsl(var(--primary))';
    const borderColor = isOwner ? 'hsl(var(--accent))' : 'white';
    const icon = isRental ? '🏠' : '🏢';
    
    return { baseColor, borderColor, icon };
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: center,
        zoom: zoom,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add enhanced property markers with different styles
      propertiesData.forEach((property) => {
        const { baseColor, borderColor, icon } = getMarkerStyle(property);
        
        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'property-marker';
        markerElement.innerHTML = `
          <div style="background-color: ${baseColor}; border-color: ${borderColor};" class="w-10 h-10 rounded-full border-3 shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 relative">
            <span class="text-lg">${icon}</span>
            ${property.isVerified ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"><span class="text-white text-xs">✓</span></div>' : ''}
            ${property.listingType === 'owner' ? '<div class="absolute -bottom-1 -right-1 w-5 h-4 bg-blue-600 rounded-sm text-white text-xs flex items-center justify-center font-bold">O</div>' : '<div class="absolute -bottom-1 -right-1 w-5 h-4 bg-orange-600 rounded-sm text-white text-xs flex items-center justify-center font-bold">B</div>'}
          </div>
        `;

        // Add marker to map
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat(property.coordinates)
          .addTo(map.current!);

        // Add click event to marker
        markerElement.addEventListener('click', () => {
          setSelectedProperty(property);
        });
      });

      // Cleanup function
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowTokenInput(true);
    }
  }, [mapboxToken, propertiesData, center, zoom]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      setDemoMode(false);
    }
  };

  const closePopup = () => {
    setSelectedProperty(null);
  };

  const enableMapboxMode = () => {
    setDemoMode(false);
    setShowTokenInput(true);
  };

  // Demo mode with static map-like interface
  if (demoMode) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden border">
        {/* Demo Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-gray-300"></div>
              ))}
            </div>
          </div>
          
          {/* Simulated roads */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-400 opacity-40 transform -translate-y-1/2"></div>
          <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-gray-400 opacity-40"></div>
          <div className="absolute top-0 bottom-0 right-1/4 w-2 bg-gray-400 opacity-40"></div>
        </div>

        {/* Enhanced Property Markers */}
        {propertiesData.map((property, index) => {
          const { baseColor, borderColor } = getMarkerStyle(property);
          return (
            <div
              key={property.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${25 + (index % 3) * 25}%`,
                top: `${25 + Math.floor(index / 3) * 25}%`
              }}
              onClick={() => setSelectedProperty(property)}
            >
              <div 
                className="relative w-10 h-10 rounded-full border-3 shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 animate-pulse"
                style={{ backgroundColor: baseColor, borderColor: borderColor }}
              >
                <span className="text-lg">{getMarkerStyle(property).icon}</span>
                {property.isVerified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-5 h-4 rounded-sm text-white text-xs flex items-center justify-center font-bold ${property.listingType === 'owner' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                  {property.listingType === 'owner' ? 'O' : 'B'}
                </div>
              </div>
            </div>
          );
        })}

        {/* Filter Controls */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="space-y-2">
            <div className="flex gap-1">
              <Button
                variant={propertyFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPropertyFilter('all')}
                className="h-6 px-2 text-xs"
              >
                All
              </Button>
              <Button
                variant={propertyFilter === 'sale' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPropertyFilter('sale')}
                className="h-6 px-2 text-xs"
              >
                Sale
              </Button>
              <Button
                variant={propertyFilter === 'rent' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPropertyFilter('rent')}
                className="h-6 px-2 text-xs"
              >
                Rent
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                variant={listingFilter === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setListingFilter('all')}
                className="h-6 px-2 text-xs"
              >
                All
              </Button>
              <Button
                variant={listingFilter === 'owner' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setListingFilter('owner')}
                className="h-6 px-2 text-xs"
              >
                Owner
              </Button>
              <Button
                variant={listingFilter === 'broker' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setListingFilter('broker')}
                className="h-6 px-2 text-xs"
              >
                Broker
              </Button>
            </div>
          </div>
        </div>

        {/* Demo Label & Real Map Button */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 text-sm">
            <span className="text-muted-foreground">🎮 Demo Mode ({propertiesData.length} properties)</span>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={enableMapboxMode}
            className="bg-background/90 backdrop-blur-sm"
          >
            Use Real Map
          </Button>
        </div>

        {/* Property Popup */}
        {selectedProperty && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
              <div className="bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border animate-in slide-in-from-bottom-4">
                <div className="flex gap-3">
                  {/* Property Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={selectedProperty.image} 
                      alt={selectedProperty.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Property Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm line-clamp-1">{selectedProperty.title}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={closePopup}
                        className="h-6 w-6 p-0 ml-2"
                      >
                        ×
                      </Button>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">{selectedProperty.location}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      {selectedProperty.bedrooms && (
                        <div className="flex items-center">
                          <Bed className="h-3 w-3 mr-1" />
                          <span>{selectedProperty.bedrooms}</span>
                        </div>
                      )}
                      {selectedProperty.bathrooms && (
                        <div className="flex items-center">
                          <Bath className="h-3 w-3 mr-1" />
                          <span>{selectedProperty.bathrooms}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Square className="h-3 w-3 mr-1" />
                        <span>{selectedProperty.area}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs h-5">
                          {selectedProperty.propertyType === 'rent' ? 'Rent' : 'Sale'}
                        </Badge>
                        <Badge variant={selectedProperty.listingType === 'owner' ? 'default' : 'secondary'} className="text-xs h-5">
                          {selectedProperty.listingType === 'owner' ? 'Owner' : 'Broker'}
                        </Badge>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {selectedProperty.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Enhanced Map Mode
  if (showTokenInput) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-muted rounded-lg border">
        <div className="max-w-md w-full p-6 bg-background rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Enter Mapbox Token</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get your free Mapbox token from{' '}
            <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              mapbox.com
            </a>
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={!mapboxToken.trim()}>
                Load Map
              </Button>
              <Button type="button" variant="outline" onClick={() => setDemoMode(true)}>
                Back to Demo
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Real Mapbox Map
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border relative">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default PropertyMap;