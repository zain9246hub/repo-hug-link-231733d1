import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invite {
  id: string;
  property_id: string;
  invited_email: string;
  invited_role: string;
  status: string;
  created_at: string;
  property_title?: string;
}

const PropertyInvites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchInvites();
  }, [user]);

  const fetchInvites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('property_invites')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch property titles
      const propertyIds = data.map((d: any) => d.property_id);
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title')
        .in('id', propertyIds);

      const titleMap = new Map(properties?.map((p: any) => [p.id, p.title]) || []);
      setInvites(data.map((d: any) => ({
        ...d,
        property_title: titleMap.get(d.property_id) || 'Unknown Property',
      })));
    }
    setLoading(false);
  };

  const handleAccept = async (invite: Invite) => {
    if (!user) return;

    try {
      // Transfer property ownership
      const { error: updateError } = await supabase
        .from('properties')
        .update({ user_id: user.id, listing_type: invite.invited_role, posted_by: invite.invited_role === 'broker' ? 'Broker' : invite.invited_role === 'builder' ? 'Builder' : 'Owner' })
        .eq('id', invite.property_id);

      if (updateError) throw updateError;

      // Mark invite as accepted
      const { error: inviteError } = await supabase
        .from('property_invites')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invite.id);

      if (inviteError) throw inviteError;

      toast({ title: "Property accepted!", description: `"${invite.property_title}" is now in your listings.` });
      fetchInvites();
    } catch (error: any) {
      console.error('Invite error:', error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
  };

  const handleDecline = async (inviteId: string) => {
    const { error } = await supabase
      .from('property_invites')
      .update({ status: 'declined' })
      .eq('id', inviteId);

    if (!error) {
      toast({ title: "Invite declined" });
      fetchInvites();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Property Invites</h1>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending property invites</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invites.map((invite) => (
            <Card key={invite.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{invite.property_title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Invited as <Badge variant="secondary" className="ml-1">{invite.invited_role}</Badge>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(invite.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="gap-1" onClick={() => handleAccept(invite)}>
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleDecline(invite.id)}>
                    <X className="h-4 w-4" /> Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyInvites;
