import { Bell, Home, Heart, TrendingDown, MessageSquare, Clock, IndianRupee, AlertTriangle, UserCheck, Trash2, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRentals } from "@/hooks/use-rentals";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const LISTING_EXPIRY_DAYS = 30;

const getExpiringListings = () => {
  const keys = ['propertyListings', 'rentalListings'];
  const expiring: any[] = [];
  keys.forEach(key => {
    const listings = JSON.parse(localStorage.getItem(key) || '[]');
    listings.forEach((listing: any) => {
      const expiryDate = listing.expiresAt
        ? new Date(listing.expiresAt)
        : new Date(new Date(listing.createdAt).getTime() + LISTING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft >= 0) {
        expiring.push({ ...listing, daysLeft, listingType: key.includes('rental') ? 'rental' : 'property' });
      }
    });
  });
  return expiring;
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const Notifications = () => {
  const { getDueRentals } = useRentals();
  const navigate = useNavigate();
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [brokerNotifications, setBrokerNotifications] = useState<any[]>([]);

  // Fetch broker notifications from database
  useEffect(() => {
    const fetchBrokerNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is a broker
      const { data: broker } = await supabase.from('brokers').select('id').eq('user_id', user.id).single();
      if (!broker) return;

      const { data } = await supabase
        .from('broker_notifications' as any)
        .select('*')
        .eq('broker_id', broker.id)
        .order('created_at', { ascending: false })
        .limit(20) as { data: any[] | null };

      if (data) {
        setBrokerNotifications(data.map((n: any) => ({
          id: `broker-${n.id}`,
          dbId: n.id,
          type: n.type === 'requirement' ? 'requirement' : 'inquiry',
          icon: n.type === 'requirement' ? ClipboardList : UserCheck,
          title: n.title,
          description: n.message,
          time: timeAgo(n.created_at),
          isRead: n.is_read,
          action: n.type === 'requirement' ? '/broker-leads' : '/broker-leads',
        })));
      }
    };

    fetchBrokerNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('broker-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broker_notifications' }, (payload) => {
        const n = payload.new as any;
        setBrokerNotifications(prev => [{
          id: `broker-${n.id}`,
          dbId: n.id,
          type: n.type === 'requirement' ? 'requirement' : 'inquiry',
          icon: n.type === 'requirement' ? ClipboardList : UserCheck,
          title: n.title,
          description: n.message,
          time: 'Just now',
          isRead: false,
          action: '/broker-leads',
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const dueRentals = getDueRentals();
    const today = new Date();

    const rentNotifications = dueRentals.map((rental) => {
      const dueDateTime = new Date(rental.dueDate + "T" + rental.dueTime);
      const daysUntilDue = Math.ceil((dueDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: `rent-${rental.id}`,
        type: "rent_due",
        icon: IndianRupee,
        title: daysUntilDue < 0 ? "Rent Overdue!" : "Rent Due Soon",
        description: `${rental.propertyName} - ₹${rental.rentAmount.toLocaleString('en-IN')} ${daysUntilDue < 0 ? 'is overdue' : `due in ${daysUntilDue} day(s)`}`,
        details: `Contact: ${rental.phoneNumber} | ${rental.city}, ${rental.state}`,
        time: daysUntilDue < 0 ? `Overdue by ${Math.abs(daysUntilDue)} day(s)` : `Due: ${new Date(rental.dueDate).toLocaleDateString('en-IN')}`,
        isRead: false,
        action: '/rent-tracker',
      };
    });

    const expiringListings = getExpiringListings();
    const expiryNotifications = expiringListings.map((listing) => ({
      id: `expiry-${listing.id}`,
      type: "expiry_warning",
      icon: AlertTriangle,
      title: listing.daysLeft === 0 ? "Property Expires Today!" : `Property Expires in ${listing.daysLeft} Day(s)`,
      description: `"${listing.title || 'Untitled Property'}" will be removed if not renewed.`,
      details: listing.city ? `${listing.city}, ${listing.state}` : undefined,
      time: `${listing.daysLeft} day(s) remaining`,
      isRead: false,
      action: '/my-listings',
    }));

    const staticNotifications = [
      { id: 1, type: "new_property", icon: Home, title: "New property matches your search", description: "3BHK Apartment in Adajan, Surat", time: "2 hours ago", isRead: false },
      { id: 2, type: "price_drop", icon: TrendingDown, title: "Price dropped on saved property", description: "Luxury Bungalow in Vesu, Surat reduced by ₹15L", time: "5 hours ago", isRead: false },
      { id: 3, type: "message", icon: MessageSquare, title: "New message from property owner", description: "Regarding: Modern Apartment in Piplod, Surat", time: "1 day ago", isRead: true },
      { id: 4, type: "saved", icon: Heart, title: "Property you viewed was saved by 15 others", description: "Premium Penthouse in Athwa, Surat", time: "2 days ago", isRead: true },
      { id: 5, type: "reminder", icon: Clock, title: "Site visit reminder", description: "Tomorrow at 11:00 AM - Independent House in Vesu", time: "2 days ago", isRead: true },
    ];

    setAllNotifications([...brokerNotifications, ...expiryNotifications, ...rentNotifications, ...staticNotifications]);
  }, [getDueRentals, brokerNotifications]);

  const markAllRead = async () => {
    // Mark broker notifications as read in DB
    const unreadDbIds = brokerNotifications.filter(n => !n.isRead).map(n => n.dbId);
    if (unreadDbIds.length > 0) {
      for (const id of unreadDbIds) {
        await supabase.from('broker_notifications' as any).update({ is_read: true } as any).eq('id', id);
      }
      setBrokerNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
    setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string, dbId?: string) => {
    if (dbId) {
      await supabase.from('broker_notifications' as any).delete().eq('id', dbId);
      setBrokerNotifications(prev => prev.filter(n => n.dbId !== dbId));
    }
    setAllNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "new_property": return "text-primary";
      case "price_drop": return "text-green-500";
      case "message": return "text-blue-500";
      case "saved": return "text-red-500";
      case "reminder": return "text-orange-500";
      case "rent_due": return "text-orange-600 dark:text-orange-400";
      case "expiry_warning": return "text-destructive";
      case "inquiry": return "text-emerald-500";
      case "requirement": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-primary">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        </div>

        <div className="space-y-3">
          {allNotifications.map((notification, index) => (
            <div key={notification.id}>
              <Card
                className={`${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''} ${notification.action ? 'cursor-pointer' : ''}`}
                onClick={() => notification.action && navigate(notification.action)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getIconColor(notification.type)}`}>
                      <notification.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-1">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                          {notification.details && (
                            <p className="text-xs text-muted-foreground mb-2">{notification.details}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id, notification.dbId); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {index < allNotifications.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
        </div>

        {allNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
