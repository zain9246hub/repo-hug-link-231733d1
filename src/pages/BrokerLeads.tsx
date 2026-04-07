import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Phone, MessageSquare, Search, XCircle, UserPlus, ClipboardList, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Inquiry {
  id: string;
  broker_id: string;
  name: string;
  phone: string;
  message: string | null;
  property_interest: string | null;
  budget: string | null;
  status: string;
  created_at: string;
  source?: 'inquiry' | 'requirement';
  area?: string | null;
  city?: string | null;
}

const BrokerLeads = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokerId, setBrokerId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: broker } = await supabase.from('brokers').select('id').eq('user_id', user.id).single();
    if (!broker) { setLoading(false); return; }
    setBrokerId(broker.id);

    const [inquiriesRes, requirementsRes] = await Promise.all([
      supabase
        .from('broker_inquiries' as any)
        .select('*')
        .eq('broker_id', broker.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('area_requirements' as any)
        .select('id, name, phone, description, property_type, budget, status, created_at, area, city')
        .order('created_at', { ascending: false }),
    ]);

    const directInquiries = ((inquiriesRes.data as Inquiry[] | null) || []).map((item) => ({
      ...item,
      source: 'inquiry' as const,
    }));

    const matchedRequirements = (((requirementsRes.data as any[] | null) || []).map((item) => ({
      id: item.id,
      broker_id: broker.id,
      name: item.name || 'Unknown',
      phone: item.phone || '',
      message: item.description,
      property_interest: item.property_type ? `${item.property_type} requirement` : 'Property requirement',
      budget: item.budget,
      status: item.status || 'pending',
      created_at: item.created_at,
      source: 'requirement' as const,
      area: item.area,
      city: item.city,
    })));

    const merged = [...directInquiries, ...matchedRequirements].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setInquiries(merged);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, []);

  const updateStatus = async (lead: Inquiry, status: string) => {
    const table = lead.source === 'requirement' ? 'area_requirements' : 'broker_inquiries';
    await supabase.from(table as any).update({ status } as any).eq('id', lead.id);
    setInquiries(prev => prev.map(i => i.id === lead.id ? { ...i, status } : i));
    toast({ title: `Lead marked as ${status}` });
  };

  const acceptAsClient = async (lead: Inquiry) => {
    if (!brokerId) return;

    const { error } = await supabase.from('broker_clients' as any).insert({
      broker_id: brokerId,
      name: lead.name,
      phone: lead.phone,
      budget: lead.budget,
      requirement: lead.property_interest || lead.message,
      inquiry_id: lead.source === 'inquiry' ? lead.id : null,
      status: 'active',
    } as any);

    if (error) {
      toast({ title: 'Error', description: 'Could not accept client', variant: 'destructive' });
      return;
    }

    if (lead.source === 'inquiry') {
      await supabase.from('broker_inquiries' as any).update({ status: 'converted' } as any).eq('id', lead.id);
    } else {
      await supabase.from('area_requirements' as any).update({ status: 'converted' } as any).eq('id', lead.id);
    }

    setInquiries(prev => prev.map(i => i.id === lead.id ? { ...i, status: 'converted' } : i));
    toast({ title: '✅ Client Added', description: `${lead.name} has been moved to My Clients` });
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const filtered = inquiries.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.property_interest || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.area || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-600 bg-orange-50">Pending</Badge>;
      case 'contacted': return <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-600 bg-blue-50">Contacted</Badge>;
      case 'converted': return <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-50">Converted</Badge>;
      case 'lost': return <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-600 bg-red-50">Lost</Badge>;
      case 'open': return <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-600 bg-orange-50">Pending</Badge>;
      default: return null;
    }
  };

  const renderLeads = (filter: string) => {
    const list = filter === 'all' ? filtered : filtered.filter(l => (l.status === filter || (filter === 'pending' && l.status === 'open')));
    if (!list.length) return <p className="text-sm text-muted-foreground text-center py-8">No leads found</p>;
    return list.map(lead => (
      <Card key={`${lead.source}-${lead.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">{lead.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{lead.name}</p>
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    {lead.source === 'requirement' ? <ClipboardList className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                    {lead.source === 'requirement' ? 'Requirement' : 'Inquiry'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{lead.property_interest || 'General inquiry'}</p>
                {(lead.area || lead.city) && (
                  <p className="text-xs text-muted-foreground mt-1">{[lead.area, lead.city].filter(Boolean).join(', ')}</p>
                )}
              </div>
            </div>
            {getStatusBadge(lead.status)}
          </div>
          {lead.message && (
            <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded">"{lead.message}"</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {lead.budget && <span>Budget: <span className="text-foreground font-medium">{lead.budget}</span></span>}
            <span>Received: {timeAgo(lead.created_at)}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1" disabled={!lead.phone}
              onClick={() => window.location.href = `tel:${lead.phone}`}>
              <Phone className="h-3 w-3" /> Call
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1" disabled={!lead.phone}
              onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}>
              <MessageSquare className="h-3 w-3" /> WhatsApp
            </Button>
            {(lead.status === 'pending' || lead.status === 'contacted' || lead.status === 'open') && (
              <Button size="sm" className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => acceptAsClient(lead)}>
                <UserPlus className="h-3 w-3" /> Accept
              </Button>
            )}
            {(lead.status === 'pending' || lead.status === 'open') && (
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-red-600"
                onClick={() => updateStatus(lead, 'lost')}>
                <XCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    ));
  };

  const pendingCount = inquiries.filter(l => l.status === 'pending' || l.status === 'open').length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/broker-dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg text-foreground">Leads & Inquiries</h1>
        <Badge className="ml-auto">{pendingCount} Pending</Badge>
      </div>

      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No leads yet</h3>
            <p className="text-sm text-muted-foreground">Posted requirements and direct inquiries will appear here</p>
          </div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
              <TabsTrigger value="contacted" className="flex-1">Contacted</TabsTrigger>
              <TabsTrigger value="converted" className="flex-1">Converted</TabsTrigger>
            </TabsList>
            {['all', 'pending', 'contacted', 'converted'].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-3 mt-3">
                {renderLeads(tab)}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default BrokerLeads;
