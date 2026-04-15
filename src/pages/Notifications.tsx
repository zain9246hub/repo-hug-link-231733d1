import { Bell, Home, Heart, TrendingDown, MessageSquare, Clock, IndianRupee, AlertTriangle, UserCheck, Trash2, ClipboardList, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRentals } from "@/hooks/use-rentals";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const iconMap: Record<string, any> = {
  new_property: Home,
  price_drop: TrendingDown,
  message: MessageSquare,
  saved: Heart,
  reminder: Clock,
  rent_due: IndianRupee,
  expiry_warning: AlertTriangle,
  inquiry: UserCheck,
  requirement: ClipboardList,
  general: Bell,
};

const Notifications = () => {
  const { getDueRentals } = useRentals();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [dbNotifications, setDbNotifications] = useState<any[]>([]);
  const [brokerNotifications, setBrokerNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user notifications from database
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setDbNotifications(data.map((n: any) => ({
          id: `notif-${n.id}`,
          dbId: n.id,
          dbTable: 'notifications',
          type: n.type,
          icon: iconMap[n.type] || Bell,
          title: n.title,
          description: n.description,
          time: timeAgo(n.created_at),
          isRead: n.is_read,
          action: n.metadata?.action || null,
        })));
      }
      setLoading(false);
    };

    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as any;
        setDbNotifications(prev => [{
          id: `notif-${n.id}`,
          dbId: n.id,
          dbTable: 'notifications',
          type: n.type,
          icon: iconMap[n.type] || Bell,
          title: n.title,
          description: n.description,
          time: 'Just now',
          isRead: false,
          action: n.metadata?.action || null,
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Fetch broker notifications
  useEffect(() => {
    if (!user) return;

    const fetchBrokerNotifications = async () => {
      const { data: broker } = await supabase.from('brokers').select('id').eq('user_id', user.id).single();
      if (!broker) return;

      const { data } = await supabase
        .from('broker_notifications')
        .select('*')
        .eq('broker_id', broker.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setBrokerNotifications(data.map((n: any) => ({
          id: `broker-${n.id}`,
          dbId: n.id,
          dbTable: 'broker_notifications',
          type: n.type === 'requirement' ? 'requirement' : 'inquiry',
          icon: n.type === 'requirement' ? ClipboardList : UserCheck,
          title: n.title,
          description: n.message,
          time: timeAgo(n.created_at),
          isRead: n.is_read,
          action: '/broker-leads',
        })));
      }
    };

    fetchBrokerNotifications();
  }, [user?.id]);

  // Combine all notifications
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
        time: daysUntilDue < 0 ? `Overdue by ${Math.abs(daysUntilDue)} day(s)` : `Due: ${new Date(rental.dueDate).toLocaleDateString('en-IN')}`,
        isRead: false,
        action: '/rent-tracker',
      };
    });

    setAllNotifications([...brokerNotifications, ...dbNotifications, ...rentNotifications]);
  }, [getDueRentals, brokerNotifications, dbNotifications]);

  const markAllRead = async () => {
    // Mark broker notifications
    const unreadBroker = brokerNotifications.filter(n => !n.isRead);
    for (const n of unreadBroker) {
      await supabase.from('broker_notifications').update({ is_read: true } as any).eq('id', n.dbId);
    }
    setBrokerNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    // Mark user notifications
    const unreadNotifs = dbNotifications.filter(n => !n.isRead);
    for (const n of unreadNotifs) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.dbId);
    }
    setDbNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string, dbId?: string, dbTable?: string) => {
    if (dbId && dbTable === 'broker_notifications') {
      await supabase.from('broker_notifications').delete().eq('id', dbId);
      setBrokerNotifications(prev => prev.filter(n => n.dbId !== dbId));
    } else if (dbId && dbTable === 'notifications') {
      await supabase.from('notifications').delete().eq('id', dbId);
      setDbNotifications(prev => prev.filter(n => n.dbId !== dbId));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {allNotifications.map((notification, index) => {
            const IconComponent = notification.icon || Bell;
            return (
              <div key={notification.id}>
                <Card
                  className={`${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''} ${notification.action ? 'cursor-pointer' : ''}`}
                  onClick={() => notification.action && navigate(notification.action)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getIconColor(notification.type)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-foreground mb-1">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                            {notification.dbId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id, notification.dbId, notification.dbTable); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < allNotifications.length - 1 && <Separator className="my-3" />}
              </div>
            );
          })}
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
