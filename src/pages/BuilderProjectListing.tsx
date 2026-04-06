import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, MapPin, IndianRupee, Layers, Image,
  Calendar, Phone, Mail, FileText, Plus, X, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const unitTypes = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', 'Penthouse', 'Villa', 'Duplex', 'Shop', 'Office'];
const amenitiesList = ['Swimming Pool', 'Gym', 'Garden', 'Parking', 'Club House', 'Security', 'Lift', 'Children Play Area', 'Power Backup', 'Water Supply', 'CCTV', 'Jogging Track'];
const statusOptions = ['Pre-Launch', 'Under Construction', 'Near Completion', 'Ready to Move'];

const BuilderProjectListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  const [form, setForm] = useState({
    projectName: '', location: '', city: 'Surat', reraNumber: '',
    totalUnits: '', priceMin: '', priceMax: '', status: 'Under Construction',
    completionDate: '', description: '', contactPhone: '', contactEmail: '',
  });

  const [selectedUnitTypes, setSelectedUnitTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 15 - images.length;
    if (remaining <= 0) { toast({ title: 'Limit reached', variant: 'destructive' }); return; }
    const newImages = files.slice(0, remaining).map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  };

  const toggleItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be logged in.', variant: 'destructive' });
      navigate('/auth');
      return;
    }
    if (!form.projectName || !form.location || !form.totalUnits || !form.priceMin || !form.contactPhone) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const priceRange = form.priceMax ? `₹${form.priceMin} - ₹${form.priceMax}` : `₹${form.priceMin}+`;

    const { error } = await supabase.from('builder_projects').insert({
      user_id: user.id,
      name: form.projectName,
      location: `${form.location}, ${form.city}`,
      city: form.city,
      total_units: parseInt(form.totalUnits) || 0,
      status: form.status,
      price_range: priceRange,
      rera_number: form.reraNumber || null,
      description: form.description,
      contact_phone: form.contactPhone,
      contact_email: form.contactEmail || null,
      unit_types: selectedUnitTypes,
      amenities: selectedAmenities,
      completion_date: form.completionDate || null,
      image_url: images.length > 0 ? images[0].preview : null,
    });

    setIsSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit project.', variant: 'destructive' });
      console.error(error);
      return;
    }

    setSubmitted(true);
    toast({ title: 'Project Listed!', description: 'Your project has been submitted.' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground text-center">Project Listed Successfully!</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Your project "{form.projectName}" has been submitted.
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ projectName: '', location: '', city: 'Surat', reraNumber: '', totalUnits: '', priceMin: '', priceMax: '', status: 'Under Construction', completionDate: '', description: '', contactPhone: '', contactEmail: '' }); setSelectedUnitTypes([]); setSelectedAmenities([]); setImages([]); }}>
            List Another
          </Button>
          <Button onClick={() => navigate('/builder-dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-background to-orange-50/50 pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-bold text-foreground text-lg">List New Project</h1>
            <p className="text-xs text-muted-foreground">Add your builder project details</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <Card><CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1"><Building2 className="h-4 w-4 text-primary" /><h3 className="font-bold text-foreground text-sm">Project Details</h3></div>
          <div className="space-y-3">
            <div><Label className="text-xs">Project Name *</Label><Input placeholder="e.g. Sunrise Residency" value={form.projectName} onChange={e => handleChange('projectName', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Location *</Label><Input placeholder="e.g. Vesu" value={form.location} onChange={e => handleChange('location', e.target.value)} /></div>
              <div><Label className="text-xs">City</Label><Input placeholder="e.g. Surat" value={form.city} onChange={e => handleChange('city', e.target.value)} /></div>
            </div>
            <div><Label className="text-xs">RERA Number</Label><Input placeholder="e.g. P51700012345" value={form.reraNumber} onChange={e => handleChange('reraNumber', e.target.value)} /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1"><Layers className="h-4 w-4 text-primary" /><h3 className="font-bold text-foreground text-sm">Units & Pricing</h3></div>
          <div><Label className="text-xs">Total Units *</Label><Input type="number" placeholder="e.g. 120" value={form.totalUnits} onChange={e => handleChange('totalUnits', e.target.value)} /></div>
          <div><Label className="text-xs mb-2 block">Unit Types</Label><div className="flex flex-wrap gap-2">{unitTypes.map(type => (<Badge key={type} variant={selectedUnitTypes.includes(type) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleItem(type, selectedUnitTypes, setSelectedUnitTypes)}>{type}</Badge>))}</div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Min Price (₹) *</Label><Input placeholder="e.g. 4500000" value={form.priceMin} onChange={e => handleChange('priceMin', e.target.value)} /></div>
            <div><Label className="text-xs">Max Price (₹)</Label><Input placeholder="e.g. 12000000" value={form.priceMax} onChange={e => handleChange('priceMax', e.target.value)} /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1"><Calendar className="h-4 w-4 text-primary" /><h3 className="font-bold text-foreground text-sm">Status & Timeline</h3></div>
          <div><Label className="text-xs mb-2 block">Project Status</Label><div className="flex flex-wrap gap-2">{statusOptions.map(s => (<Badge key={s} variant={form.status === s ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => handleChange('status', s)}>{s}</Badge>))}</div></div>
          <div><Label className="text-xs">Expected Completion</Label><Input type="month" value={form.completionDate} onChange={e => handleChange('completionDate', e.target.value)} /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1"><Plus className="h-4 w-4 text-primary" /><h3 className="font-bold text-foreground text-sm">Amenities</h3></div>
          <div className="flex flex-wrap gap-2">{amenitiesList.map(a => (<Badge key={a} variant={selectedAmenities.includes(a) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleItem(a, selectedAmenities, setSelectedAmenities)}>{a}</Badge>))}</div>
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Image className="h-4 w-4 text-primary" /><h3 className="font-bold text-foreground text-sm">Project Images</h3></div>
            <span className="text-xs text-muted-foreground">{images.length}/15</span>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={img.preview} alt={`Project ${i + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-3 w-3" /></button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Cover</span>}
                </div>
              ))}
            </div>
          )}
          {images.length < 15 && (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-muted/30 transition-colors">
              <Image className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-foreground">Tap to add images</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
            </label>
          )}
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-primary" /><h3 className="font-bold text-foreground text-sm">Description</h3></div>
          <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Describe your project" value={form.description} onChange={e => handleChange('description', e.target.value)} />
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1"><Phone className="h-4 w-4 text-primary" /><h3 className="font-bold text-foreground text-sm">Contact Details</h3></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Phone *</Label><Input placeholder="+91 98765..." value={form.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)} /></div>
            <div><Label className="text-xs">Email</Label><Input type="email" placeholder="builder@email.com" value={form.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)} /></div>
          </div>
        </CardContent></Card>

        <Button className="w-full h-12 text-base font-bold" onClick={handleSubmit} disabled={isSubmitting}>
          <Building2 className="h-5 w-5 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Project Listing'}
        </Button>
      </div>
    </div>
  );
};

export default BuilderProjectListing;
