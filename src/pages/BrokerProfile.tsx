import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Shield, MapPin, Phone, Mail, Clock, Home, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  created_at: string;
}

interface Review {
  id: string;
  broker_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  reviewer_name: string;
  created_at: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`h-5 w-5 transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            star <= (hover || rating) ? 'text-primary fill-primary' : 'text-muted-foreground/30'
          }`}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
    </div>
  );
};

const InquiryForm = ({ brokerId, brokerName }: { brokerId: string; brokerName: string }) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '', property_interest: '', budget: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('broker_inquiries' as any).insert({
      broker_id: brokerId,
      name: form.name,
      phone: form.phone,
      message: form.message || null,
      property_interest: form.property_interest || null,
      budget: form.budget || null,
    } as any);
    setSubmitting(false);
    if (error) {
      console.error('Inquiry error:', error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Inquiry Sent!", description: `Your inquiry has been sent to ${brokerName}. They will contact you soon.` });
      setForm({ name: '', phone: '', message: '', property_interest: '', budget: '' });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Send Inquiry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Your Name *</Label>
              <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone *</Label>
              <Input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Property Interest</Label>
              <Input value={form.property_interest} onChange={e => setForm(p => ({ ...p, property_interest: e.target.value }))} placeholder="e.g. 3 BHK in Vesu" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Budget</Label>
              <Input value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="e.g. ₹50-80 Lac" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message</Label>
            <Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell the broker what you're looking for..." rows={3} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-gradient-primary text-primary-foreground gap-1">
            <Send className="h-4 w-4" /> {submitting ? 'Sending...' : 'Send Inquiry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const BrokerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, text: '', name: '' });

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const [brokerRes, reviewsRes] = await Promise.all([
        supabase.from('brokers').select('*').eq('id', id).single(),
        supabase.from('broker_reviews').select('*').eq('broker_id', id).order('created_at', { ascending: false }),
      ]);
      if (brokerRes.data) setBroker(brokerRes.data as Broker);
      if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please login first", description: "You need to be logged in to leave a review.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('broker_reviews').insert({
      broker_id: id,
      user_id: user.id,
      rating: newReview.rating,
      review_text: newReview.text || null,
      reviewer_name: newReview.name || 'Anonymous',
    } as any);
    setSubmitting(false);
    if (error) {
      console.error('Review error:', error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setNewReview({ rating: 0, text: '', name: '' });
      // Refresh
      const [brokerRes, reviewsRes] = await Promise.all([
        supabase.from('brokers').select('*').eq('id', id).single(),
        supabase.from('broker_reviews').select('*').eq('broker_id', id).order('created_at', { ascending: false }),
      ]);
      if (brokerRes.data) setBroker(brokerRes.data as Broker);
      if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-foreground">Broker not found</h2>
        <Button onClick={() => navigate('/brokers')} variant="outline">Back to Brokers</Button>
      </div>
    );
  }

  const photo = broker.photo_url || (broker.name.length % 2 === 0 ? broker1 : broker2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button variant="ghost" size="sm" className="text-primary-foreground/80 mb-3 -ml-2" onClick={() => navigate('/brokers')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex gap-4 items-start">
            <img src={photo} alt={broker.name} className="w-20 h-20 rounded-xl object-cover border-2 border-primary-foreground/20" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{broker.name}</h1>
                {broker.verified && (
                  <Badge variant="secondary" className="text-xs gap-1"><Shield className="h-3 w-3" /> Verified</Badge>
                )}
              </div>
              <p className="text-primary-foreground/80 text-sm">{broker.specialization} Specialist</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold">{Number(broker.rating).toFixed(1)}</span>
                <span className="text-primary-foreground/70 text-xs">({broker.total_reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 mt-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: 'Experience', value: `${broker.experience_years} yrs` },
            { icon: Home, label: 'Properties', value: broker.properties_sold.toString() },
            { icon: Star, label: 'Rating', value: Number(broker.rating).toFixed(1) },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="p-3 text-center">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* About */}
        {broker.bio && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">About</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{broker.bio}</p></CardContent>
          </Card>
        )}

        {/* Contact & Areas */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-foreground">{broker.phone}</span>
            </div>
            {broker.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-foreground">{broker.email}</span>
              </div>
            )}
            <Separator />
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Areas Served</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {broker.areas.map(area => (
                  <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiry Form */}
        <InquiryForm brokerId={broker.id} brokerName={broker.name} />

        {/* Write Review */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Write a Review</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Your Rating *</Label>
              <StarRating rating={newReview.rating} onRate={r => setNewReview(p => ({ ...p, rating: r }))} interactive />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Your Name</Label>
              <Input placeholder="Anonymous" value={newReview.name} onChange={e => setNewReview(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Your Review</Label>
              <Textarea placeholder="Share your experience..." value={newReview.text} onChange={e => setNewReview(p => ({ ...p, text: e.target.value }))} />
            </div>
            <Button onClick={handleSubmitReview} disabled={submitting} className="w-full bg-gradient-primary text-primary-foreground gap-1">
              <Send className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No reviews yet. Be the first to review!</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {review.reviewer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{review.reviewer_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.review_text && <p className="text-sm text-muted-foreground mt-1">{review.review_text}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerProfile;
