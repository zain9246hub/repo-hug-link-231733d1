import { ReactNode, useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import MobileHeader from "./MobileHeader";
import BottomNavigation from "./BottomNavigation";
import Footer from "./Footer";
const LocationChat = lazy(() => import("./LocationChat"));

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const hideBottomNav = ['/property/', '/list-property'].some(route => 
    location.pathname.includes(route)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      <MobileHeader />
      
      <main className={`flex-1 w-full ${!hideBottomNav ? 'pb-[68px]' : ''} overflow-x-hidden`}>
        {children}
        <Footer />
      </main>
      
      {!hideBottomNav && <BottomNavigation onChatOpen={() => setIsChatOpen(true)} />}
      
      <Suspense fallback={null}>
        <LocationChat 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />
      </Suspense>
    </div>
  );
};

export default MobileLayout;
