import { Search, ArrowRight, Sparkles, TrendingUp, Zap, ChevronRight, Mail, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import Carousel3D from "@/components/Carousel3D";
import WhyKnowva from "@/components/WhyKnowva";
import { categories } from "@/data/mockData";
import discoveryhub from "@/assets/discoveryhub.png";
import bannerimg from "@/assets/bannerimg.jpg";
import herosection from "@/assets/herosection.mp4";
import recentlyadded from "@/assets/recentlyadded.mp4";
import browservideo from "@/assets/browservideo.mp4";
import topaitool from "@/assets/topaitool.png";
import stayahead from "@/assets/stayahead.jpg";
import categoriehomepage from "@/assets/categoriehomepage.jpg";
import compareaitools from "@/assets/compareaitools.jpg";
import browsericon from "@/assets/browsericon.png";
import compareicon from "@/assets/compareicon.png";
import deployicon from "@/assets/deployicon.png";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";
import { useState, useEffect } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Index = () => {
  const navigate = useNavigate();
  const [dbTools, setDbTools] = useState<any[]>([]);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS);
      const result = await response.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        // Map DB fields to what components expect
        const formattedTools = result.data
          .filter((t: any) => t.name && t.name.trim() !== "")
          .map((tool: any) => ({
            ...tool,
            // Pass the raw icon_url string; components will render it as an <img> or initial letter
            icon: (() => {
              let url = tool.icon_url || "";
              // Handle double-stringified array ["url"]
              if (url.startsWith('[') && url.endsWith(']')) {
                try { const parsed = JSON.parse(url); if (Array.isArray(parsed)) url = parsed[0]; } catch { }
              }
              if (!url) return tool.name ? tool.name.charAt(0) : '?';
              return url.startsWith('http')
                ? url
                : `${API_BASE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;
            })(),
            rating: parseFloat(tool.rating) || 0,
          }));
        setDbTools(formattedTools);
      }
    } catch (error) {
      console.error("Failed to fetch tools", error);
    }
  };

  // All tools come from DB — no dummy data
  const allTrendingTools = dbTools;
  // Only the 5 most recently added tools appear in the Recently Added carousel
  const allRecentTools = dbTools.slice(0, 5);


  const checkAuth = (e: React.MouseEvent, targetPath: string) => {
    e.preventDefault();
    const user = localStorage.getItem("user");
    if (!user) {
      toast("Authentication required", {
        description: "Please log in to access this feature.",
      });
      navigate("/login");
      return false;
    }
    navigate(targetPath);
    return true;
  };

  const handleSearch = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast("Authentication required", {
        description: "Please log in to use the search feature.",
      });
      navigate("/login");
      return;
    }
    // Search logic would go here
    toast.info("Search feature gated successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
      <Navbar />

      {/* Premium Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center bg-[#000000B3] overflow-hidden pt-20">
        {/* Hero Video Background */}
        <video
          src={herosection}
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative section-container max-w-6xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Main Headline */}
            <motion.h1
              className="font-display text-2xl md:text-4xl font-extrabold text-white mb-7 leading-tight tracking-wide"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Find the Perfect AI
              <br />
              <span className="block bg-gradient-to-r from-[#FFB347] to-[#F39C12] bg-clip-text text-transparent font-extrabold tracking-wide">
                for Your Workflow
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="text-xl md:text-2xl text-[#AAAAAA] mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              The most comprehensive AI platform. Compare, evaluate, and deploy the best AI tools for your business in minutes, not hours.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <motion.button
                onClick={(e) => checkAuth(e, "/categories")}
                whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(255, 179, 71, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-[#FFB347] to-[#F39C12] text-white font-semibold rounded-xl transition-all duration-300 text-lg"
              >
                Explore AI Tools
              </motion.button>

              <motion.button
                onClick={(e) => checkAuth(e, "/providers")}
                whileHover={{ y: -2, borderColor: "#FFB347" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl transition-all duration-300 text-lg hover:border-[#FFB347] hover:text-[#FFB347]"
              >
                Submit AI Tool
              </motion.button>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <div className="relative rounded-2xl p-2 flex items-center">
                <Search className="w-5 h-5 text-[#AAAAAA] ml-4 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search AI tools, categories, or use cases..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#AAAAAA] py-3 px-4 text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFB347] to-[#F39C12] text-white font-medium rounded-xl mr-2 hover:shadow-lg transition-all duration-300"
                >
                  Search
                </button>
              </div>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-xs text-[#AAAAAA]">Popular:</span>
                {["ChatGPT", "Midjourney", "Cursor", "Claude"].map((term) => (
                  <button
                    key={term}
                    onClick={(e) => checkAuth(e, `/tool/${term.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="px-3 py-1 text-xs text-[#AAAAAA] bg-white/5 border border-white/10 rounded-lg hover:text-white hover:border-[#FFB347]/30 transition-all duration-300"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative py-12 overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${discoveryhub})` }}>
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative section-container max-w-6xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-[#AAAAAA] text-lg">
              Join thousands of businesses discovering the best AI tools
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { number: "2,500+", label: "AI Tools" },
              { number: "50K+", label: "Active Users" },
              { number: "98%", label: "Satisfaction" },
              { number: "24/7", label: "Support" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-[#AAAAAA] text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                role: "CTO at TechCorp",
                content: "KNOWVA helped us find the perfect AI tools for our stack. Saved us weeks of research.",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "Product Manager",
                content: "The comparison features are incredible. Made decision-making so much easier for our team.",
                rating: 5
              },
              {
                name: "Emily Watson",
                role: "Startup Founder",
                content: "Best AI discovery platform out there. The curated recommendations are spot on.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-[#f0f0f0] rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-slate-900">★</span>
                  ))}
                </div>
                <p className="text-slate-900 mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-slate-700 text-xs">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending AI Tools */}
      <section className="relative py-24 overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${topaitool})` }}>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative section-container max-w-6xl z-10">
          <motion.div {...fadeUp} className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-[#FFB347]" />
                <span className="text-sm font-medium text-[#FFB347]">Trending Now</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Top AI Tools</h2>
            </div>
            <motion.button
              onClick={(e) => checkAuth(e, "/all-tools")}
              whileHover={{ y: -2, borderColor: "#FFB347" }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-xl transition-all duration-300 hover:border-[#FFB347] hover:text-[#FFB347]"
            >
              View All <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allTrendingTools.slice(0, 12).map((tool, i) => (
              <ToolCard key={`${tool.name}-${i}`} {...tool} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Clean Categories Section */}
      <section className="relative py-24 bg-[#000000B3] overflow-hidden">
        {/* Background Video */}
        <video
          src={browservideo}
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative section-container max-w-6xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full flex flex-col items-center text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Browse Categories
            </h2>
            <p className="text-[#AAAAAA] text-lg max-w-2xl mx-auto">
              Explore AI tools organized by use case and industry
            </p>
          </motion.div>

          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bwg-white/5 backdrop-blur">
            <div className="flex gap-6 animate-scroll whitespace-nowrap">
              {categories
                .map(cat => ({
                  ...cat,
                  liveCount: dbTools.filter(t => t.category?.toLowerCase() === cat.name.toLowerCase()).length
                }))
                .filter(cat => cat.liveCount > 0)
                .map((cat, i) => (
                  <button key={cat.name} onClick={(e) => checkAuth(e, "/categories")} className="block group">
                    <div className="flex items-center gap-3 px-8 py-6 rounded-xl bg-white hover:bg-[#F9FAFB] transition-all duration-300 min-h-[96px] border border-[#f0f0f0] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        {cat.icon}
                      </div>
                      <h3 className="text-slate-900 font-medium text-sm group-hover:text-[#FFB347] transition-colors duration-300">
                        {cat.name}
                      </h3>
                      <span className="text-slate-700 text-xs text-nowrap">
                        {cat.liveCount} tool{cat.liveCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="section-container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-900 text-lg max-w-2xl mx-auto">
              Find and deploy the perfect AI tools in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Browse",
                description: "Explore our curated collection of 2,500+ AI tools across every category",
                icon: <img src={browsericon} alt="Browse" className="w-16 h-auto mx-auto mb-4" />
              },
              {
                step: "02",
                title: "Compare",
                description: "Side-by-side comparisons of features, pricing, and performance",
                icon: <img src={compareicon} alt="Compare" className="w-16 h-auto mx-auto mb-4" />
              },
              {
                step: "03",
                title: "Deploy",
                description: "Make confident decisions and integrate the best tools into your workflow",
                icon: <img src={deployicon} alt="Deploy" className="w-16 h-auto mx-auto mb-4" />
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#FFB347] to-[#F39C12] rounded-full flex items-center justify-center text-slate-900 text-xs font-bold border-2 border-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-[#FFB347] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added - Enhanced 3D Carousel */}
      <section className="relative py-24 bg-[#000000B3] overflow-hidden">
        {/* Background Video */}
        <video
          src={recentlyadded}
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative section-container max-w-6xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-[#FFB347]" />
              <span className="text-sm font-semibold text-[#FFB347] uppercase tracking-wide">Just Launched</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Recently Added
            </h2>
            <p className="text-[#AAAAAA] text-lg max-w-2xl mx-auto">
              Discover the newest AI tools added to our platform
            </p>
          </motion.div>
          {/* 3D Carousel */}
          <Carousel3D items={allRecentTools} />
        </div>
      </section>

      {/* Why KNOWva */}
      <WhyKnowva />


      {/* Newsletter */}
      <section className="relative py-24 overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${stayahead})` }}>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative section-container max-w-4xl z-10">
          <motion.div {...fadeUp} className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FFB347]/20 to-[#F39C12]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-[#FFB347]" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Ahead in AI
            </h2>
            <p className="text-[#AAAAAA] text-lg mb-10 max-w-2xl mx-auto">
              Get weekly curated AI tool launches, updates, and exclusive deals delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-[#111111] border border-white/10 rounded-xl text-white placeholder:text-[#AAAAAA] outline-none focus:border-[#FFB347]/50 text-sm"
              />
              <motion.button
                whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(255, 179, 71, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-[#FFB347] to-[#F39C12] text-white font-semibold rounded-xl transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
