import { useState, useEffect } from "react";
import { Search, ChevronRight, Loader2, Sparkles, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { categories } from "@/data/mockData";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";
import categoriehomepage from "@/assets/categoriehomepage.jpg";
import AIToolCategoriesBackground from "@/assets/AIToolCategoriesBackground.jpg";

const pricingFilters = ["All", "Free", "Premium", "Paid"];

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPricing, setSelectedPricing] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dbTools, setDbTools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDbTools();
  }, []);

  const fetchDbTools = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS);
      const result = await response.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        const formatted = result.data
          .filter((t: any) => t.name && t.name.trim() !== "")
          .map((tool: any) => ({
            name: tool.name,
            description: tool.description,
            category: tool.category,
            pricing: tool.pricing,
            rating: parseFloat(tool.rating) || 0,
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
          }));
        setDbTools(formatted);
      }
    } catch (e) {
      console.error("Failed to fetch tools", e);
    } finally {
      setIsLoading(false);
    }
  };

  const allTools = dbTools;

  const filteredTools = allTools.filter((t) => {
    const matchesCat =
      selectedCategory === "All" ||
      t.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPrice =
      selectedPricing === "All" || t.pricing === selectedPricing;
    const matchesSearch =
      searchQuery.trim() === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesPrice && matchesSearch;
  });

  const isFiltering =
    selectedCategory !== "All" ||
    selectedPricing !== "All" ||
    searchQuery.trim() !== "";

  const dynamicCategories = [
    ...categories,
    ...Array.from(new Set(allTools.map(t => t.category)))
      .filter(catName => catName && !categories.find(c => c.name.toLowerCase() === catName.toLowerCase()))
      .map(catName => ({
        name: catName,
        icon: "✨",
        count: 0
      }))
  ];

  const categoryToolCounts = dynamicCategories.map((cat) => ({
    ...cat,
    liveCount: allTools.filter(
      (t) => t.category?.toLowerCase() === cat.name.toLowerCase()
    ).length,
  })).filter(cat => cat.liveCount > 0 || categories.find(c => c.name === cat.name));

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-36 pb-32 bg-cover bg-center bg-no-repeat border-b border-border"
        style={{ backgroundImage: `url(${categoriehomepage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background dark:from-background/95 dark:via-background/80 dark:to-background backdrop-blur-sm" />
        <div className="relative section-container max-w-6xl mx-auto z-10 px-6">
          <div className="flex flex-col items-center text-center justify-center mt-12">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-md mb-8 shadow-sm"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold tracking-wide uppercase text-foreground">
                AI Tool Directory
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tighter text-foreground"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Discover The Future <br className="hidden md:block"/> Of AI Tools
            </motion.h1>

            <motion.p
              className="text-lg md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mb-12 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Explore our comprehensive collection of AI tools organized by category. Find the perfect solution for your next project.
            </motion.p>

            {/* Global Search Bar */}
            <motion.div
              className="w-full max-w-2xl relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center gap-3 bg-card/80 backdrop-blur-xl border border-border rounded-2xl px-6 py-4 transition-all focus-within:border-primary/50 shadow-2xl">
                <Search className="w-6 h-6 text-primary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking to build today?..."
                  className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg flex-1"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 p-1.5 rounded-full"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Main Section ─────────────────────────────────────────────── */}
      <section
        className="relative py-24 min-h-[60vh]"
        style={{
          backgroundImage: `url(${AIToolCategoriesBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Header & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6 bg-card/40 border border-border p-4 md:p-6 rounded-3xl backdrop-blur-md shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Filter className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display text-foreground leading-tight">
                  {isFiltering ? "Search Results" : "Explore Categories"}
                </h2>
                <p className="text-muted-foreground text-sm font-medium">
                  {isLoading
                    ? "Loading our database..."
                    : `${allTools.length} total tools available`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-secondary/30 p-2 rounded-2xl border border-border">
              {pricingFilters.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPricing(p)}
                  className={`px-6 py-2.5 text-sm rounded-xl font-bold transition-all duration-300 ${selectedPricing === p
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Dynamic Content Area */}
          <AnimatePresence mode="wait">
            {isFiltering ? (
              <motion.div
                key="tools-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-2xl text-foreground font-display">
                    <span className="text-primary">{filteredTools.length}</span> tool{filteredTools.length !== 1 ? "s" : ""} found
                  </h3>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedPricing("All");
                    }}
                    className="text-sm font-semibold px-4 py-2 bg-secondary/50 rounded-xl border border-border text-foreground hover:bg-secondary transition-all flex items-center gap-2"
                  >
                    Clear all filters ✕
                  </button>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-card/50 rounded-3xl h-[300px] animate-pulse border border-border" />
                    ))}
                  </div>
                ) : filteredTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTools.map((tool, i) => (
                      <ToolCard key={tool.name + i} {...tool} delay={i * 0.03} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-card/30 border border-border rounded-3xl backdrop-blur-sm max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold font-display text-foreground mb-2">
                      No tools found
                    </p>
                    <p className="text-muted-foreground bg-secondary/50 px-4 py-1.5 rounded-full inline-flex font-medium">
                      Try adjusting your search terms or filters
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="categories-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryToolCounts.map((category, index) => {
                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full"
                      >
                        <Link
                          to={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className="group relative flex flex-col p-8 h-full bg-card backdrop-blur-md border border-border rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,179,71,0.08)] hover:border-primary/40 transition-all duration-500 overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none z-[0]"/>

                          <div className="flex items-start justify-between mb-8 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                              {category.icon}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                            </div>
                          </div>

                          <div className="relative z-10 mt-auto">
                            <h3 className="text-2xl font-bold font-display text-foreground mb-3 group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-border/50">
                                  {category.liveCount} Tool{category.liveCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Categories;
