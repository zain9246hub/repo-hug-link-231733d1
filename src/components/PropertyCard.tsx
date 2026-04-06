import { Heart, MapPin, Bed, Bath, Square, User, Shield, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PropertyCardProps {
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
  isUrgent?: boolean;
  urgencyLevel?: "high" | "medium" | "low";
  daysLeft?: number;
  originalPrice?: string;
  priceReduction?: number;
  // Rental-specific fields
  furnishing?: string;
  deposit?: string;
  availableFrom?: string;
}

const PropertyCard = ({ 
  id,
  title, 
  location, 
  price, 
  image, 
  bedrooms, 
  bathrooms, 
  area, 
  propertyType,
  listingType,
  isFeatured = false,
  isVerified = false,
  isUrgent = false,
  urgencyLevel = "medium",
  daysLeft,
  originalPrice,
  priceReduction,
  furnishing,
  deposit,
  availableFrom
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    setIsSaved(savedProperties.includes(id));
  }, [id]);

  const handleSaveProperty = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    setIsSaved(!isSaved);
    // Here you would typically save to localStorage or send to API
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    if (isSaved) {
      const updated = savedProperties.filter((propId: string) => propId !== id);
      localStorage.setItem('savedProperties', JSON.stringify(updated));
    } else {
      savedProperties.push(id);
      localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    }
  };

  const handleCardClick = () => {
    navigate(`/property/${id}`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent double navigation
    navigate(`/property/${id}`);
  };
  return (
    <motion.div 
      className="backdrop-blur-xl bg-glass rounded-xl overflow-hidden border border-glass shadow-glass hover:shadow-elevated transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img 
          src={image || '/placeholder.svg'} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isUrgent && (
            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              URGENT SALE
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-secondary text-secondary-foreground">
              Featured
            </Badge>
          )}
          <Badge variant={propertyType === "sale" ? "default" : "secondary"}>
            For {propertyType === "sale" ? "Sale" : "Rent"}
          </Badge>
        </div>

        {/* Wishlist Button */}
        <Button 
          size="icon" 
          variant="ghost" 
          className={`absolute top-3 right-3 backdrop-blur-xl bg-glass border border-glass shadow-glass hover:shadow-elevated ${
            isSaved ? "text-red-500" : ""
          }`}
          onClick={handleSaveProperty}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <div className="flex flex-col gap-1">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg font-bold text-lg">
              {price}
            </span>
            {isUrgent && originalPrice && priceReduction && (
              <div className="bg-destructive/90 text-destructive-foreground px-2 py-1 rounded text-xs">
                <span className="line-through opacity-75">{originalPrice}</span>
                <span className="ml-1 font-bold">↓{priceReduction}% OFF</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Urgency Timer */}
        {isUrgent && daysLeft && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
            <Clock className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {daysLeft} days left for urgent sale
            </span>
          </div>
        )}

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{bedrooms} Bed</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{bathrooms} Bath</span>
            </div>
          )}
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{area}</span>
          </div>
        </div>

        {/* Rental-specific details */}
        {propertyType === "rent" && (
          <div className="space-y-1 mb-4 p-3 backdrop-blur-xl bg-primary/10 rounded-lg border border-glass shadow-glass">
            {furnishing && (
              <div className="text-xs text-primary">
                Furnishing: <span className="text-foreground font-medium">{furnishing}</span>
              </div>
            )}
            {deposit && (
              <div className="text-xs text-primary">
                Deposit: <span className="text-foreground font-medium">{deposit}</span>
              </div>
            )}
            {availableFrom && (
              <div className="text-xs text-primary">
                Available: <span className="text-foreground font-medium">{availableFrom}</span>
              </div>
            )}
          </div>
        )}

        {/* Listing Info & CTA */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              <span className="capitalize">{listingType}</span>
            </div>
            {isVerified && (
              <div className="flex items-center text-success">
                <Shield className="h-3 w-3 mr-1" />
                <span className="text-xs">Verified</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {isUrgent && (
              <Button variant="destructive" size="sm" className="flex-1" onClick={handleViewDetails}>
                Quick Contact
              </Button>
            )}
            <Button variant={isUrgent ? "outline" : "default"} size="sm" className="flex-1" onClick={handleViewDetails}>
              View Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;