import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Phone, Mail, MapPin, Clock, Search, IndianRupee, Building2, ArrowLeft, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface BuilderInquiry {
  id: string;
  project_name: string;
  name: string;
  phone: string;
  email: string | null;
  unit_type: string | null;
  budget: string | null;
  message: string | null;
  source: string;
  status: string;
  created_at: string;
}

const BuilderLeads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<BuilderInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('builder_inquiries')
      .select('*')
      .eq('builder_user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) setLeads(data as BuilderInquiry[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('builder_inquiries').update({ status: newStatus }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    toast({ title: 'Status updated', description: `Lead marked as ${newStatus}` });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-red-500/10 text-red-600 border-red-500/30',
    contacted: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    converted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    lost: 'bg-muted text-muted-foreground border-border',
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingLeads = filteredLeads.filter(l => l.status === 'pending');
  const contactedLeads = filteredLeads.filter(l => l.status === 'contacted');
  const convertedLeads = filteredLeads.filter(l => l.status === 'converted');

  const LeadCard = ({ lead }: { lead: BuilderInquiry }) => (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground">{lead.name}</p>
              <p className="text-xs text-muted-foreground">{lead.project_name}{lead.unit_type ? ` • ${lead.unit_type}` : ''}</p>
            </div>
          </div>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColor[lead.status] || ''}`}>
            {lead.status.toUpperCase()}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {lead.budget && (
            <div className="flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              <span>{lead.budget}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeAgo(lead.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            <span>{lead.source}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>

        {lead.message && (
          <div className="mt-2 p-2 rounded-md bg-muted/30 text-xs text-muted-foreground flex items-start gap-1.5">
            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{lead.message}</span>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => window.open(`tel:${lead.phone}`)}>
            <Phone className="h-3 w-3 mr-1" /> Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`)}>
            <MessageSquare className="h-3 w-3 mr-1" /> WhatsApp
          </Button>
          {lead.status === 'pending' && (
            <Button size="sm" className="h-8 text-xs" onClick={() => updateStatus(lead.id, 'contacted')}>
              <CheckCircle2 className="h-3 w-3 mr-1" /> Accept
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Builder Leads</h1>
            <p className="text-xs text-muted-foreground">{leads.length} total enquiries</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-xs">All ({filteredLeads.length})</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">New ({pendingLeads.length})</TabsTrigger>
            <TabsTrigger value="contacted" className="text-xs">Active ({contactedLeads.length})</TabsTrigger>
            <TabsTrigger value="converted" className="text-xs">Won ({convertedLeads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No leads yet</p>
                <p className="text-xs mt-1">Leads will appear here when users enquire about your projects</p>
              </div>
            ) : filteredLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </TabsContent>
          <TabsContent value="pending">
            {pendingLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </TabsContent>
          <TabsContent value="contacted">
            {contactedLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </TabsContent>
          <TabsContent value="converted">
            {convertedLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BuilderLeads;
