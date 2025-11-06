
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from '@/pages/AuthCallback';
import WebLanding from "./pages/WebLanding";
import Strategies from "./pages/Strategies";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import AISignals from "./pages/AISignals";
import AITest from "./pages/AITest";
import FinanzaPointsDemo from "./pages/FinanzaPointsDemo";
import CoachAI from "./pages/CoachAI";
import Education from "./pages/Education";
import EducationDashboard from "./pages/EducationDashboard";
import EducationLeaderboard from "./pages/EducationLeaderboard";
import TradingSimulator from "./pages/TradingSimulator";
import CourseViewer from "./pages/CourseViewer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                <Route path="/test" element={<AITest />} />
                <Route path="/finanza-points-demo" element={<FinanzaPointsDemo />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
