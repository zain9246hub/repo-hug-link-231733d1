import { Star, TrendingUp, Users, Shield, Search, MapPin, Check, ChevronsUpDown, Megaphone } from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AnimatedSection from "@/components/AnimatedSection";
import { useState, lazy, Suspense, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import property1 from "@/assets/property-1.webp";
import property2 from "@/assets/property-2.webp";
import property3 from "@/assets/property-3.webp";
import { getAllCities } from "@/data/locations";
import { useAds, toHeroSlide, toAdBannerProps, toAdSpace, toSponsoredCard } from "@/hooks/use-ads";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy below-fold components
const PropertyListingWithAds = lazy(() => import("@/components/PropertyListingWithAds"));
const AdBanner = lazy(() => import("@/components/AdBanner"));
const UrgentSalesSection = lazy(() => import("@/components/UrgentSalesSection"));
const FullScreenMap = lazy(() => import("@/components/FullScreenMap"));

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Hook to detect when an element enters the viewport
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px', ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  
  return { ref, inView };
}

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <Skeleton className="h-48 w-full max-w-4xl rounded-xl" />
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city: string; address: string } | undefined>();
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  
  const allCities = getAllCities();

  // Fetch ads from database for all homepage placements
  const { ads: dbAds, getAdsByPlacement } = useAds([
    "homepage-hero",
    "homepage-mid",
    "homepage-bottom",
  ]);

  // Defer property fetching until the property section is in view
  const { ref: propertySectionRef, inView: propertySectionInView } = useInView();
  
  // Dynamically import useProperties only when needed
  const [propertyData, setPropertyData] = useState<{ featuredProperties: any[]; rentalProperties: any[] }>({
    featuredProperties: [],
    rentalProperties: [],
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!propertySectionInView) return;
    
    let cancelled = false;
    
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase.rpc('get_published_properties', {
        _city: selectedCity || null,
        _limit: 100,
      });
      
      if (cancelled) return;
      
      if (error || !data) {
        setPropertyData({ featuredProperties: [], rentalProperties: [] });
        setLoading(false);
        return;
      }
      
      const mapProperty = (p: any) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        price: p.price,
        image: p.image_url || property1,
        images: (p.image_urls && p.image_urls.length > 0) ? p.image_urls : undefined,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        propertyType: p.property_type as 'sale' | 'rent',
        listingType: p.listing_type as 'owner' | 'broker',
        isFeatured: p.is_featured,
        isVerified: p.is_verified,
        isUrgent: p.is_urgent,
        urgencyLevel: p.urgency_level as 'high' | 'medium' | 'low' | undefined,
        daysLeft: p.days_left || undefined,
        originalPrice: p.original_price || undefined,
        priceReduction: p.price_reduction || undefined,
        furnishing: p.furnishing || undefined,
        deposit: p.deposit || undefined,
        availableFrom: p.available_from || undefined,
      });
      
      setPropertyData({
        featuredProperties: data.filter((p: any) => p.property_type === 'sale').slice(0, 6).map(mapProperty),
        rentalProperties: data.filter((p: any) => p.property_type === 'rent').slice(0, 6).map(mapProperty),
      });
      setLoading(false);
    })();
    
    return () => { cancelled = true; };
  }, [propertySectionInView, selectedCity]);

  const { featuredProperties, rentalProperties } = propertyData;

  // Default hero slides (fallback when no DB ads for homepage-hero)
  const defaultHeroSlides = [
    { id: "1", image: property1, title: "Luxury Properties in Surat", description: "Discover premium apartments and villas in the Diamond City", link: "/search?location=surat", isExternal: false },
    { id: "2", image: property2, title: "Surat Real Estate", description: "Explore modern homes and investment opportunities in Surat", link: "/search?location=surat", isExternal: false },
    { id: "3", image: property3, title: "Surat - The Diamond City", description: "Perfect homes for professionals and families in Surat", link: "/search?location=surat", isExternal: false }
  ];

  // DB-driven ads mapped to components
  const heroDbAds = getAdsByPlacement("homepage-hero");
  const heroSlides = heroDbAds.length > 0
    ? heroDbAds.map(toHeroSlide)
    : defaultHeroSlides;

  const midAds = getAdsByPlacement("homepage-mid");
  const adSpaces = midAds.length > 0
    ? midAds.map(toAdSpace)
    : [];

  const bottomAds = getAdsByPlacement("homepage-bottom");
  const sponsorshipAds = bottomAds.length > 0
    ? bottomAds.map(toSponsoredCard)
    : [];

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Hero Image Carousel - no AnimatedSection wrapper to avoid LCP delay */}
      <ImageCarousel 
        slides={heroSlides}
        autoplayDelay={5000}
        className="mb-0"
        priorityFirst
      />

      {/* Ad Banner Carousel - only show if there are mid-section ads */}
      {midAds.length > 0 && (
        <AnimatedSection delay={0.1}>
          <section className="section-spacing bg-muted/30">
            <div className="page-container">
              <Carousel 
                className="w-full max-w-3xl mx-auto"
                // @ts-ignore - embla-carousel version mismatch
                plugins={[Autoplay({ delay: 4000 })]}
                opts={{ align: "start", loop: true }}
              >
                <CarouselContent>
                  {midAds.map((ad) => (
                    <CarouselItem key={ad.id}>
                      <Suspense fallback={<SectionFallback />}>
                        <AdBanner type="horizontal" {...toAdBannerProps(ad)} />
                      </Suspense>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Explore Locations */}
      <section ref={propertySectionRef} className="section-spacing bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="page-container relative z-10">
          <AnimatedSection delay={0.1}>
            <div className="text-center section-header">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                🌍 Explore Properties
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Discover Properties {selectedCity ? `in ${selectedCity}` : 'Across India'}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Explore properties {selectedCity ? `in ${selectedCity}` : 'across all cities'}
              </p>
            </div>
          </AnimatedSection>

          {/* City Selector & Map Toggle */}
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-6">
              <Popover open={citySearchOpen} onOpenChange={setCitySearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={citySearchOpen}
                    className="w-full sm:w-[300px] justify-between h-11 border-border"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {selectedCity || "All Cities"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="center">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all-cities"
                          onSelect={() => {
                            setSelectedCity("");
                            setCitySearchOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", !selectedCity ? "opacity-100" : "opacity-0")} />
                          All Cities
                        </CommandItem>
                        {allCities.map((city) => (
                          <CommandItem
                            key={`${city.name}-${city.state}`}
                            value={`${city.name}, ${city.state}`}
                            onSelect={() => {
                              setSelectedCity(city.name);
                              setCitySearchOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedCity === city.name ? "opacity-100" : "opacity-0")} />
                            {city.name}, {city.state}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button
                size="lg"
                onClick={() => navigate('/nomad-map')}
                className="w-full sm:w-auto bg-gradient-primary text-primary-foreground shadow-md h-11"
              >
                <MapPin className="h-4 w-4 mr-2" />
                View Interactive Map
              </Button>
            </div>
          </AnimatedSection>

          {/* Properties in Selected City */}
          {propertySectionInView && (
            <AnimatedSection delay={0.3}>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 text-center">
                  Available Properties {selectedCity ? `in ${selectedCity}` : ''}
                </h3>
                {loading ? (
                  <SectionFallback />
                ) : [...featuredProperties, ...rentalProperties].length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No properties available {selectedCity ? `in ${selectedCity}` : ''} at the moment.</p>
                    <Button variant="outline" className="mt-3" onClick={() => navigate('/nomad-map')}>
                      Explore Properties
                    </Button>
                  </div>
                ) : (
                  <Suspense fallback={<SectionFallback />}>
                    <PropertyListingWithAds 
                      properties={[...featuredProperties, ...rentalProperties].slice(0, 6)}
                      adSpaces={adSpaces}
                      adFrequency={3}
                    />
                  </Suspense>
                )}
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Urgent Sales - lazy */}
      {propertySectionInView && !loading && (
        <AnimatedSection delay={0.1}>
          <Suspense fallback={<SectionFallback />}>
            <UrgentSalesSection 
              urgentProperties={[...featuredProperties, ...rentalProperties].filter((p: any) => p.isUrgent)}
            />
          </Suspense>
        </AnimatedSection>
      )}

      {/* Featured Rentals - lazy */}
      {propertySectionInView && !loading && (
        <AnimatedSection delay={0.1}>
          <section className="section-spacing bg-muted/30">
            <div className="page-container">
              <div className="flex justify-between items-center section-header">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">Featured Rentals</h2>
                  <p className="text-sm text-muted-foreground">Quality rental properties for immediate occupancy</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/search?type=rent')}>View All</Button>
              </div>
              <Suspense fallback={<SectionFallback />}>
                <PropertyListingWithAds 
                  properties={rentalProperties}
                  adSpaces={adSpaces}
                  adFrequency={3}
                />
              </Suspense>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Featured Properties - lazy */}
      {propertySectionInView && !loading && (
        <AnimatedSection delay={0.1}>
          <section className="section-spacing">
            <div className="page-container">
              <div className="flex justify-between items-center section-header">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">Featured Properties</h2>
                  <p className="text-sm text-muted-foreground">Handpicked premium properties from verified owners and brokers</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/search?type=sale')}>View All</Button>
              </div>
              <Suspense fallback={<SectionFallback />}>
                <PropertyListingWithAds 
                  properties={[...featuredProperties, ...rentalProperties]}
                  adSpaces={adSpaces}
                  adFrequency={2}
                />
              </Suspense>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Sponsored Content - only show if there are bottom ads */}
      {sponsorshipAds.length > 0 && (
        <AnimatedSection delay={0.1}>
          <section className="section-spacing bg-gradient-to-b from-muted/20 to-background border-y border-border/50">
            <div className="page-container">
              <div className="text-center section-header">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full mb-3">
                  <span className="text-primary font-semibold text-xs">✨ SPONSORED</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Premium Sponsored Properties</h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">Handpicked premium developments from Surat's most trusted builders</p>
              </div>
              <div className="card-grid">
                {sponsorshipAds.map((ad) => (
                  <div key={ad.id} className="bg-card rounded-xl p-5 shadow-md border border-border/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={ad.imageUrl || '/placeholder.svg'} 
                        alt={ad.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <div className="absolute top-3 right-3">
                        <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                          {ad.badge}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{ad.title}</h3>
                        <p className="text-xs text-primary font-semibold">by {ad.sponsor}</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{ad.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-lg font-bold text-primary">{ad.price}</span>
                        <Button size="sm" className="bg-gradient-primary hover:opacity-90 shadow-sm">
                          {ad.ctaText}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Advertise CTA */}
      <AnimatedSection delay={0.1}>
        <section className="section-spacing px-4">
          <div className="max-w-xl mx-auto text-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 md:p-8 border border-primary/10">
            <Megaphone className="h-7 w-7 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1.5">Want to Advertise Here?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Reach thousands of property seekers. Book banner slots, sponsored listings, and more.
            </p>
            <Button 
              className="bg-gradient-primary text-primary-foreground shadow-md"
              onClick={() => navigate('/advertise')}
            >
              Advertise With Us
            </Button>
          </div>
        </section>
      </AnimatedSection>


      {/* Full Screen Map - lazy mounted */}
      {isMapOpen && (
        <Suspense fallback={<SectionFallback />}>
          <FullScreenMap 
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            userLocation={userLocation}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
