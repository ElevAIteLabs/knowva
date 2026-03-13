import { useState, useEffect, useMemo } from "react";
import { Check, X, Star, Layers, Activity, Zap, Search, Plus, Trash2, Filter, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { categories as mockCategories } from "@/data/mockData";
import compareaitools from "@/assets/compareaitools.jpg";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";
import { toast } from "sonner";

const features = [
  { label: "Pricing", key: "pricing" },
  { label: "Category", key: "category" },
  { label: "Rating", key: "rating_val" },
  { label: "Key Features", key: "features_list" },
  { label: "Website", key: "website_url", isLink: true },
];

const safeParse = (str: string, fallback: any) => {
    if (!str) return fallback;
    try {
        let parsed = JSON.parse(str);
        if (typeof parsed === 'string') {
            try {
                const inner = JSON.parse(parsed);
                if (Array.isArray(inner)) parsed = inner;
            } catch { }
        }
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        if (typeof str === 'string') {
            const clean = str.replace(/^\[|\]$/g, '').replace(/'/g, '');
            return clean.split(',').map(s => s.trim()).filter(Boolean);
        }
        return fallback;
    }
};

const Compare = () => {
  const [allTools, setAllTools] = useState<any[]>([]);
  const [selectedTools, setSelectedTools] = useState<(any | null)[]>([null, null, null]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.TOOLS);
      const result = await response.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        const formattedTools = result.data
          .filter((t: any) => t.name && t.name.trim() !== "")
          .map((tool: any) => ({
            ...tool,
            icon_display: (() => {
              let url = tool.icon_url || "";
              if (url.startsWith('[') && url.endsWith(']')) {
                try { const parsed = JSON.parse(url); if (Array.isArray(parsed)) url = parsed[0]; } catch { }
              }
              if (!url) return tool.name ? tool.name.charAt(0) : '?';
              return url.startsWith('http')
                ? url
                : `${API_BASE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;
            })(),
            rating_val: parseFloat(tool.rating) || 0,
            features_list: safeParse(tool.features, []).slice(0, 3).join(", ") || "N/A",
            pros_list: safeParse(tool.pros, []),
            cons_list: safeParse(tool.cons, []),
          }));
        setAllTools(formattedTools);
        
        // Pre-select some tools if available
        if (formattedTools.length >= 3) {
            setSelectedTools([formattedTools[0], formattedTools[1], formattedTools[2]]);
        } else if (formattedTools.length > 0) {
            const newSelected = [...selectedTools];
            formattedTools.forEach((tool, i) => { if (i < 3) newSelected[i] = tool; });
            setSelectedTools(newSelected);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tools", error);
      toast.error("Failed to load tools for comparison");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredToolsForSelection = useMemo(() => {
    return allTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
      const notAlreadySelected = !selectedTools.find(st => st?.id === tool.id);
      return matchesSearch && matchesCategory && notAlreadySelected;
    });
  }, [allTools, searchQuery, selectedCategory, selectedTools]);

  const openSelector = (slotIndex: number) => {
    setActiveSlot(slotIndex);
    setIsSelectorOpen(true);
  };

  const selectTool = (tool: any) => {
    if (activeSlot !== null) {
      const newSelected = [...selectedTools];
      newSelected[activeSlot] = tool;
      setSelectedTools(newSelected);
      setIsSelectorOpen(false);
      setActiveSlot(null);
      setSearchQuery("");
    }
  };

  const removeTool = (slotIndex: number) => {
    const newSelected = [...selectedTools];
    newSelected[slotIndex] = null;
    setSelectedTools(newSelected);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <div className="pt-36 pb-32 relative overflow-hidden border-b border-border" 
           style={{
             backgroundImage: `url(${compareaitools})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background backdrop-blur-sm" />
        
        <div className="relative section-container z-10 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6 tracking-wide uppercase">
                <Layers className="w-4 h-4" />
                Side-By-Side Analysis
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tight">
              Compare AI Tools <span className="gradient-text glow-effect drop-shadow-sm">Side by Side</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light">
              Evaluate features, pricing, and technical capabilities to find the perfect foundation for your workflow.
            </p>
          </motion.div>

          {/* Selection & Compare Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 relative">
            {selectedTools.map((tool, index) => (
              <div key={index} className="relative">
                {tool ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card backdrop-blur-md rounded-3xl border border-border shadow-[0_20px_40px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,179,71,0.08)] hover:border-primary/40 transition-all duration-500 group relative h-full"
                  >
                    {/* Remove Button */}
                    <button 
                      onClick={() => removeTool(index)}
                      className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Change Button */}
                    <button 
                      onClick={() => openSelector(index)}
                      className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-background/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100 border border-border"
                    >
                      Change
                    </button>

                    {/* Card Header */}
                    <div className="p-8 pb-0 text-center relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 mx-auto rounded-3xl mb-6 flex items-center justify-center bg-secondary/80 border border-border shadow-inner relative group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                        {tool.icon_display.startsWith('http') || tool.icon_display.includes('.') ? (
                          <img src={tool.icon_display} alt={tool.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <span className="text-3xl font-bold">{tool.icon_display}</span>
                        )}
                      </div>
                      
                      <h3 className="font-display text-3xl font-black text-foreground mb-3">{tool.name}</h3>
                      <div className="inline-flex items-center justify-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg mb-6">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-bold text-foreground">{tool.rating_val.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="h-px w-full bg-border mx-auto mb-6"></div>

                    {/* Features List */}
                    <div className="px-8 pb-8 flex-1 flex flex-col">
                      <div className="space-y-4 mb-8 flex-1">
                        {features.map((feature) => (
                          <div key={feature.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">{feature.label}</span>
                            <span className="text-foreground font-bold text-right">
                              {feature.isLink ? (
                                <a href={tool[feature.key]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    Visit <Zap className="w-3 h-3" />
                                </a>
                              ) : (
                                tool[feature.key] || "N/A"
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => window.open(tool.website_url, '_blank')}
                        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all shadow-md hover:scale-[1.02] hover:shadow-primary/30 flex items-center justify-center gap-2"
                      >
                        Visit Website <Zap className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => openSelector(index)}
                    className="w-full h-[500px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-bold">Add Tool to Compare</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tool Selection Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectorOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-border flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-display">Select Tool</h2>
                  <button onClick={() => setIsSelectorOpen(false)} className="p-2 rounded-full hover:bg-secondary transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-xl outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="relative">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="appearance-none bg-secondary border border-border rounded-xl px-4 py-2 pr-10 outline-none focus:border-primary transition-colors text-sm font-medium"
                    >
                      <option value="All">All Categories</option>
                      {Array.from(new Set(allTools.map(t => t.category).filter(Boolean))).sort().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isLoading ? (
                  <div className="col-span-full py-20 text-center text-muted-foreground">Loading tools...</div>
                ) : filteredToolsForSelection.length > 0 ? (
                  filteredToolsForSelection.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => selectTool(tool)}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                        {tool.icon_display.startsWith('http') || tool.icon_display.includes('.') ? (
                          <img src={tool.icon_display} alt={tool.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-xl font-bold">{tool.icon_display}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{tool.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{tool.category}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-muted-foreground">No tools found matching your criteria.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Compare;
