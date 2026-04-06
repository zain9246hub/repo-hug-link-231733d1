import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LocationButtonProps {
  onLocationDetected?: (location: { lat: number; lng: number; city: string; address: string }) => void;
  onMapOpen?: () => void;
}

const LocationButton = ({ onLocationDetected, onMapOpen }: LocationButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Using a free geocoding service to get city name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          const locationData = {
            lat: latitude,
            lng: longitude,
            city: data.city || data.locality || 'Unknown City',
            address: data.locality ? `${data.locality}, ${data.principalSubdivision}` : 'Location detected'
          };

          onLocationDetected?.(locationData);
          onMapOpen?.();

          toast({
            title: "Location detected",
            description: `Found properties in ${locationData.city}`,
          });
        } catch (error) {
          toast({
            title: "Location detected",
            description: "Showing nearby properties",
          });
          
          onLocationDetected?.({
            lat: latitude,
            lng: longitude,
            city: 'Current Location',
            address: 'Location detected'
          });
          onMapOpen?.();
        }
        
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        let message = "Unable to detect location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timeout";
            break;
        }

        toast({
          title: "Location Error",
          description: message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center text-xs gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={detectLocation}
        disabled={isLoading}
        className="h-8 w-8 p-0"
        title="Find properties near me"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </Button>
      <span className="text-muted-foreground">Location</span>
    </div>
  );
};

export default LocationButton;