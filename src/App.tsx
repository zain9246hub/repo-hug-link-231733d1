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
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Index />} />
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
                <Route path="/compare" element={<PropertyComparison properties={[]} onRemove={() => {}} onClearAll={() => {}} />} />

                {/* Auth-protected routes */}
                <Route path="/profile" element={<Suspense fallback={<PageLoader />}><AuthGuard><Profile /></AuthGuard></Suspense>} />
                <Route path="/list-property" element={<Suspense fallback={<PageLoader />}><AuthGuard><PropertyListingForm /></AuthGuard></Suspense>} />
                <Route path="/list-rental" element={<Suspense fallback={<PageLoader />}><AuthGuard><ListRental /></AuthGuard></Suspense>} />
                <Route path="/requirements" element={<Suspense fallback={<PageLoader />}><AuthGuard><Requirements /></AuthGuard></Suspense>} />
                <Route path="/my-listings" element={<Suspense fallback={<PageLoader />}><AuthGuard><MyListings /></AuthGuard></Suspense>} />
                <Route path="/saved" element={<Suspense fallback={<PageLoader />}><AuthGuard><SavedProperties /></AuthGuard></Suspense>} />
                <Route path="/settings" element={<Suspense fallback={<PageLoader />}><AuthGuard><Settings /></AuthGuard></Suspense>} />
                <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><AuthGuard><Notifications /></AuthGuard></Suspense>} />
                <Route path="/rent-tracker" element={<Suspense fallback={<PageLoader />}><AuthGuard><RentTracker /></AuthGuard></Suspense>} />
                <Route path="/customer-portal" element={<Suspense fallback={<PageLoader />}><AuthGuard><CustomerPortal /></AuthGuard></Suspense>} />
                <Route path="/property-invites" element={<Suspense fallback={<PageLoader />}><AuthGuard><PropertyInvites /></AuthGuard></Suspense>} />
                <Route path="/premium-plans" element={<Suspense fallback={<PageLoader />}><AuthGuard><PremiumListingCard title="Sample Property" onUpgrade={() => {}} /></AuthGuard></Suspense>} />

                {/* Broker-specific routes */}
                <Route path="/broker-dashboard" element={<Suspense fallback={<PageLoader />}><AuthGuard><BrokerDashboard /></AuthGuard></Suspense>} />
                <Route path="/broker-onboarding" element={<Suspense fallback={<PageLoader />}><AuthGuard><BrokerOnboarding /></AuthGuard></Suspense>} />
                <Route path="/broker-subscription" element={<Suspense fallback={<PageLoader />}><AuthGuard><BrokerSubscription /></AuthGuard></Suspense>} />
                <Route path="/broker-clients" element={<Suspense fallback={<PageLoader />}><AuthGuard><BrokerClients /></AuthGuard></Suspense>} />
                <Route path="/broker-leads" element={<Suspense fallback={<PageLoader />}><AuthGuard><BrokerLeads /></AuthGuard></Suspense>} />

                {/* Builder-specific routes */}
                <Route path="/builder-dashboard" element={<Suspense fallback={<PageLoader />}><AuthGuard><BuilderDashboard /></AuthGuard></Suspense>} />
                <Route path="/builder-leads" element={<Suspense fallback={<PageLoader />}><AuthGuard><BuilderLeads /></AuthGuard></Suspense>} />
                <Route path="/builder-list-project" element={<Suspense fallback={<PageLoader />}><AuthGuard><BuilderProjectListing /></AuthGuard></Suspense>} />
                <Route path="/builder-projects" element={<Suspense fallback={<PageLoader />}><AuthGuard><BuilderProjects /></AuthGuard></Suspense>} />

                {/* Admin routes */}
                <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminRoute><Admin /></AdminRoute></Suspense>} />
                <Route path="/admin/add-property" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminPropertyListing /></AdminRoute></Suspense>} />

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
