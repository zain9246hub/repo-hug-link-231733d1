const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => {
  return (
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

                  {/* IMPORTANT for OAuth */}
                  <Route path="*" element={<NotFound />} />

                </Routes>
              </Suspense>
            </MobileLayout>
          </BrowserRouter>

        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;