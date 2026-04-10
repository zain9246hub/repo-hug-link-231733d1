import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface PropertyLocationMapProps {
  location: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsdXBtaTFuZzBhOXcya3A2OHdsdXJ3NnEifQ.SCQiOPi-wEfGFBYMykXmig';

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({ location, city, latitude, longitude }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      let lng = longitude || 0;
      let lat = latitude || 0;
      let hasCoords = !!(latitude && longitude);

      // Geocode if no coordinates
      if (!hasCoords) {
        try {
          const query = `${location}, ${city || 'India'}`;
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
          );
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            [lng, lat] = data.features[0].center;
            hasCoords = true;
          }
        } catch {
          // ignore geocoding errors
        }
      }

      if (!hasCoords) {
        setError(true);
        return;
      }

      try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: 14,
          interactive: true,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        new mapboxgl.Marker({ color: '#E11D48' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location}</strong>`))
          .addTo(map.current);
      } catch {
        setError(true);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, [location, city, latitude, longitude]);

  if (error) {
    return (
      <div className="h-64 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
        <MapPin className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{location}{city ? `, ${city}` : ''}</p>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="h-64 rounded-lg overflow-hidden" />
  );
};

export default PropertyLocationMap;
