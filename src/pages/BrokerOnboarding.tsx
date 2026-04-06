import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Loader2, X } from "lucide-react";

const BrokerOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    specialization: "Residential",
    experience_years: 1,
    bio: "",
    areaInput: "",
    areas: [] as string[],
  });

  const addArea = () => {
    const area = form.areaInput.trim();
    if (area && !form.areas.includes(area)) {
      setForm((p) => ({ ...p, areas: [...p.areas, area], areaInput: "" }));
    }
  };

  const removeArea = (area: string) => {
    setForm((p) => ({ ...p, areas: p.areas.filter((a) => a !== area) }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || form.areas.length === 0) {
      toast({ title: "Missing fields", description: "Please fill name, phone and at least one area.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not logged in", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("brokers").insert({
      user_id: user.id,
      name: form.name,
      phone: form.phone,
      email: form.email || user.email || null,
      specialization: form.specialization,
      experience_years: form.experience_years,
      bio: form.bio || null,
      areas: form.areas,
    });

    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Profile already exists", description: "Redirecting to dashboard..." });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      toast({ title: "Broker profile created!", description: "Welcome aboard!" });
    }
    navigate("/broker-dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-gradient-primary rounded-full p-3 w-fit">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Complete Your Broker Profile</CardTitle>
          <CardDescription>Fill in your details to start receiving leads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone *</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Specialization</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.specialization}
                onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
                <option value="Rental">Rental</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Experience (years)</Label>
              <Input type="number" min={0} value={form.experience_years} onChange={(e) => setForm((p) => ({ ...p, experience_years: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Areas You Serve *</Label>
            <div className="flex gap-2">
              <Input
                value={form.areaInput}
                onChange={(e) => setForm((p) => ({ ...p, areaInput: e.target.value }))}
                placeholder="e.g. Vesu, Adajan"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addArea())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addArea}>
                Add
              </Button>
            </div>
            {form.areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.areas.map((area) => (
                  <Badge key={area} variant="secondary" className="gap-1 pr-1">
                    {area}
                    <button onClick={() => removeArea(area)} className="ml-0.5 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell clients about yourself..." rows={3} />
          </div>

          <Button className="w-full h-11" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerOnboarding;
