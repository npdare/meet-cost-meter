import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load the History page for better performance
const History = lazy(() => import("./pages/History"));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback"));
const PremiumFeatures = lazy(() => import("./pages/PremiumFeatures"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/history" 
              element={
                <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
                  <History />
                </Suspense>
              } 
            />
            <Route 
              path="/admin/feedback" 
              element={
                <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
                  <AdminFeedback />
                </Suspense>
              } 
            />
            <Route 
              path="/premium" 
              element={
                <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
                  <PremiumFeatures />
                </Suspense>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
