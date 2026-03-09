import { useState, useEffect } from "react";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  const [showGrid, setShowGrid] = useState(false);

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

  // Only use real DB tools — no mock data
  const allTools = dbTools;

  // Apply all filters
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

  // Determine if we should show the tool grid (when user searches or picks a filter)
  const isFiltering =
    selectedCategory !== "All" ||
    selectedPricing !== "All" ||
    searchQuery.trim() !== "";

  // Generate dynamic category list based on both hardcoded list and actual DB data
  const dynamicCategories = [
    ...categories,
    ...Array.from(new Set(allTools.map(t => t.category)))
      .filter(catName => catName && !categories.find(c => c.name.toLowerCase() === catName.toLowerCase()))
      .map(catName => ({
        name: catName,
        icon: "✨", // Default icon for new categories
        count: 0
      }))
  ];

  const categoryToolCounts = dynamicCategories.map((cat) => ({
    ...cat,
    liveCount: allTools.filter(
      (t) => t.category?.toLowerCase() === cat.name.toLowerCase()
    ).length,
  })).filter(cat => cat.liveCount > 0 || categories.find(c => c.name === cat.name)); // Show if has tools OR is in main list

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-12 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${categoriehomepage})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative section-container max-w-6xl mx-auto z-10">
          <div className="flex flex-col items-center text-center min-h-[40vh] justify-center">
            <motion.div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FFB347]/30 bg-[#FFB347]/10 backdrop-blur-sm mb-9"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span
                className="text-xs font-bold text-white drop-shadow-lg"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
              >
                AI Tool Categories
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Browse &amp; Discover AI Tools
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-[#AAAAAA] max-w-3xl leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Explore our comprehensive collection of AI tools organized by
              category.
            </motion.p>

            {/* Global Search Bar */}
            <motion.div
              className="w-full max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3">
                <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all AI tools..."
                  className="bg-transparent border-none outline-none text-white placeholder:text-white/50 text-sm flex-1"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-white/40 hover:text-white text-sm"
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
        className="relative py-20"
        style={{
          backgroundImage: `url(${AIToolCategoriesBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 w-full flex flex-col items-center text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              AI Tool Categories
            </h2>
            <p className="text-gray-300">
              {isLoading
                ? "Loading tools..."
                : `${allTools.length} tools across ${categories.length} categories`}
            </p>

            {/* Pricing filter row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-sm text-gray-400 mr-1">Pricing:</span>
              {pricingFilters.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPricing(p)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors border ${selectedPricing === p
                    ? "bg-[#FFB347] text-black border-[#FFB347]"
                    : "border-white/20 text-gray-300 hover:border-white/50"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── When filtering: show tool grid ── */}
          {isFiltering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-lg">
                  {filteredTools.length} tool
                  {filteredTools.length !== 1 ? "s" : ""} found
                  {selectedCategory !== "All" ? ` in "${selectedCategory}"` : ""}
                  {searchQuery ? ` matching "${searchQuery}"` : ""}
                </h3>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedPricing("All");
                  }}
                  className="text-xs text-[#FFB347] hover:underline"
                >
                  Clear filters
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl h-52 animate-pulse" />
                  ))}
                </div>
              ) : filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredTools.map((tool, i) => (
                    <ToolCard key={tool.name + i} {...tool} delay={i * 0.03} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="text-white/70 text-lg font-medium mb-1">
                    No tools found
                  </p>
                  <p className="text-white/40 text-sm">
                    Try a different search term or filter
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Category list ── */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-300">
                  {categories.length} categories
                </span>
                {selectedCategory !== "All" && (
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="text-xs text-[#FFB347] hover:underline"
                  >
                    Show all
                  </button>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-0">
                  {categoryToolCounts.map((category, index) => {
                    const isActive = selectedCategory === category.name;
                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="group"
                      >
                        <Link
                          to={`/category/${category.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className={`flex items-center justify-between p-4 hover:bg-secondary/50 transition-all duration-300 hover:pl-6 border-b border-border/20 last:border-b-0 ${isActive ? "bg-[#FFB347]/10 pl-6" : ""
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{category.icon}</span>
                            <span
                              className={`font-medium ${isActive
                                ? "text-[#FFB347]"
                                : "text-foreground"
                                }`}
                            >
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : (
                              `${category.liveCount} tool${category.liveCount !== 1 ? 's' : ''}`
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Categories;
