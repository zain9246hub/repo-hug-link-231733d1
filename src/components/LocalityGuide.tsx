import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  School, 
  Hospital, 
  ShoppingCart, 
  Train, 
  Car,
  Star,
  TrendingUp,
  Users,
  Home
} from 'lucide-react';

interface LocalityGuideProps {
  locality?: string;
}

const LocalityGuide: React.FC<LocalityGuideProps> = ({ 
  locality = "Adajan, Surat" 
}) => {
  const localityData = {
    name: locality,
    rating: 4.3,
    priceRange: "₹3,500 - ₹8,500 per sq ft",
    trend: "+15%",
    population: "5.5 Lakh",
    nearbyAreas: ["Athwa", "Piplod", "Vesu", "Varachha"],
    infrastructure: {
      schools: [
        { name: "Delhi Public School, Surat", distance: "1.0 km", rating: 4.5 },
        { name: "Fountainhead School", distance: "1.5 km", rating: 4.4 },
        { name: "P.P. Savani Cambridge International School", distance: "2.5 km", rating: 4.6 }
      ],
      hospitals: [
        { name: "SMIMER Hospital", distance: "1.5 km", rating: 4.2 },
        { name: "Kiran Hospital", distance: "2.0 km", rating: 4.5 },
        { name: "Mahavir Hospital", distance: "3.0 km", rating: 4.3 }
      ],
      shopping: [
        { name: "VR Surat Mall", distance: "1.5 km", type: "Mall" },
        { name: "Rahul Raj Mall", distance: "2.0 km", type: "Mall" },
        { name: "Sahara Darwaja Market", distance: "4.0 km", type: "Street Shopping" }
      ],
      transport: [
        { name: "Surat Railway Station", distance: "3.5 km", type: "Railway" },
        { name: "Surat Airport", distance: "12 km", type: "Airport" },
        { name: "Surat BRTS", distance: "0.5 km", type: "Bus Rapid Transit" }
      ]
    },
    highlights: [
      "Diamond City of India",
      "Textile Hub",
      "Smart City Project",
      "Clean & Green City",
      "Growing IT Sector",
      "Excellent Road Infrastructure"
    ],
    pros: [
      "Affordable property prices compared to metros",
      "Fast-growing city with excellent infrastructure",
      "Clean city with good civic amenities",
      "Strong industrial and business ecosystem",
      "Well-connected via road and rail"
    ],
    cons: [
      "Humid climate during monsoons",
      "Traffic congestion in some commercial areas",
      "Limited direct international flights",
      "Flood-prone areas near river Tapi"
    ]
  };

  const IconComponent = ({ type }: { type: string }) => {
    switch (type) {
      case 'school': return <School className="h-4 w-4" />;
      case 'hospital': return <Hospital className="h-4 w-4" />;
      case 'shopping': return <ShoppingCart className="h-4 w-4" />;
      case 'transport': return <Train className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Locality Guide</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">{localityData.name}</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{localityData.rating}/5</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{localityData.population} residents</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500">{localityData.trend} price growth</span>
          </div>
        </div>
      </div>

      {/* Price Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Price Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary mb-2">
            {localityData.priceRange}
          </div>
          <p className="text-muted-foreground">
            Average property prices in {localityData.name}
          </p>
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Area Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {localityData.highlights.map((highlight, index) => (
              <Badge key={index} variant="secondary">
                {highlight}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Schools Nearby
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localityData.infrastructure.schools.map((school, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <p className="font-medium text-sm">{school.name}</p>
                  <p className="text-xs text-muted-foreground">{school.distance}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{school.rating}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hospital className="h-5 w-5" />
              Healthcare
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localityData.infrastructure.hospitals.map((hospital, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <p className="font-medium text-sm">{hospital.name}</p>
                  <p className="text-xs text-muted-foreground">{hospital.distance}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{hospital.rating}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping & Entertainment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localityData.infrastructure.shopping.map((place, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <p className="font-medium text-sm">{place.name}</p>
                  <p className="text-xs text-muted-foreground">{place.distance}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {place.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Transportation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localityData.infrastructure.transport.map((transport, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <p className="font-medium text-sm">{transport.name}</p>
                  <p className="text-xs text-muted-foreground">{transport.distance}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {transport.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Pros</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {localityData.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{pro}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Cons</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {localityData.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{con}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Nearby Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Nearby Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {localityData.nearbyAreas.map((area, index) => (
              <Button key={index} variant="outline" size="sm">
                {area}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalityGuide;
