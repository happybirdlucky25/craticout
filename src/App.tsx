import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { RouteErrorBoundary } from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import BillDetail from "./pages/BillDetail";
import Reports from "./pages/Reports";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Legislators from "./pages/Legislators";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
            <Route path="/" element={<RouteErrorBoundary><Dashboard /></RouteErrorBoundary>} />
            <Route path="/search" element={<RouteErrorBoundary><Search /></RouteErrorBoundary>} />
            <Route path="/bills/:id" element={<RouteErrorBoundary><BillDetail /></RouteErrorBoundary>} />
            <Route path="/reports" element={<RouteErrorBoundary><Reports /></RouteErrorBoundary>} />
            <Route path="/campaigns" element={<RouteErrorBoundary><Campaigns /></RouteErrorBoundary>} />
            <Route path="/campaigns/:id" element={<RouteErrorBoundary><CampaignDetail /></RouteErrorBoundary>} />
            <Route path="/legislators" element={<RouteErrorBoundary><Legislators /></RouteErrorBoundary>} />
            <Route path="/alerts" element={<RouteErrorBoundary><Alerts /></RouteErrorBoundary>} />
            <Route path="/profile" element={<RouteErrorBoundary><Profile /></RouteErrorBoundary>} />
            <Route path="/help" element={<RouteErrorBoundary><Help /></RouteErrorBoundary>} />
            <Route path="/admin" element={<RouteErrorBoundary><Admin /></RouteErrorBoundary>} />
            <Route path="/login" element={<RouteErrorBoundary><Login /></RouteErrorBoundary>} />
            <Route path="/about" element={<RouteErrorBoundary><About /></RouteErrorBoundary>} />
            <Route path="/contact" element={<RouteErrorBoundary><Contact /></RouteErrorBoundary>} />
            <Route path="/privacy" element={<RouteErrorBoundary><Privacy /></RouteErrorBoundary>} />
            <Route path="/terms" element={<RouteErrorBoundary><Terms /></RouteErrorBoundary>} />
            <Route path="*" element={<RouteErrorBoundary><NotFound /></RouteErrorBoundary>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
