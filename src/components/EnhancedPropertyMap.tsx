import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Phone, MessageCircle, Navigation, ChevronUp, Filter, Star, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

// Import profile images
import broker1Image from '@/assets/broker-1.jpg';
import broker2Image from '@/assets/broker-2.jpg';
import owner1Image from '@/assets/owner-1.jpg';
import owner2Image from '@/assets/owner-2.jpg';
import builder1Image from '@/assets/builder-1.jpg';
import builder2Image from '@/assets/builder-2.jpg';

// Enhanced Property interface with contact information
interface PropertyContact {
  id: string;
  name: string;
  type: 'owner' | 'broker' | 'builder';
  profileImage: string;
  phone: string;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  lastSeen: string;
  verified: boolean;
  specialization?: string;
  experience: string;
}

interface PropertyWithLocation {
  id: string;
  title: string;
  location: string;
  price: string;
  monthlyRent?: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  propertyType: "sale" | "rent";
  listingType: "owner" | "broker" | "builder";
  contact: PropertyContact;
  coordinates: [number, number];
  distance?: number; // km from user location
}

interface EnhancedPropertyMapProps {
  properties?: PropertyWithLocation[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number];
}

const EnhancedPropertyMap = ({ 
  properties = [], 
  center = [77.2090, 28.6139], // Delhi coordinates as default
  zoom = 12,
  userLocation
}: EnhancedPropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithLocation | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'owner' | 'broker' | 'builder'>('all');
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(false);

  // Filter properties based on active filter
  const getFilteredProperties = () => {
    let filtered = properties;
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter(p => p.listingType === activeFilter);
    }
    
    return filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  const propertiesData = getFilteredProperties();

  // Get contact type color
  const getContactTypeColor = (type: PropertyContact['type']) => {
    switch (type) {
      case 'owner': return 'hsl(var(--primary))';
      case 'broker': return 'hsl(var(--secondary))';
      case 'builder': return 'hsl(var(--luxury))';
      default: return 'hsl(var(--muted))';
    }
  };

  // Create profile picture marker
  const createProfileMarker = (property: PropertyWithLocation) => {
    const markerDiv = document.createElement('div');
    markerDiv.className = 'profile-marker';
    markerDiv.style.cssText = `
      position: relative;
      width: 48px;
      height: 48px;
      cursor: pointer;
      transition: transform 0.3s ease;
    `;

    markerDiv.innerHTML = `
      <div style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        overflow: hidden;
        background: white;
      ">
        <img src="${property.contact.profileImage}" 
             style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      ${property.contact.isOnline ? `
        <div style="
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
        "></div>
      ` : ''}
      ${property.contact.verified ? `
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: white;
        ">✓</div>
      ` : ''}
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        background: ${getContactTypeColor(property.contact.type)};
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">${property.distance ? `${property.distance}km` : property.contact.type.toUpperCase()}</div>
    `;

    markerDiv.addEventListener('mouseenter', () => {
      markerDiv.style.transform = 'scale(1.1)';
    });

    markerDiv.addEventListener('mouseleave', () => {
      markerDiv.style.transform = 'scale(1)';
    });

    markerDiv.addEventListener('click', () => {
      setSelectedProperty(property);
    });

    return markerDiv;
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

      // Add user location marker if available
      if (userLocation) {
        const userMarker = document.createElement('div');
        userMarker.innerHTML = `
          <div style="
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
            animation: pulse 2s infinite;
          "></div>
        `;

        new mapboxgl.Marker(userMarker)
          .setLngLat(userLocation)
          .addTo(map.current);
      }

      // Add property markers
      propertiesData.forEach((property) => {
        const markerElement = createProfileMarker(property);
        
        new mapboxgl.Marker(markerElement)
          .setLngLat(property.coordinates)
          .addTo(map.current!);
      });

      // Cleanup function
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowTokenInput(true);
    }
  }, [mapboxToken, propertiesData, center, zoom, userLocation]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      setDemoMode(false);
    }
  };

  const enableMapboxMode = () => {
    setDemoMode(false);
    setShowTokenInput(true);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, propertyTitle: string) => {
    const message = `Hi! I'm interested in your property: ${propertyTitle}`;
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`);
  };

  // Demo mode with enhanced UI
  if (demoMode) {
    return (
      <div className="relative w-full h-[70vh] bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden border">
        {/* Demo Map Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-gray-200"></div>
              ))}
            </div>
          </div>
          
          {/* Simulated roads */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 opacity-40 transform -translate-y-1/2"></div>
          <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-gray-300 opacity-40"></div>
          <div className="absolute top-0 bottom-0 right-1/4 w-2 bg-gray-300 opacity-40"></div>
        </div>

        {/* Enhanced Profile Markers */}
        {propertiesData.map((property, index) => (
          <div
            key={property.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10 hover:z-20"
            style={{
              left: `${25 + (index % 3) * 25}%`,
              top: `${25 + Math.floor(index / 3) * 20}%`
            }}
            onClick={() => setSelectedProperty(property)}
          >
            <div className="relative transition-transform hover:scale-110">
              <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg overflow-hidden bg-white">
                <img 
                  src={property.contact.profileImage} 
                  alt={property.contact.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {property.contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
              {property.contact.verified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <div 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                style={{ backgroundColor: getContactTypeColor(property.contact.type) }}
              >
                {property.distance}km
              </div>
            </div>
          </div>
        ))}

        {/* Top Filter Bar */}
        <div className="absolute top-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{propertiesData.length} nearby contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
                className="h-7 px-3"
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'owner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('owner')}
                className="h-7 px-3"
              >
                Owners
              </Button>
              <Button
                variant={activeFilter === 'broker' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('broker')}
                className="h-7 px-3"
              >
                Brokers
              </Button>
              <Button
                variant={activeFilter === 'builder' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('builder')}
                className="h-7 px-3"
              >
                Builders
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Tracking Panel */}
        {showBottomPanel && (
          <div className={`absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t transition-all duration-300 ${panelExpanded ? 'h-80' : 'h-32'}`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Nearby Contacts</span>
                  <Badge variant="secondary">{propertiesData.length}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPanelExpanded(!panelExpanded)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className={`h-4 w-4 transition-transform ${panelExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              <div className={`space-y-2 ${panelExpanded ? 'h-60 overflow-y-auto' : 'h-16 overflow-hidden'}`}>
                {propertiesData.map((property) => (
                  <Card key={property.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProperty(property)}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={property.contact.profileImage} />
                          <AvatarFallback>{property.contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {property.contact.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-background rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{property.contact.name}</span>
                          {property.contact.verified && (
                            <Badge variant="secondary" className="h-4 text-xs px-1">✓</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{property.contact.type}</span>
                          <span>•</span>
                          <span>{property.distance}km away</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{property.contact.rating}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {property.contact.isOnline ? 'Active now' : property.contact.lastSeen}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(property.contact.phone);
                          }}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsApp(property.contact.phone, property.title);
                          }}
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Demo Label & Real Map Button */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={enableMapboxMode}
            className="bg-background/90 backdrop-blur-sm"
          >
            Use Real Map
          </Button>
        </div>

        {/* Property Details Popup */}
        {selectedProperty && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedProperty.contact.profileImage} />
                    <AvatarFallback>{selectedProperty.contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{selectedProperty.contact.name}</h3>
                      {selectedProperty.contact.verified && (
                        <Badge variant="secondary" className="h-4">✓ Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{selectedProperty.contact.rating}</span>
                      <span className="text-sm text-muted-foreground">({selectedProperty.contact.reviewCount} reviews)</span>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{selectedProperty.contact.type} • {selectedProperty.contact.experience}</p>
                    {selectedProperty.contact.specialization && (
                      <p className="text-sm text-muted-foreground">{selectedProperty.contact.specialization}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProperty(null)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">{selectedProperty.title}</h4>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedProperty.location} • {selectedProperty.distance}km away
                  </div>
                  <div className="text-lg font-semibold text-primary">{selectedProperty.price}</div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleCall(selectedProperty.contact.phone)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleWhatsApp(selectedProperty.contact.phone, selectedProperty.title)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Mapbox Token Input
  if (showTokenInput) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Enter Mapbox Token</h3>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Mapbox Public Token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full" disabled={!mapboxToken.trim()}>
              Load Real Map
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => setDemoMode(true)}
            >
              Back to Demo
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Get your free token from{' '}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Real Mapbox Map
  return (
    <div className="relative w-full h-[70vh] rounded-xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Top Filter Bar */}
      <div className="absolute top-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{propertiesData.length} nearby contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="h-7 px-3"
            >
              All
            </Button>
            <Button
              variant={activeFilter === 'owner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('owner')}
              className="h-7 px-3"
            >
              Owners
            </Button>
            <Button
              variant={activeFilter === 'broker' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('broker')}
              className="h-7 px-3"
            >
              Brokers
            </Button>
            <Button
              variant={activeFilter === 'builder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('builder')}
              className="h-7 px-3"
            >
              Builders
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Tracking Panel */}
      {showBottomPanel && (
        <div className={`absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t transition-all duration-300 ${panelExpanded ? 'h-80' : 'h-32'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                <span className="font-semibold">Nearby Contacts</span>
                <Badge variant="secondary">{propertiesData.length}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPanelExpanded(!panelExpanded)}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className={`h-4 w-4 transition-transform ${panelExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            <div className={`space-y-2 ${panelExpanded ? 'h-60 overflow-y-auto' : 'h-16 overflow-hidden'}`}>
              {propertiesData.map((property) => (
                <Card key={property.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProperty(property)}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={property.contact.profileImage} />
                        <AvatarFallback>{property.contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {property.contact.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-background rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{property.contact.name}</span>
                        {property.contact.verified && (
                          <Badge variant="secondary" className="h-4 text-xs px-1">✓</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{property.contact.type}</span>
                        <span>•</span>
                        <span>{property.distance}km away</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{property.contact.rating}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {property.contact.isOnline ? 'Active now' : property.contact.lastSeen}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(property.contact.phone);
                        }}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsApp(property.contact.phone, property.title);
                        }}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Property Details Popup */}
      {selectedProperty && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedProperty.contact.profileImage} />
                  <AvatarFallback>{selectedProperty.contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{selectedProperty.contact.name}</h3>
                    {selectedProperty.contact.verified && (
                      <Badge variant="secondary" className="h-4">✓ Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{selectedProperty.contact.rating}</span>
                    <span className="text-sm text-muted-foreground">({selectedProperty.contact.reviewCount} reviews)</span>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{selectedProperty.contact.type} • {selectedProperty.contact.experience}</p>
                  {selectedProperty.contact.specialization && (
                    <p className="text-sm text-muted-foreground">{selectedProperty.contact.specialization}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProperty(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">{selectedProperty.title}</h4>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedProperty.location} • {selectedProperty.distance}km away
                </div>
                <div className="text-lg font-semibold text-primary">{selectedProperty.price}</div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleCall(selectedProperty.contact.phone)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleWhatsApp(selectedProperty.contact.phone, selectedProperty.title)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedPropertyMap;
