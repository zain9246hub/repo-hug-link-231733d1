import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, XCircle, IndianRupee } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  image: string;
  amenities: string[];
  verified: boolean;
}

interface PropertyComparisonProps {
  properties: Property[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const PropertyComparison: React.FC<PropertyComparisonProps> = ({
  properties,
  onRemove,
  onClearAll
}) => {
  const comparisonFeatures = [
    'Price',
    'Area',
    'Bedrooms',
    'Bathrooms',
    'Swimming Pool',
    'Gym',
    'Parking',
    'Security',
    'Lift',
    'Garden',
    'Power Backup',
    'Club House'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compare Properties</h1>
        <Button variant="outline" onClick={onClearAll}>
          Clear All
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              No properties selected for comparison. Add properties from search results.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Feature Names Column */}
              <div className="space-y-4">
                <div className="h-64 flex items-end">
                  <h3 className="font-semibold text-lg">Features</h3>
                </div>
                {comparisonFeatures.map((feature) => (
                  <div key={feature} className="h-12 flex items-center border-b">
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Property Columns */}
              {properties.map((property) => (
                <div key={property.id} className="space-y-4">
                  {/* Property Card */}
                  <Card className="relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => onRemove(property.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardContent className="p-4">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {property.location}
                      </p>
                      {property.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* Feature Values */}
                  {comparisonFeatures.map((feature) => {
                    let value;
                    let icon;

                    switch (feature) {
                      case 'Price':
                        value = property.price;
                        icon = <IndianRupee className="h-4 w-4" />;
                        break;
                      case 'Area':
                        value = property.area;
                        break;
                      case 'Bedrooms':
                        value = `${property.bedrooms} Beds`;
                        break;
                      case 'Bathrooms':
                        value = `${property.bathrooms} Baths`;
                        break;
                      default:
                        const hasAmenity = property.amenities.includes(feature);
                        value = hasAmenity ? 'Yes' : 'No';
                        icon = hasAmenity ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        );
                    }

                    return (
                      <div key={feature} className="h-12 flex items-center border-b">
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className="text-sm">{value}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyComparison;