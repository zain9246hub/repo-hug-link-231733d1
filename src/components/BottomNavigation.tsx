import { Home, User, Plus, MessageCircle, FileText, Users, BarChart3, Briefcase, HardHat } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect, lazy, Suspense } from "react";
const FullScreenMap = lazy(() => import("./FullScreenMap"));
import { supabase } from "@/integrations/supabase/client";

interface BottomNavigationProps {
  onChatOpen: () => void;
}

const BottomNavigation = ({ onChatOpen }: BottomNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city: string; address: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const fetchRole = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();
      if (!cancelled) setUserRole(profile?.user_type || 'owner');
    };

    const setupChannel = (userId: string) => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      channel = supabase
        .channel(`bottomnav-role-${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        }, (payload: any) => {
          if (payload.new?.user_type) {
            setUserRole(payload.new.user_type);
          }
        })
        .subscribe();
    };

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user) {
        await fetchRole(user.id);
        if (!cancelled) setupChannel(user.id);
      } else {
        setUserRole(null);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        fetchRole(session.user.id);
        setupChannel(session.user.id);
      } else {
        setUserRole(null);
        if (channel) { supabase.removeChannel(channel); channel = null; }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const isBrokerOrBuilder = userRole === "broker" || userRole === "builder";

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/", active: location.pathname === "/" },
    { id: "chat", icon: MessageCircle, label: "Chat", path: "", active: false, isChat: true },
    { id: "post", icon: Plus, label: "Post", path: "/list-property", active: location.pathname === "/list-property" || location.pathname === "/list-rental", isCenter: true },
    ...(isBrokerOrBuilder
      ? [{ id: "analytics", icon: BarChart3, label: "Analytics", path: userRole === "builder" ? "/builder-dashboard" : "/broker-dashboard", active: location.pathname === "/broker-dashboard" || location.pathname === "/builder-dashboard" }]
      : [{ id: "requirements", icon: FileText, label: "Needs", path: "/requirements", active: location.pathname === "/requirements" }]
    ),
    { id: "brokers", icon: Users, label: "Brokers", path: "/brokers", active: location.pathname === "/brokers" }
  ];

  const roleBadge = userRole && userRole !== "owner" ? (
    <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground">
      {userRole === "broker" ? <Briefcase className="h-2.5 w-2.5" /> : <HardHat className="h-2.5 w-2.5" />}
    </div>
  ) : null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-background/90 border-t border-border/50 z-50 safe-area-bottom shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-screen-sm mx-auto">
          {navItems.map((item) => {
            const isCenter = 'isCenter' in item && item.isCenter;
            const isChat = 'isChat' in item && item.isChat;

            if (isCenter) {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center w-12 h-12 bg-gradient-primary text-primary-foreground rounded-2xl shadow-lg active:scale-95 transition-transform mx-1">
                      <Plus className="h-5 w-5" />
                      <span className="text-[10px] font-medium leading-none mt-0.5">Post</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="mb-2 bg-background border border-border shadow-lg z-50">
                    <DropdownMenuItem onClick={() => navigate("/list-property")}>List Property for Sale</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/list-rental")}>List Property for Rent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/list-rental?heavy-deposit=true")}>List Heavy Deposit Property</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <button
                key={item.id}
                className={`flex flex-col items-center justify-center h-12 flex-1 rounded-xl transition-colors ${
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                }`}
                onClick={() => {
                  if (isChat) {
                    onChatOpen();
                  } else {
                    navigate(item.path);
                  }
                }}
              >
                <div className="relative">
                  <item.icon className={`h-5 w-5 ${item.active ? 'text-primary' : ''}`} />
                  {item.id === "home" && roleBadge}
                </div>
                <span className={`text-[10px] leading-none mt-1 ${item.active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {item.active && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Suspense fallback={null}>
        <FullScreenMap
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          userLocation={userLocation}
        />
      </Suspense>
    </>
  );
};

export default BottomNavigation;