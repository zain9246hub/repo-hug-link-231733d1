import { Heart, Home, Trash2, MapPin, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSavedProperties } from "@/hooks/use-saved-properties";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/hooks/use-properties";

const SavedProperties = () => {
  const navigate = useNavigate();
  const { savedProperties, loading, toggleSave } = useSavedProperties();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      if (savedProperties.length === 0) {
        setProperties([]);
        setLoadingProps(false);
        return;
      }
      const ids = savedProperties.map(sp => sp.property_id);
      const { data } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids);
      setProperties((data as Property[]) || []);
      setLoadingProps(false);
    };
    if (!loading) fetchProps();
  }, [savedProperties, loading]);

  if (loading || loadingProps) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Saved Properties</h1>
        <p className="text-muted-foreground mb-6">Properties you've saved for later.</p>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No saved properties yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Tap the heart icon on any property to save it here for easy access later.
              </p>
              <Button onClick={() => navigate("/search")} className="gap-2">
                <Home className="h-4 w-4" />
                Browse Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {properties.map(property => (
              <Card key={property.id} className="cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {property.image_url && (
                      <img src={property.image_url} alt={property.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.location}, {property.city}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-primary mt-1">
                        <IndianRupee className="h-3 w-3" />
                        {property.price}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); toggleSave(property.id); }}
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;
