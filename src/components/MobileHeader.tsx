import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Surat Propertys';
      case '/search': return 'Search';
      case '/requirements': return 'Requirements';
      case '/compare': return 'Compare';
      case '/emi-calculator': return 'EMI Calculator';
      case '/admin': return 'Admin Dashboard';
      case '/brokers': return 'Brokers';
      case '/profile': return 'Profile';
      case '/settings': return 'Settings';
      case '/notifications': return 'Notifications';
      case '/help': return 'Help';
      case '/my-listings': return 'My Listings';
      case '/rent-tracker': return 'Rent Tracker';
      case '/advertise': return 'Advertise';
      case '/broker-dashboard': return 'Dashboard';
      case '/builder-dashboard': return 'Dashboard';
      default:
        if (location.pathname.includes('/property/')) return 'Property Details';
        if (location.pathname.includes('/locality/')) return 'Locality Guide';
        if (location.pathname.includes('/broker/')) return 'Broker Profile';
        return 'Surat Propertys';
    }
  };

  const isHome = location.pathname === '/';

  return (
    <header className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl bg-background/80 shadow-sm safe-area-top">
      <div className="flex items-center justify-between px-4 h-14 max-w-screen-xl mx-auto">
        {/* Left: Logo/Title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">SP</span>
          </div>
          <div className="min-w-0">
            <span className={`font-bold text-foreground truncate block ${isHome ? 'text-base' : 'text-sm'}`}>
              {getPageTitle()}
            </span>
            {isHome && (
              <span className="text-[10px] text-muted-foreground leading-none">Find your dream property</span>
            )}
          </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-9 h-9 rounded-xl hover:bg-accent"
            onClick={() => navigate('/search')}
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-9 h-9 rounded-xl hover:bg-accent"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-[18px] w-[18px]" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-9 h-9 rounded-xl hover:bg-accent"
            onClick={() => navigate('/profile')}
          >
            <User className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
