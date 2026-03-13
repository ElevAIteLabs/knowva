import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown, Loader2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";

const pricingFilters = ["All", "Free", "Freemium", "Paid"];

const AllTools = () => {
    const [selectedPricing, setSelectedPricing] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Popular");
    const [dbTools, setDbTools] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

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
                        id: tool.id,
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
                            if (url.startsWith('http')) return url;
                            const cleanPath = url.startsWith('/') ? url.slice(1) : url;
                            const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
                            return `${API_BASE_URL}/${finalPath}`;
                        })(),
                    }));
                setDbTools(formatted);
            }
        } catch (e) {
            console.error("Failed to load DB tools", e);
        } finally {
            setIsLoading(false);
        }
    };

    const getSortedAndFilteredTools = () => {
        let tools = dbTools.filter((tool) => {
            const matchesCategory =
                selectedCategory === "All" || tool.category === selectedCategory;
            const matchesPricing =
                selectedPricing === "All" || tool.pricing === selectedPricing;
            const matchesSearch =
                searchQuery.trim() === "" ||
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.category?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesPricing && matchesSearch;
        });

        // Apply sorting
        if (sortBy === "Popular") {
            tools.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "Newest") {
            tools.sort((a, b) => (b.id || 0) - (a.id || 0));
        } else if (sortBy === "A-Z") {
            tools.sort((a, b) => a.name.localeCompare(b.name));
        }

        return tools;
    };

    const filteredTools = getSortedAndFilteredTools();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-24 pb-20">
                <div className="section-container">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                All AI Tools
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            {isLoading ? "Loading tools..." : `Discover ${filteredTools.length} curated AI tools from across the platform`}
                        </p>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* ── Filter Panel ───────────────────────────────────────── */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:w-72 flex-shrink-0"
                        >
                            <div className="glass-card p-6 lg:sticky lg:top-24">
                                <div className="flex items-center gap-2 mb-6">
                                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                                    <h3 className="font-display font-semibold text-foreground">Filters</h3>
                                </div>

                                {/* Search */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                        Search
                                    </label>
                                    <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
                                        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search tools or categories..."
                                            className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm flex-1"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className="text-muted-foreground hover:text-foreground text-xs"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                        Categories
                                    </label>
                                    <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedCategory("All")}
                                            className={`px-3 py-2 text-sm rounded-xl text-left transition-all ${selectedCategory === "All"
                                                ? "bg-primary/10 text-primary font-bold"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                }`}
                                        >
                                            All Categories
                                        </button>
                                        {Array.from(new Set(dbTools.map(t => t.category).filter(Boolean))).sort().map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-3 py-2 text-sm rounded-xl text-left transition-all ${selectedCategory === cat
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                        Pricing
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {pricingFilters.map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setSelectedPricing(p)}
                                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${selectedPricing === p
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Active filters summary */}
                                {(searchQuery || selectedPricing !== "All" || selectedCategory !== "All") && (
                                    <button
                                        onClick={() => { 
                                            setSearchQuery(""); 
                                            setSelectedPricing("All"); 
                                            setSelectedCategory("All");
                                        }}
                                        className="w-full text-xs text-primary hover:underline text-left"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* ── Tools Grid ─────────────────────────────────────────── */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm text-muted-foreground">
                                    {isLoading ? (
                                        <span className="flex items-center gap-1.5">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                                        </span>
                                    ) : (
                                        `${filteredTools.length} tool${filteredTools.length !== 1 ? "s" : ""} found`
                                    )}
                                </span>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-border"
                                    >
                                        Sort by: <span className="text-foreground font-medium">{sortBy}</span> <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSortDropdown ? "rotate-180" : ""}`} />
                                    </button>

                                    {showSortDropdown && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowSortDropdown(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                {["Popular", "Newest", "A-Z"].map((option) => (
                                                    <button
                                                        key={option}
                                                        onClick={() => {
                                                            setSortBy(option);
                                                            setShowSortDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-secondary ${sortBy === option ? "text-primary bg-primary/5 font-medium" : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-secondary/30 rounded-2xl h-52 animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : filteredTools.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {filteredTools.map((tool, i) => (
                                        <ToolCard key={tool.name + i} {...tool} delay={i * 0.03} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-3xl mb-4">🔍</p>
                                    <p className="text-muted-foreground text-lg font-medium mb-2">No tools found</p>
                                    <p className="text-muted-foreground/60 text-sm">
                                        Try adjusting your search or filter criteria
                                    </p>
                                    <button
                                        onClick={() => { setSearchQuery(""); setSelectedPricing("All"); }}
                                        className="mt-4 text-primary text-sm hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AllTools;
