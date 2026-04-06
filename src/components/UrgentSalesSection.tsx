import React from 'react';
import { Zap, Clock, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PropertyCard from './PropertyCard';

interface UrgentSalesSectionProps {
  urgentProperties: Array<{
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
  }>;
}

const UrgentSalesSection: React.FC<UrgentSalesSectionProps> = ({ urgentProperties }) => {
  const navigate = useNavigate();
  
  if (urgentProperties.length === 0) return null;

  return (
    <section className="section-spacing bg-destructive/5 border-y border-destructive/10">
      <div className="page-container">
        <div className="text-center section-header">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-destructive animate-pulse" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Urgent Sales</h2>
            <Zap className="h-5 w-5 text-destructive animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Properties that need to be sold quickly - Great deals for buyers!
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-destructive" />
              <span>Quick Sale</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              <span>Below Market</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-destructive" />
              <span>Instant Contact</span>
            </div>
          </div>
        </div>

        <div className="card-grid mb-6">
          {urgentProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="destructive" 
            size="lg" 
            className="animate-pulse"
            onClick={() => navigate('/search?urgent=true')}
          >
            <Zap className="h-4 w-4 mr-2" />
            View All Urgent Sales
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UrgentSalesSection;
