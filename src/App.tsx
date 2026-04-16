import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollProgress from "./components/ScrollProgress";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

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

            <Suspense fallback={<PageLoader />}>
              
              {/* ✅ STEP 1 DEBUG ROUTE */}
              <Routes>
                <Route
                  path="/"
                  element={
                    <div style={{ padding: 20 }}>
                      <h1 style={{ color: "black" }}>App Working ✅</h1>
                    </div>
                  }
                />
              </Routes>

            </Suspense>
          </BrowserRouter>

        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;