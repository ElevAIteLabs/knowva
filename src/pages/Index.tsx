import { Search, ArrowRight, Sparkles, TrendingUp, Zap, ChevronRight, Mail, Star, Code, Cpu, Layout, Globe, Activity, Layers, ShieldCheck, Zap as Fast } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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
import { useState, useEffect, useRef } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const Index = () => {
  const navigate = useNavigate();
  const [dbTools, setDbTools] = useState<any[]>([]);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const yElement = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityElement = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS);
      const result = await response.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        const formattedTools = result.data
          .filter((t: any) => t.name && t.name.trim() !== "")
          .map((tool: any) => ({
            ...tool,
            icon: (() => {
              let url = tool.icon_url || "";
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

  const allTrendingTools = dbTools;
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
    toast.info("Search feature gated successfully!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30" ref={containerRef}>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .glass-panel {
          background: rgba(var(--background), 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(128, 128, 128, 0.15);
        }
        .gradient-text {
          background: linear-gradient(to right, #FFB347, #F39C12);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glow-effect {
          box-shadow: 0 0 40px -10px rgba(255, 179, 71, 0.4);
        }
      `}</style>
      <Navbar />

      {/* ────────────────────────────────────────────────────────────────────────
          HERO SECTION (Ultra Premium)
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <video
            src={herosection}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover dark:opacity-40 opacity-20 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background dark:from-background/60 dark:via-background/90 dark:to-background backdrop-blur-[2px]" />
          {/* Subtle Ambient Light Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 dark:opacity-30" />
          <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-orange-600/20 rounded-full blur-[100px] mix-blend-screen opacity-50 dark:opacity-30" />
        </div>

        <motion.div 
          style={{ y: yElement, opacity: opacityElement }}
          className="relative z-10 section-container max-w-7xl mx-auto text-center px-6 mt-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold tracking-wide text-foreground">The AI Discovery Engine</span>
          </motion.div>

          <motion.h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tighter text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Find The Perfect AI.
            <br />
            <span className="gradient-text glow-effect drop-shadow-sm">
              Ship Faster.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Discover, evaluate, and deploy top-tier AI models and tools. Cut through the noise and integrate the future into your workflow today.
          </motion.p>

          <motion.div
            className="max-w-2xl mx-auto relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Search Glow effect behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            
            <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:bg-card">
              <Search className="w-6 h-6 text-muted-foreground ml-4" />
              <input
                type="text"
                placeholder="Search AI tools (e.g., ChatGPT, Midjourney)..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground py-3 px-4 text-base md:text-lg"
              />
              <button
                onClick={handleSearch}
                className="px-6 md:px-8 py-3 bg-foreground text-background font-semibold rounded-xl ml-2 hover:scale-[1.02] transition-transform duration-300 shadow-md flex items-center gap-2"
              >
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fast Search:</span>
              {["ChatGPT", "Midjourney", "Cursor", "Claude"].map((term) => (
                <button
                  key={term}
                  onClick={(e) => checkAuth(e, `/tool/${term.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="px-3 py-1 text-xs font-medium text-foreground bg-secondary/50 border border-border rounded-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          STATS & TRUST SECTION (Glassmorphism)
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden bg-background border-y border-border">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative section-container max-w-7xl">
          <motion.div
            {...fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Trusted by Innovators Worldwide
            </h2>
            <p className="text-muted-foreground">Empowering modern teams to build the future.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-20">
            {[
              { number: "2,500+", label: "Curated AI Tools", icon: <Layers className="text-primary w-6 h-6 mb-3" /> },
              { number: "50K+", label: "Active Builders", icon: <Activity className="text-primary w-6 h-6 mb-3" /> },
              { number: "98%", label: "Satisfaction", icon: <ShieldCheck className="text-primary w-6 h-6 mb-3" /> },
              { number: "24/7", label: "Expert Support", icon: <Globe className="text-primary w-6 h-6 mb-3" /> }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center justify-center p-8 bg-card/40 border border-border backdrop-blur-sm rounded-3xl hover:bg-card/60 transition-colors"
              >
                {stat.icon}
                <div className="text-4xl md:text-5xl font-black text-foreground mb-2 font-display tracking-tight">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          CATEGORIES MARQUEE SECTION
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-secondary/20">
        <div className="section-container max-w-7xl z-10 mb-12">
          <motion.div className="text-center" {...fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Navigate tools optimized for your specific industry use cases.
            </p>
          </motion.div>
        </div>

        {/* Infinite Scroll Marquee */}
        <div className="relative w-full overflow-hidden flex flex-col gap-6">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex gap-4 animate-scroll whitespace-nowrap px-4 hover:[animation-play-state:paused] cursor-pointer w-max">
            {categories.map((cat, i) => {
              const count = dbTools.filter(t => t.category?.toLowerCase() === cat.name.toLowerCase()).length;
              if (count === 0 && i > 8) return null; // Show at least some even if zero for visual flair
              return (
                <button key={`cat1-${i}`} onClick={(e) => checkAuth(e, "/categories")} className="group outline-none">
                  <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,179,71,0.1)] transition-all duration-300 min-w-[200px]">
                    <div className="text-2xl w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                      {cat.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-foreground font-bold text-base group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-muted-foreground text-xs font-medium">
                        {count || Math.floor(Math.random() * 50) + 10} tools available
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
             {/* Duplicate for seamless infinite loop */}
             {categories.map((cat, i) => {
              const count = dbTools.filter(t => t.category?.toLowerCase() === cat.name.toLowerCase()).length;
              if (count === 0 && i > 8) return null;
              return (
                <button key={`cat2-${i}`} onClick={(e) => checkAuth(e, "/categories")} className="group outline-none">
                  <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,179,71,0.1)] transition-all duration-300 min-w-[200px]">
                    <div className="text-2xl w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                      {cat.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-foreground font-bold text-base group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-muted-foreground text-xs font-medium">
                        {count || Math.floor(Math.random() * 50) + 10} tools available
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          HOW IT WORKS (Modern Grid)
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-32 bg-background relative border-y border-border">
        <div className="section-container max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-20">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm font-semibold mb-6">
                <Fast className="w-4 h-4 text-primary" /> Simplified Process
             </div>
            <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
              Speed Up Your Workflow.
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              We handle the brutal research so you can focus entirely on shipping great products.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent z-0" />
            
            {[
              {
                step: "01",
                title: "Discover",
                description: "Search our massive database. Filter by pricing, features, capabilities, and more.",
                icon: <Search className="w-8 h-8 text-primary" />
              },
              {
                step: "02",
                title: "Compare",
                description: "View tools side-by-side. Read real reviews, pros, cons, and analyze pricing tiers.",
                icon: <Layers className="w-8 h-8 text-primary" />
              },
              {
                step: "03",
                title: "Integrate",
                description: "Pick the winner and implement it. Save days of research and make data-driven decisions.",
                icon: <Code className="w-8 h-8 text-primary" />
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-24 h-24 rounded-full bg-secondary border-4 border-background flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background text-sm font-bold shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 font-display">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          TRENDING TOOLS (Premium Grid)
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative py-32 bg-secondary/10">
        <div className="relative section-container max-w-7xl z-10">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                <TrendingUp className="w-4 h-4" /> Trending Globally
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Top AI Innovators
              </h2>
            </div>
            <motion.button
              onClick={(e) => checkAuth(e, "/all-tools")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-foreground hover:text-background transition-all duration-300 w-full md:w-auto"
            >
              Explore Collection <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allTrendingTools.slice(0, 8).map((tool, i) => (
              <ToolCard key={`${tool.name}-${i}`} {...tool} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          RECENTLY ADDED 3D CAROUSEL SECTION
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden bg-background">
         {/* Deep dark gradient overlay specific for this 3D section */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent pointer-events-none" />

        <div className="relative section-container max-w-7xl z-10">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
              Fresh Off The Press
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Interact with the latest groundbreaking AI tools added to the platform.
            </p>
          </motion.div>
          {/* 3D Carousel */}
          <div className="px-4">
            <Carousel3D items={allRecentTools} />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          WHY KNOWVA & NEWSLETTER
      ──────────────────────────────────────────────────────────────────────── */}
      <WhyKnowva />

      <section className="relative py-32 overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${stayahead})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }} />
        
        <div className="relative section-container max-w-4xl z-10 text-center">
          <motion.div {...fadeUp}>
            <div className="w-20 h-20 bg-background rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3">
               <Mail className="w-10 h-10 text-foreground" />
             </div>
            <h2 className="font-display text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Don't Fall Behind.
            </h2>
            <p className="text-background/80 text-xl mb-12 max-w-2xl mx-auto font-light">
              Join 50,000+ engineers, product managers, and founders receiving weekly insights on cutting-edge AI developments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-background/10 p-2 rounded-2xl backdrop-blur-md border border-background/20">
              <input
                type="email"
                placeholder="developer@company.com"
                className="flex-1 px-6 py-4 bg-transparent text-background placeholder:text-background/50 outline-none text-lg font-medium"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/50 text-lg"
              >
                Join Newsletter
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
