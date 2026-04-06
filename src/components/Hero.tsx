import { Search, MapPin, Home, Building2, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-real-estate.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Text */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Find Your Perfect
            <span className="block text-secondary"> Dream Property</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover premium bungalows, luxurious apartments, and exclusive projects across India. 
            Connect with verified owners and trusted brokers.
          </p>

          {/* Property Type Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button variant="secondary" size="lg" className="min-w-32">
              <Home className="h-5 w-5 mr-2" />
              Bungalows
            </Button>
            <Button variant="property" size="lg" className="min-w-32">
              <Building2 className="h-5 w-5 mr-2" />
              Apartments
            </Button>
            <Button variant="property" size="lg" className="min-w-32">
              <Construction className="h-5 w-5 mr-2" />
              Projects
            </Button>
          </div>

          {/* Search Form */}
          <div className="bg-background/95 backdrop-blur-md p-6 rounded-xl shadow-elevated max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Enter location..." 
                  className="pl-10 h-12"
                />
              </div>
              
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50">Under ₹50L</SelectItem>
                  <SelectItem value="50-100">₹50L - ₹1Cr</SelectItem>
                  <SelectItem value="100-200">₹1Cr - ₹2Cr</SelectItem>
                  <SelectItem value="200+">Above ₹2Cr</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="hero" size="lg" className="h-12">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;