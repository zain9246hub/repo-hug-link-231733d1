import { Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const SavedProperties = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Saved Properties</h1>
        <p className="text-muted-foreground mb-6">Properties you've saved for later.</p>

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
      </div>
    </div>
  );
};

export default SavedProperties;
