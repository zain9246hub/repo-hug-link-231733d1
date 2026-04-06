import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Star, Shield, Users, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SURAT_AREAS } from '@/data/locations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import broker1 from '@/assets/broker-1.jpg';
import broker2 from '@/assets/broker-2.jpg';

interface Broker {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  photo_url: string | null;
  experience_years: number;
  specialization: string;
  areas: string[];
  rating: number;
  total_reviews: number;
  properties_sold: number;
  verified: boolean;
  bio: string | null;
}

const FALLBACK_BROKERS: Broker[] = [
  {
    id: "b1", name: "Rajesh Patel", phone: "+91 98765 XXXXX", email: null,
    photo_url: null, experience_years: 12, specialization: "Residential",
    areas: ["Adajan", "Vesu", "Piplod"], rating: 4.8, total_reviews: 124,
    properties_sold: 45, verified: true,
    bio: "Expert in luxury apartments and premium residential properties in South Surat.",
  },
  {
    id: "b2", name: "Amit Shah", phone: "+91 87654 XXXXX", email: null,
    photo_url: null, experience_years: 8, specialization: "Commercial",
    areas: ["Varachha", "Katargam", "Mota Varachha"], rating: 4.5, total_reviews: 89,
    properties_sold: 32, verified: true,
    bio: "Specializes in commercial properties, shops, and office spaces in East Surat.",
  },
  {
    id: "b3", name: "Priya Desai", phone: "+91 76543 XXXXX", email: null,
    photo_url: null, experience_years: 15, specialization: "Rental",
    areas: ["City Light", "Athwa", "Ghod Dod Road"], rating: 4.9, total_reviews: 203,
    properties_sold: 78, verified: true,
    bio: "Top-rated rental specialist with extensive network in prime Surat localities.",
  },
  {
    id: "b4", name: "Kiran Mehta", phone: "+91 65432 XXXXX", email: null,
    photo_url: null, experience_years: 5, specialization: "Residential",
    areas: ["Pal", "Althan", "Palanpur Patia"], rating: 4.3, total_reviews: 56,
    properties_sold: 22, verified: false,
    bio: "Growing broker focused on affordable housing and new project bookings.",
  },
  {
    id: "b5", name: "Suresh Joshi", phone: "+91 54321 XXXXX", email: null,
    photo_url: null, experience_years: 20, specialization: "Plot & Land",
    areas: ["Rander", "Adajan", "Magdalla"], rating: 4.6, total_reviews: 98,
    properties_sold: 60, verified: true,
    bio: "Veteran broker specializing in plots, land deals, and farmhouse properties.",
  },
  {
    id: "b6", name: "Neha Agarwal", phone: "+91 43210 XXXXX", email: null,
    photo_url: null, experience_years: 10, specialization: "Luxury",
    areas: ["Vesu", "VIP Road", "Dumas Road"], rating: 4.7, total_reviews: 145,
    properties_sold: 35, verified: true,
    bio: "Luxury property consultant dealing in high-end villas and penthouses.",
  },
];

const BrokerRegistrationForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', specialization: 'Residential',
    experience_years: 1, bio: '', areas: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please login first", description: "You need to be logged in to register as a broker.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('brokers').insert({
      user_id: user.id,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      specialization: form.specialization,
      experience_years: form.experience_years,
      bio: form.bio || null,
      areas: form.areas,
    } as any);

    setLoading(false);
    if (error) {
      console.error('Broker registration error:', error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Registered!", description: "Your broker profile is now live." });
      onSuccess();
    }
  };

  const toggleArea = (area: string) => {
    setForm(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name *</Label>
        <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Phone *</Label>
        <Input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Specialization</Label>
        <Select value={form.specialization} onValueChange={v => setForm(p => ({ ...p, specialization: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Residential", "Commercial", "Rental", "Plot & Land", "Luxury"].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Years of Experience</Label>
        <Input type="number" min={1} max={50} value={form.experience_years}
          onChange={e => setForm(p => ({ ...p, experience_years: parseInt(e.target.value) || 1 }))} />
      </div>
      <div className="space-y-2">
        <Label>Areas You Serve (select multiple)</Label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto border rounded-md p-2">
          {[...SURAT_AREAS].sort().map(area => (
            <Badge key={area} variant={form.areas.includes(area) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleArea(area)}>
              {area}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>About You</Label>
        <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
          placeholder="Brief description of your expertise..." />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground">
        {loading ? "Registering..." : "Register as Broker"}
      </Button>
    </form>
  );
};

const Brokers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [brokers, setBrokers] = useState<Broker[]>(FALLBACK_BROKERS);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchBrokers = async () => {
    const { data, error } = await supabase.from('brokers').select('*') as { data: Broker[] | null; error: any };
    if (data && data.length > 0) {
      setBrokers(data);
    }
  };

  useEffect(() => { fetchBrokers(); }, []);

  const getPhoto = (broker: Broker, idx: number) => {
    if (broker.photo_url) return broker.photo_url;
    return idx % 2 === 0 ? broker1 : broker2;
  };

  const filteredBrokers = useMemo(() => {
    return brokers.filter(broker => {
      const matchesSearch = searchQuery === '' ||
        broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broker.areas.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        broker.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = selectedArea === 'all' || broker.areas.includes(selectedArea);
      const matchesSpec = selectedSpecialization === 'all' || broker.specialization === selectedSpecialization;
      return matchesSearch && matchesArea && matchesSpec;
    });
  }, [searchQuery, selectedArea, selectedSpecialization, brokers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-7 w-7" />
                <h1 className="text-2xl md:text-3xl font-bold">Find Brokers in Surat</h1>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Connect with verified and trusted property brokers across Surat
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Register
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Register as a Broker</DialogTitle>
                </DialogHeader>
                <BrokerRegistrationForm onSuccess={() => { setDialogOpen(false); fetchBrokers(); }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto max-w-4xl px-4 -mt-5">
        <Card className="shadow-lg border-0">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, area, or specialization..." className="pl-10"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Areas</SelectItem>
                  {[...SURAT_AREAS].sort().map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {["Residential", "Commercial", "Rental", "Plot & Land", "Luxury"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="container mx-auto max-w-4xl px-4 mt-6">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredBrokers.length} broker{filteredBrokers.length !== 1 ? 's' : ''} found
        </p>
        <div className="space-y-4">
          {filteredBrokers.map((broker, idx) => (
            <Card key={broker.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/broker/${broker.id}`)}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-32 h-40 sm:h-auto flex-shrink-0">
                    <img src={getPhoto(broker, idx)} alt={broker.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground">{broker.name}</h3>
                          {broker.verified && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Shield className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{broker.specialization} Specialist</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="font-semibold text-foreground">{Number(broker.rating).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({broker.total_reviews})</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{broker.bio}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {broker.areas.map(area => (
                        <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{broker.experience_years} yrs exp</span>
                        <span>{broker.properties_sold} properties</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs" onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${broker.phone}`; }}>
                          <Phone className="h-3 w-3 mr-1" /> Contact
                        </Button>
                        <Button size="sm" className="text-xs bg-gradient-primary text-primary-foreground"
                          onClick={(e) => { e.stopPropagation(); navigate(`/broker/${broker.id}`); }}>
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredBrokers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No brokers found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Brokers;
