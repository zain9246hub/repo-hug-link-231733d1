import { User, Calculator, Settings, HelpCircle, LogOut, Bell, Heart, MapPin, Home, Calendar, IndianRupee, CheckCircle, Clock, LogIn, Briefcase, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIAN_STATES, getCitiesByState } from "@/data/locations";
import { useRentals } from "@/hooks/use-rentals";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Building2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const { rentals, getRentalStats } = useRentals();
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState({ city: "Mumbai", state: "Maharashtra" });
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user role from database (live)
  useEffect(() => {
    if (!authUser) {
      setUserRole(null);
      return;
    }
    const fetchRole = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', authUser.id)
        .maybeSingle();
      setUserRole(profile?.user_type || 'owner');
    };
    fetchRole();

    // Subscribe to realtime profile changes
    const channel = supabase
      .channel('profile-role-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${authUser.id}`,
      }, (payload: any) => {
        if (payload.new?.user_type) {
          setUserRole(payload.new.user_type);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      const location = JSON.parse(savedLocation);
      setUserLocation(location);
    }
  }, []);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity("");
    setCities(getCitiesByState(state));
  };

  const handleSaveLocation = () => {
    if (!selectedState || !selectedCity) {
      toast({
        title: "Error",
        description: "Please select both state and city",
        variant: "destructive"
      });
      return;
    }

    const newLocation = { city: selectedCity, state: selectedState };
    setUserLocation(newLocation);
    localStorage.setItem("userLocation", JSON.stringify(newLocation));
    setIsLocationDialogOpen(false);
    setSelectedState("");
    setSelectedCity("");
    
    toast({
      title: "Success",
      description: "Location preferences updated"
    });
  };
  
  // Show sign-in prompt when not logged in
  if (!authLoading && !authUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto bg-gradient-primary rounded-full p-4 w-fit">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome to Surat Propertys</CardTitle>
            <CardDescription>Sign in to manage your listings, saved properties, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full h-12 text-base gap-2" onClick={() => navigate("/auth")}>
              <LogIn className="h-5 w-5" />
              Sign In with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "User",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    avatar: authUser?.user_metadata?.avatar_url || "/placeholder.svg",
    location: `${userLocation.city}, ${userLocation.state}`
  };

  const profileMenuItems = [
    {
      icon: Home,
      title: "My Listings",
      description: "Manage your property listings",
      action: () => navigate("/my-listings")
    },
    {
      icon: Heart,
      title: "Saved Properties",
      description: "View your saved properties",
      action: () => navigate("/saved")
    },
    {
      icon: Calculator,
      title: "EMI Calculator",
      description: "Calculate your home loan EMI",
      action: () => navigate("/emi-calculator")
    },
    {
      icon: Settings,
      title: "Account Settings",
      description: "Manage your account preferences",
      action: () => navigate("/settings")
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage notification preferences",
      action: () => navigate("/notifications")
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help and contact support",
      action: () => navigate("/help")
    },
    {
      icon: LogOut,
      title: "Sign Out",
      description: "Sign out of your account",
      action: async () => {
        await signOut();
        toast({ title: "Signed out", description: "You have been signed out." });
        navigate("/");
      },
      variant: "destructive" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatar && user.avatar !== "/placeholder.svg" ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground truncate">{user.name}</h2>
                {userRole && (
                  <Badge variant="secondary" className="gap-1 text-xs capitalize">
                    {userRole === "broker" ? <Briefcase className="h-3 w-3" /> : userRole === "builder" ? <HardHat className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                    {userRole}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {user.location}
              </p>
              <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2">
                    Edit Profile
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Location</DialogTitle>
                  <DialogDescription>
                    Set your preferred location for property searches
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-state">State</Label>
                    <Select onValueChange={handleStateChange} value={selectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-city">City</Label>
                    <Select 
                      disabled={!selectedState}
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsLocationDialogOpen(false);
                    setSelectedState("");
                    setSelectedCity("");
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveLocation}>
                    Save Location
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rent Tracker */}
      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/rent-tracker")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Rent Tracker
          </CardTitle>
          <CardDescription>
            Track your rental payments and due dates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rentals.length > 0 ? (
            <>
              {rentals.slice(0, 3).map((rental) => (
                <div key={rental.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{rental.propertyName}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{rental.city}, {rental.state}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <IndianRupee className="h-3 w-3" />
                        <span className="font-medium text-foreground">₹{rental.rentAmount.toLocaleString('en-IN')}</span>
                        <span className="mx-1">•</span>
                        <span>per month</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      rental.status === 'paid' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {rental.status === 'paid' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span className="capitalize">{rental.status}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Next Due: <span className="font-medium text-foreground">{new Date(rental.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
                    </div>
                    {rental.status === 'paid' && rental.lastPaid && (
                      <span className="text-xs text-muted-foreground">
                        Last paid: {new Date(rental.lastPaid).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/rent-tracker")}>
                {rentals.length > 3 ? `View All ${rentals.length} Properties` : 'View All & Manage'}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No rental properties tracked yet</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/rent-tracker")}>
                Add Property
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Menu */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {profileMenuItems.map((item, index) => (
            <div key={item.title}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-auto p-4 ${
                  item.variant === "destructive" 
                    ? "text-destructive hover:text-destructive hover:bg-destructive/10" 
                    : ""
                }`}
                onClick={item.action}
              >
                <item.icon className={`h-5 w-5 mr-3 ${
                  item.variant === "destructive" ? "text-destructive" : "text-muted-foreground"
                }`} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </Button>
              {index < profileMenuItems.length - 1 && <Separator className="my-1" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;