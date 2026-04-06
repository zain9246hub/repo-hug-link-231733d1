import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import MobileLayout from "./components/MobileLayout";
import ScrollProgress from "./components/ScrollProgress";
import ScrollToTop from "./components/ScrollToTop";

const Index = lazy(() => import("./pages/Index"));

// Lazy load all non-critical routes
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
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const Requirements = lazy(() => import("./pages/Requirements"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Help = lazy(() => import("./pages/Help"));
const NomadMap = lazy(() => import("./components/NomadMap"));
const LocationSearch = lazy(() => import("./pages/LocationSearch"));
const RentTracker = lazy(() => import("./pages/RentTracker"));
const MyListings = lazy(() => import("./pages/MyListings"));
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

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollProgress />
          <ScrollToTop />
          <MobileLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/requirements" element={<Requirements />} />
                <Route path="/list-property" element={<PropertyListingForm />} />
                <Route path="/list-rental" element={<ListRental />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/compare" element={<PropertyComparison properties={[]} onRemove={() => {}} onClearAll={() => {}} />} />
                <Route path="/locality/:name" element={<LocalityGuide />} />
                <Route path="/emi-calculator" element={<EMICalculatorPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/premium-plans" element={<PremiumListingCard title="Sample Property" onUpgrade={() => {}} />} />
                <Route path="/saved" element={<div className="p-4"><h1 className="text-2xl font-bold">Saved Properties</h1><p className="text-muted-foreground mt-2">Your saved properties will appear here.</p></div>} />
                <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminRoute><Admin /></AdminRoute></Suspense>} />
                <Route path="/admin/add-property" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminPropertyListing /></AdminRoute></Suspense>} />
                <Route path="/property-invites" element={<PropertyInvites />} />
                <Route path="/customer-portal" element={<CustomerPortal />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/help" element={<Help />} />
                <Route path="/nomad-map" element={<NomadMap />} />
                <Route path="/location-search" element={<LocationSearch />} />
                <Route path="/rent-tracker" element={<RentTracker />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/advertise" element={<AdvertiseWithUs />} />
                <Route path="/brokers" element={<Brokers />} />
                <Route path="/broker/:id" element={<BrokerProfile />} />
                <Route path="/broker-dashboard" element={<BrokerDashboard />} />
                <Route path="/broker-onboarding" element={<BrokerOnboarding />} />
                <Route path="/broker-subscription" element={<BrokerSubscription />} />
                <Route path="/builder-dashboard" element={<BuilderDashboard />} />
                <Route path="/builder-leads" element={<BuilderLeads />} />
                <Route path="/broker-clients" element={<BrokerClients />} />
                <Route path="/broker-leads" element={<BrokerLeads />} />
                <Route path="/builder-list-project" element={<BuilderProjectListing />} />
                <Route path="/builder-projects" element={<BuilderProjects />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/terms" element={<Terms />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </MobileLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
