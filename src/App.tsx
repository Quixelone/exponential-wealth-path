import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";

// Lazy load all page components for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const WebLanding = lazy(() => import("./pages/WebLanding"));
const Strategies = lazy(() => import("./pages/Strategies"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Settings = lazy(() => import("./pages/Settings"));
const AISignals = lazy(() => import("./pages/AISignals"));
const CoachAI = lazy(() => import("./pages/CoachAI"));
const Education = lazy(() => import("./pages/Education"));
const EducationDashboard = lazy(() => import("./pages/EducationDashboard"));
const EducationLeaderboard = lazy(() => import("./pages/EducationLeaderboard"));
const TradingSimulator = lazy(() => import("./pages/TradingSimulator"));
const CourseViewer = lazy(() => import("./pages/CourseViewer"));
const WheelStrategy = lazy(() => import("./pages/WheelStrategy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">Caricamento...</p>
    </div>
  </div>
);

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system">
            <TooltipProvider>
              <AuthProvider>
                <BrowserRouter>
                  <Toaster />
                  <Sonner />
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<WebLanding />} />
                        <Route path="/app" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/strategies" element={<Strategies />} />
                        <Route path="/user-management" element={<UserManagement />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/ai-signals" element={<AISignals />} />
                        <Route path="/coach-ai" element={<CoachAI />} />
                        <Route path="/education" element={<Education />} />
                        <Route path="/education/dashboard" element={<EducationDashboard />} />
                        <Route path="/education/leaderboard" element={<EducationLeaderboard />} />
                        <Route path="/education/simulation" element={<TradingSimulator />} />
                        <Route path="/education/course/:courseId" element={<CourseViewer />} />
                        <Route path="/wheel-strategy" element={<WheelStrategy />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </BrowserRouter>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
