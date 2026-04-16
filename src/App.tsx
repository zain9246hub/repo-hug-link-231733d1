import React, { Suspense, lazy } from "react";
// ❌ removed service worker import

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import MobileLayout from "./components/MobileLayout";
import ScrollProgress from "./components/ScrollProgress";
import ScrollToTop from "./components/ScrollToTop";

// Lazy imports
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const PropertyListingForm = lazy(() => import("./components/PropertyListingForm"));
const ListRental = lazy(() => import("./pages/ListRental"));
const PropertyDetails = lazy(() => import("./components/PropertyDetails"));
const PropertyComparison = lazy(() => import("./components/PropertyComparison"));
const LocalityGuide = lazy(() => import("./components/LocalityGuide"));
const EMICalculatorPage = lazy(() => import("./pages/EMICalculator"));
const PremiumListingCard = lazy(() => import("./components/PremiumListingCard"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AuthGuard = lazy(() => import("./components/AuthGuard"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const Requirements = lazy(() => import("./pages/Requirements"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Help = lazy(() => import("./pages/Help"));
const NomadMap = lazy(() => import("./components/NomadMap"));
const LocationSearch = lazy(() => import("./pages/LocationSearch"));
const RentTracker = lazy(() => import("./pages/RentTracker"));
const MyListings = lazy(() => import("./pages/MyListings"));
const SavedProperties = lazy(() => import("./pages/SavedProperties"));
const AdvertiseWithUs = lazy(() => import("./pages/AdvertiseWithUs"));
const Brokers = lazy(() => import("./pages/Brokers"));
const BrokerProfile = lazy(() => import("./pages/BrokerProfile"));
const BrokerDashboard = lazy(() => import("./pages/BrokerDashboard"));
const BrokerSubscription = lazy(() => import("./pages/BrokerSubscription"));
const BuilderDashboard = lazy(() => import("./pages/BuilderDashboard"));
const BuilderLeads = lazy(() => import("./pages/BuilderLeads"));
const BrokerClients = lazy(() => import("./pages/BrokerClients"));
const BrokerLeads = lazy(() => import("./pages/BrokerLeads"));
const BuilderProjectListing = lazy(() => import("./pages/BuilderProjectListing"));
const BuilderProjects = lazy(() => import("./pages/BuilderProjects"));
const AdminPropertyListing = lazy(() => import("./pages/AdminPropertyListing"));
const PropertyInvites = lazy(() => import("./pages/PropertyInvites"));
const BrokerOnboarding = lazy(() => import("./pages/BrokerOnboarding"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Terms = lazy(() => import("./pages/Terms"));

const queryClient = new QueryClient();

// Loader
const PageLoader = () => (

  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);const App = () => {
return (
<QueryClientProvider client={queryClient}>
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
<TooltipProvider>
<Toaster />
<Sonner />

      <Router>
        <ScrollProgress />
        <ScrollToTop />

        <MobileLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>

              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/locality/:name" element={<LocalityGuide />} />
              <Route path="/emi-calculator" element={<EMICalculatorPage />} />
              <Route path="/brokers" element={<Brokers />} />
              <Route path="/broker/:id" element={<BrokerProfile />} />
              <Route path="/nomad-map" element={<NomadMap />} />
              <Route path="/location-search" element={<LocationSearch />} />
              <Route path="/advertise" element={<AdvertiseWithUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<Help />} />

              <Route
                path="/compare"
                element={
                  <PropertyComparison
                    properties={[]}
                    onRemove={() => {}}
                    onClearAll={() => {}}
                  />
                }
              />

              {/* Protected */}
              <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
              <Route path="/list-property" element={<AuthGuard><PropertyListingForm /></AuthGuard>} />
              <Route path="/list-rental" element={<AuthGuard><ListRental /></AuthGuard>} />
              <Route path="/requirements" element={<AuthGuard><Requirements /></AuthGuard>} />
              <Route path="/my-listings" element={<AuthGuard><MyListings /></AuthGuard>} />
              <Route path="/saved" element={<AuthGuard><SavedProperties /></AuthGuard>} />
              <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
              <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
              <Route path="/rent-tracker" element={<AuthGuard><RentTracker /></AuthGuard>} />
              <Route path="/customer-portal" element={<AuthGuard><CustomerPortal /></AuthGuard>} />
              <Route path="/property-invites" element={<AuthGuard><PropertyInvites /></AuthGuard>} />
              <Route path="/premium-plans" element={<AuthGuard><PremiumListingCard title="Sample Property" onUpgrade={() => {}} /></AuthGuard>} />

              {/* Broker */}
              <Route path="/broker-dashboard" element={<AuthGuard><BrokerDashboard /></AuthGuard>} />
              <Route path="/broker-onboarding" element={<AuthGuard><BrokerOnboarding /></AuthGuard>} />
              <Route path="/broker-subscription" element={<AuthGuard><BrokerSubscription /></AuthGuard>} />
              <Route path="/broker-clients" element={<AuthGuard><BrokerClients /></AuthGuard>} />
              <Route path="/broker-leads" element={<AuthGuard><BrokerLeads /></AuthGuard>} />

              {/* Builder */}
              <Route path="/builder-dashboard" element={<AuthGuard><BuilderDashboard /></AuthGuard>} />
              <Route path="/builder-leads" element={<AuthGuard><BuilderLeads /></AuthGuard>} />
              <Route path="/builder-list-project" element={<AuthGuard><BuilderProjectListing /></AuthGuard>} />
              <Route path="/builder-projects" element={<AuthGuard><BuilderProjects /></AuthGuard>} />

              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/add-property" element={<AdminRoute><AdminPropertyListing /></AdminRoute>} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </Suspense>
        </MobileLayout>
      </Router>

    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>

);
};

export default App;