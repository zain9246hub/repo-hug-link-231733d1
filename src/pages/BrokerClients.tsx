import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Phone, MessageSquare, Mail, Search, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  broker_id: string;
  name: string;
  phone: string;
  email: string | null;
  budget: string | null;
  requirement: string | null;
  status: string;
  last_contact: string | null;
  created_at: string;
}

const BrokerClients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: broker } = await supabase.from('brokers').select('id').eq('user_id', user.id).single();
    if (!broker) { setLoading(false); return; }

    const { data } = await supabase
      .from('broker_clients' as any)
      .select('*')
      .eq('broker_id', broker.id)
      .order('created_at', { ascending: false }) as { data: Client[] | null };

    if (data) setClients(data);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('broker_clients' as any).update({ status } as any).eq('id', id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast({ title: `Client marked as ${status}` });
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.requirement || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-emerald-500/30 text-emerald-600 bg-emerald-50';
      case 'closed': return 'border-primary/30 text-primary bg-primary/5';
      case 'inactive': return 'border-muted-foreground/30 text-muted-foreground bg-muted';
      default: return '';
    }
  };

  const renderClients = (filter: string) => {
    const list = filter === 'all' ? filtered : filtered.filter(c => c.status === filter);
    if (!list.length) return <p className="text-sm text-muted-foreground text-center py-8">No clients found</p>;
    return list.map(client => (
      <Card key={client.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.requirement || 'No requirement'}</p>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] ${getStatusColor(client.status)}`}>
              {client.status}
            </Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {client.budget && <span>Budget: <span className="text-foreground font-medium">{client.budget}</span></span>}
            <span>Added: {timeAgo(client.created_at)}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1"
              onClick={() => window.location.href = `tel:${client.phone}`}>
              <Phone className="h-3 w-3" /> Call
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1"
              onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank')}>
              <MessageSquare className="h-3 w-3" /> WhatsApp
            </Button>
            {client.status === 'active' && (
              <>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-primary"
                  onClick={() => updateStatus(client.id, 'closed')}>
                  Closed
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-muted-foreground"
                  onClick={() => updateStatus(client.id, 'inactive')}>
                  <UserX className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/broker-dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg text-foreground">My Clients</h1>
        <Badge className="ml-auto">{clients.length}</Badge>
      </div>

      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No clients yet</h3>
            <p className="text-sm text-muted-foreground">Accept leads from your Leads page to add clients here</p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
              <TabsTrigger value="closed" className="flex-1">Closed</TabsTrigger>
              <TabsTrigger value="inactive" className="flex-1">Inactive</TabsTrigger>
            </TabsList>
            {['all', 'active', 'closed', 'inactive'].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-3 mt-3">
                {renderClients(tab)}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default BrokerClients;
