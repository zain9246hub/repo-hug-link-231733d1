import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Sparkles,
  Home,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/PropertyCard";

interface SearchResult {
  id: number;
  title: string;
  type: string;
  category: string;
  location: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  amenities: string[];
  image: string;
}

interface RequirementForm {
  name: string;
  email: string;
  phone: string;
  description: string;
}

interface MatchedBroker {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  photo_url: string | null;
  specialization: string;
  experience_years: number;
  rating: number;
  total_reviews: number;
  areas: string[];
  verified: boolean;
}

const Requirements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedBroker, setMatchedBroker] = useState<MatchedBroker | null>(null);
  const [showBrokerPopup, setShowBrokerPopup] = useState(false);
  const [formData, setFormData] = useState<RequirementForm>({
    name: "",
    email: "",
    phone: "",
    description: "",
  });

  const recognitionRef = useRef<any>(null);

  // Typewriter placeholder animation
  const PLACEHOLDER_TEXTS = [
    "I need a 3BHK apartment in Adajan under 1 crore",
    "2BHK flat for rent in Vesu around 20k",
    "Villa in Varachha with garden and 4 bedrooms",
    "Commercial space in Katargam near main road",
    "1BHK flat for rent in Dindoli",
  ];

  useEffect(() => {
    if (searchQuery) return; // Stop animation when user types
    let textIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const currentText = PLACEHOLDER_TEXTS[textIdx];
      if (!isDeleting) {
        charIdx++;
        setAnimatedPlaceholder(currentText.slice(0, charIdx));
        if (charIdx === currentText.length) {
          // Pause at full text
          timeout = setTimeout(() => { isDeleting = true; tick(); }, 1500);
          return;
        }
        timeout = setTimeout(tick, 60);
      } else {
        charIdx--;
        setAnimatedPlaceholder(currentText.slice(0, charIdx));
        if (charIdx === 0) {
          isDeleting = false;
          textIdx = (textIdx + 1) % PLACEHOLDER_TEXTS.length;
          timeout = setTimeout(tick, 400);
          return;
        }
        timeout = setTimeout(tick, 30);
      }
    };

    tick();
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Voice Input Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const findMatchingBroker = async (query: string): Promise<MatchedBroker | null> => {
    try {
      const queryLower = query.toLowerCase();
      const { data: brokers, error } = await supabase
        .from("brokers")
        .select("*")
        .order("rating", { ascending: false });

      if (error || !brokers || brokers.length === 0) return null;

      // Try to match broker by area mentioned in the query
      const matched = brokers.find((broker) =>
        broker.areas.some((area: string) => queryLower.includes(area.toLowerCase()))
      );

      // Only return a broker if one actually serves the searched area
      return matched ? (matched as MatchedBroker) : null;
    } catch {
      return null;
    }
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter or speak your property requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    try {
      const { data, error } = await supabase.functions.invoke("ai-property-search", {
        body: { query },
      });

      if (error) throw error;

      if (data.hasMatches) {
        setSearchResults(data.matches);
        setShowRequirementForm(false);
        toast({
          title: "Properties Found!",
          description: `Found ${data.matches.length} matching properties.`,
        });
      } else {
        setSearchResults([]);
        // Find a matching broker for the area
        const broker = await findMatchingBroker(query);
        setMatchedBroker(broker);
        setShowRequirementForm(true);
        toast({
          title: "No Matches Found",
          description: "Submit your requirements to a local broker who can help!",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
      toast({
        title: "Listening...",
        description: "Speak your property requirements.",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const brokerId = matchedBroker?.id;

      if (brokerId) {
        // Save as broker inquiry
        const { error } = await supabase.from("broker_inquiries").insert({
          broker_id: brokerId,
          name: formData.name,
          phone: formData.phone,
          message: formData.description || searchQuery,
          property_interest: searchQuery,
          budget: null,
        });

        if (error) throw error;
      }

      // Show broker profile popup
      setShowRequirementForm(false);
      setShowBrokerPopup(true);

      toast({
        title: "Requirements Submitted!",
        description: matchedBroker
          ? `Sent to ${matchedBroker.name}. They'll contact you soon!`
          : "We'll notify you when we find matching properties.",
      });

      setFormData({ name: "", email: "", phone: "", description: "" });
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="page-container section-spacing pb-24">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Property Search
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Describe your dream property in words or voice, and let AI find it for you
          </p>
        </div>

        {/* Search Interface */}
        <Card className="backdrop-blur-sm bg-card/50 shadow-elegant mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={animatedPlaceholder || "Describe your dream property..."}
                    className="text-base h-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isSearching || isRecording}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className="h-12 w-12 flex-shrink-0"
                    disabled={isSearching}
                  >
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button
                    onClick={() => handleSearch()}
                    disabled={isSearching || isRecording || !searchQuery.trim()}
                    size="lg"
                    className="h-12 px-6 bg-gradient-primary"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
                  <Mic className="h-4 w-4" />
                  <span>Listening... Speak your requirements</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">
                Found {searchResults.length} Matching {searchResults.length === 1 ? 'Property' : 'Properties'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {searchResults.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id.toString()}
                  title={property.title}
                  location={property.location}
                  price={`₹${property.price.toLocaleString()}`}
                  bedrooms={property.bedrooms || 0}
                  bathrooms={property.bathrooms || 0}
                  area={`${property.area} sq ft`}
                  image={property.image}
                  propertyType={property.category === "buy" ? "sale" : "rent"}
                  listingType="owner"
                  isVerified={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Requirement Form (shown when no matches) */}
        {showRequirementForm && (
          <Card className="backdrop-blur-sm bg-card/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Submit Your Requirements</CardTitle>
              <CardDescription>
                {matchedBroker
                  ? `Your requirements will be sent to ${matchedBroker.name}, a verified broker in your area.`
                  : "Leave your details and we'll notify you when something perfect comes up!"}
              </CardDescription>
            </CardHeader>

            {/* Show matched broker preview */}
            {matchedBroker && (
              <CardContent className="pt-0 pb-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={matchedBroker.photo_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {matchedBroker.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">{matchedBroker.name}</p>
                      {matchedBroker.verified && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {Number(matchedBroker.rating).toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{matchedBroker.experience_years}yr exp</span>
                      <span>•</span>
                      <span>{matchedBroker.specialization}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Your Requirements</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || searchQuery}
                    onChange={handleInputChange}
                    placeholder="Tell us more about what you're looking for..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    matchedBroker ? `Submit to ${matchedBroker.name}` : 'Submit Requirements'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Example Queries */}
        {!hasSearched && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Try these example searches:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "3BHK apartment in Adajan under 1 crore with parking",
                "2BHK flat for rent in Vesu around 20k with gym",
                "Villa in Varachha with garden and 4 bedrooms",
                "Commercial space in Katargam near main road",
              ].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2.5 px-4 text-sm whitespace-normal"
                  onClick={() => {
                    setSearchQuery(example);
                    handleSearch(example);
                  }}
                >
                  {example}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Broker Profile Success Popup */}
      <Dialog open={showBrokerPopup} onOpenChange={setShowBrokerPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Requirements Submitted!
            </DialogTitle>
          </DialogHeader>

          {matchedBroker ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Your requirements have been sent to the following broker. They will contact you shortly.
              </p>

              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={matchedBroker.photo_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {matchedBroker.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="font-bold text-lg">{matchedBroker.name}</h3>
                    {matchedBroker.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{matchedBroker.specialization}</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{Number(matchedBroker.rating).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({matchedBroker.total_reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{matchedBroker.phone}</span>
                </div>
                {matchedBroker.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{matchedBroker.email}</span>
                  </div>
                )}
                {matchedBroker.areas.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{matchedBroker.areas.join(", ")}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-gradient-primary"
                onClick={() => {
                  setShowBrokerPopup(false);
                  navigate("/");
                }}
              >
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your requirements have been submitted. We'll notify you when matching properties are available.
              </p>
              <Button
                className="w-full bg-gradient-primary"
                onClick={() => {
                  setShowBrokerPopup(false);
                  navigate("/");
                }}
              >
                Back to Home
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requirements;
