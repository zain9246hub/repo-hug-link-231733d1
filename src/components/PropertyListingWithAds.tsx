import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import AdBanner from "@/components/AdBanner";
import { motion } from "framer-motion";

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  propertyType: "sale" | "rent";
  listingType: "owner" | "broker";
  isFeatured?: boolean;
  isVerified?: boolean;
}

interface AdSpace {
  id: string;
  type: "image" | "link";
  title: string;
  description: string;
  ctaText: string;
  imageUrl?: string;
  linkUrl?: string;
  isExternal?: boolean;
}

interface PropertyListingWithAdsProps {
  properties: Property[];
  adSpaces?: AdSpace[];
  adFrequency?: number; // Show ad after every N properties
  className?: string;
}

const PropertyListingWithAds = ({ 
  properties, 
  adSpaces = [], 
  adFrequency = 3,
  className = "" 
}: PropertyListingWithAdsProps) => {
  const [currentAdRotation, setCurrentAdRotation] = useState(0);

  // Auto-rotate ads every 6 seconds
  useEffect(() => {
    if (adSpaces.length === 0) return;
    
    const adRotationInterval = setInterval(() => {
      setCurrentAdRotation((prev) => (prev + 1) % adSpaces.length);
    }, 6000);

    return () => clearInterval(adRotationInterval);
  }, [adSpaces.length]);

  const renderItems = () => {
    const items = [];
    let adSlotIndex = 0;

    properties.forEach((property, index) => {
      // Add property card with staggered animation
      items.push(
        <motion.div
          key={`property-${property.id}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: (index % adFrequency) * 0.1,
            ease: [0.25, 0.25, 0, 1]
          }}
        >
          <PropertyCard {...property} />
        </motion.div>
      );

      // Add ad space after every N properties (but not after the last property)
      if ((index + 1) % adFrequency === 0 && 
          index < properties.length - 1 && 
          adSpaces.length > 0) {
        // Rotate ads based on current rotation index and slot position
        const adIndexToShow = (currentAdRotation + adSlotIndex) % adSpaces.length;
        const ad = adSpaces[adIndexToShow];
        
        items.push(
          <motion.div 
            key={`ad-${ad.id}-${index}-${currentAdRotation}`} 
            className="col-span-1 md:col-span-2 lg:col-span-3"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.25, 0, 1] }}
          >
            <div className="max-w-2xl mx-auto">
              {ad.type === "image" ? (
                <AdBanner
                  type="horizontal"
                  title={ad.title}
                  description={ad.description}
                  ctaText={ad.ctaText}
                  imageUrl={ad.imageUrl}
                />
              ) : (
                <div 
                  className="p-4 bg-gradient-secondary/10 border border-secondary/20 rounded-xl hover:bg-gradient-secondary/20 transition-colors cursor-pointer"
                  onClick={() => {
                    if (ad.linkUrl) {
                      if (ad.isExternal) {
                        window.open(ad.linkUrl, '_blank');
                      } else {
                        window.location.href = ad.linkUrl;
                      }
                    }
                  }}
                >
                  <div className="text-xs text-muted-foreground mb-2">Sponsored</div>
                  <h4 className="font-semibold text-lg text-foreground mb-2">{ad.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{ad.description}</p>
                  <div className="text-sm text-primary font-medium">{ad.ctaText} →</div>
                </div>
              )}
            </div>
          </motion.div>
        );
        
        adSlotIndex++;
      }
    });

    return items;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {renderItems()}
    </div>
  );
};

export default PropertyListingWithAds;