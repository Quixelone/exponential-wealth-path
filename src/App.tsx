import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ConfigurationsPage from "./pages/ConfigurationsPage";
import ChartsPage from "./pages/ChartsPage";
import HistoryPage from "./pages/HistoryPage";
import RemindersPage from "./pages/RemindersPage";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter> 
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="charts" element={<ChartsPage />} /> 
              <Route path="history" element={<HistoryPage />} /> 
              <Route path="configurations" element={<ConfigurationsPage />} /> 
              <Route path="reminders" element={<RemindersPage />} /> 
              <Route path="settings" element={<Settings />} /> 
              <Route path="user-management" element={<UserManagement />} /> 
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;