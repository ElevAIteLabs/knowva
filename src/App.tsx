import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ToolDetail from "./pages/ToolDetail";
import Compare from "./pages/Compare";
import Newsletter from "./pages/Newsletter";
import Consulting from "./pages/Consulting";
import Providers from "./pages/Providers";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import AllTools from "./pages/AllTools";
import Forum from "./pages/Forum";
import ThreadDetail from "./pages/ThreadDetail";
import NotFound from "./pages/NotFound";

import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<AllTools />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/tool/:slug" element={<ToolDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/consulting" element={<Consulting />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/all-tools" element={<AllTools />} />
          <Route path="/community" element={<Forum />} />
          <Route path="/community/:id" element={<ThreadDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
