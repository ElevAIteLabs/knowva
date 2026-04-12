import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown, Loader2, Sparkles, X, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";

const pricingFilters = ["All", "Free", "Freemium", "Paid"];

const AllTools = () => {
    const [selectedPricing, setSelectedPricing] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState("Popular");
    const [dbTools, setDbTools] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [activeSheet, setActiveSheet] = useState<"category" | "pricing" | null>(null);

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

    const handleSearchEnter = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim() && filteredTools.length > 0) {
            const topMatch = filteredTools[0];
            const user = localStorage.getItem("user");
            if (!user) {
                toast("Authentication required", {
                    description: "Please log in to view tool details.",
                });
                navigate("/login");
                return;
            }
            navigate(`/tool/${topMatch.name.toLowerCase().replace(/\s+/g, '-')}`);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-40 pb-20">
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

                    <div className="flex flex-col lg:flex-row gap-6 relative">
                        {/* Mobile Filter Trigger */}
                        <div className="lg:hidden flex items-center gap-3 mb-6">
                            <button
                                onClick={() => { setActiveSheet("category"); setIsFilterDrawerOpen(true); }}
                                className="flex-1 flex items-center justify-between bg-card border border-border px-5 py-4 rounded-2xl shadow-sm text-sm font-semibold"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="text-primary">{selectedCategory}</span>
                                </span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                                onClick={() => { setActiveSheet("pricing"); setIsFilterDrawerOpen(true); }}
                                className="flex-1 flex items-center justify-between bg-card border border-border px-5 py-4 rounded-2xl shadow-sm text-sm font-semibold"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Pricing:</span>
                                    <span className="text-primary">{selectedPricing}</span>
                                </span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* ── Desktop Filter Panel ─────────────────────────────────── */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden lg:block lg:w-72 flex-shrink-0"
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
                                            onKeyDown={handleSearchEnter}
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
                                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
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

            {/* ── Mobile Filter Sheets ─────────────────────────────────────── */}
            <AnimatePresence>
                {isFilterDrawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        {/* Sheet */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[2.5rem] border-t border-border z-[101] px-6 pt-2 pb-10 lg:hidden max-h-[85vh] overflow-y-auto"
                        >
                            {/* Handle */}
                            <div className="flex justify-center mb-6">
                                <div className="w-12 h-1.5 bg-border rounded-full" />
                            </div>

                            {activeSheet === "category" ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold font-display">Select Category</h2>
                                        <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 rounded-full bg-secondary">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Modal Search */}
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-2xl outline-none focus:border-primary transition-all text-sm"
                                        />
                                    </div>

                                    {/* Selected Category (if any) */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedCategory("All")}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedCategory === "All"
                                                ? "bg-foreground text-background"
                                                : "bg-secondary text-foreground hover:bg-secondary/80"
                                                }`}
                                        >
                                            All {selectedCategory === "All" ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                        </button>

                                        {Array.from(new Set(dbTools.map(t => t.category).filter(Boolean)))
                                            .sort()
                                            .map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        setSelectedCategory(cat);
                                                        // if we want to mimic the image exactly, we might close the sheet
                                                        // setIsFilterDrawerOpen(false); 
                                                    }}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedCategory === cat
                                                        ? "bg-foreground text-background"
                                                        : "bg-secondary text-foreground hover:bg-secondary/80"
                                                        }`}
                                                >
                                                    {cat} {selectedCategory === cat ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                </button>
                                            ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <button
                                            onClick={() => { setSelectedCategory("All"); setIsFilterDrawerOpen(false); }}
                                            className="py-4 rounded-2xl border border-border font-bold text-sm"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => setIsFilterDrawerOpen(false)}
                                            className="py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold font-display">Pricing Plan</h2>
                                        <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 rounded-full bg-secondary">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-muted-foreground">Select the pricing model that fits your needs</p>
                                        <div className="grid grid-cols-1 gap-3">
                                            {pricingFilters.map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => setSelectedPricing(p)}
                                                    className={`flex items-center justify-between w-full px-6 py-4 rounded-2xl border transition-all ${selectedPricing === p
                                                        ? "bg-primary/5 border-primary text-primary font-bold"
                                                        : "bg-secondary/50 border-border text-foreground"
                                                        }`}
                                                >
                                                    {p}
                                                    {selectedPricing === p && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Mini Alert like in the image */}
                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                                            <Sparkles className="w-3 h-3" />
                                            AI Selection Assistant
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                            Free and Freemium tools are great for testing, but Paid tools usually offer higher API stability.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <button
                                            onClick={() => { setSelectedPricing("All"); setIsFilterDrawerOpen(false); }}
                                            className="py-4 rounded-2xl border border-border font-bold text-sm"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => setIsFilterDrawerOpen(false)}
                                            className="py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20"
                                        >
                                            Show Results
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <Footer />
        </div>
    );
};

export default AllTools;
