import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export const useUnreadNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    const fetchCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      // Also check broker notifications
      const { data: broker } = await supabase
        .from('brokers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let brokerCount = 0;
      if (broker) {
        const { count: bc } = await supabase
          .from('broker_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('broker_id', broker.id)
          .eq('is_read', false);
        brokerCount = bc || 0;
      }

      setUnreadCount((count || 0) + brokerCount);
    };

    fetchCount();

    // Listen for new notifications in realtime
    const channel = supabase
      .channel(`unread-count-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => { fetchCount(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return unreadCount;
};
