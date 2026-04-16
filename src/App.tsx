import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import MobileLayout from "./components/MobileLayout";

// Lazy imports
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DebugEnv = lazy(() => import("./pages/DebugEnv"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export default function App() {
  console.log("ENV URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("ENV KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <Router>
            <MobileLayout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/debug" element={<DebugEnv />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </MobileLayout>
          </Router>

        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}