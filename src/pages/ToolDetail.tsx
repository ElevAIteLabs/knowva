import { Star, ExternalLink, Check, X, ChevronLeft, Send, LogIn, Loader2, Bookmark, LayoutGrid, CreditCard, Terminal, HelpCircle, History, MessageSquare, Info, ShieldCheck, Triangle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";

import { toast } from "sonner";
// Local assets removed to rely on DB/Excel images
import runwayvideo from "@/assets/runwayvideo.jpg";

const toolsMock: any = {}; // Fallback removed, relying on DB

// Static reviews removed — now loaded from DB

const ToolDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState<any>(null);
  const [allDbTools, setAllDbTools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);

  // Computed live rating — average of all user reviews; falls back to tool's own rating
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / reviews.length) * 10) / 10
    : null;
  const displayRating = avgRating ?? tool?.rating ?? 0;
  const displayReviewCount = reviews.length;

  // Get logged-in user
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  })();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchUpvotes = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`${API_ENDPOINTS.UPVOTES}?target_id=${slug}&target_type=tool&user_id=${currentUser?.id || 0}`);
        const result = await res.json();
        if (result.status === "success") {
          setUpvoteCount(result.count);
          setHasUpvoted(result.has_upvoted);
        }
      } catch { }
    };
    fetchUpvotes();
  }, [slug, currentUser?.id]);

  const handleUpvote = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!slug) return;
    setUpvoteLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.UPVOTES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          target_id: slug,
          target_type: 'tool'
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        setUpvoteCount(result.new_count);
        setHasUpvoted(result.action === 'added');
        toast.success(result.action === 'added' ? "Tool upvoted!" : "Upvote removed");
      }
    } catch { toast.error("Upvote failed"); }
    finally { setUpvoteLoading(false); }
  };

  const handleModeration = async (reviewId: number, action: 'verify' | 'hide', currentStatus: boolean) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const res = await fetch(API_ENDPOINTS.REVIEWS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          admin_id: currentUser.id,
          review_id: reviewId,
          status: !currentStatus
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        toast.success(result.message);
        fetchReviews(); // Refresh
      } else {
        toast.error(result.message);
      }
    } catch { toast.error("Moderation failed"); }
  };

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TOOLS);
        const result = await response.json();

        let foundTool = null;
        if (result.status === "success") {
          const dbTool = result.data.find((t: any) =>
            t.name.toLowerCase().replace(/\s+/g, '-') === slug?.toLowerCase() ||
            t.id.toString() === slug
          );

          if (dbTool) {
            // store all DB tools for alternatives
            const safeParseAll = (str: string, fallback: any) => {
              try { return JSON.parse(str); } catch { return fallback; }
            };
            // store all DB tools for alternatives
            const safeGetIcon = (iconUrl: string) => {
              if (!iconUrl) return null;
              if (iconUrl.startsWith('http')) return iconUrl;
              const cleanPath = iconUrl.startsWith('/') ? iconUrl.slice(1) : iconUrl;
              const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
              return `${API_BASE_URL}/${finalPath}`;
            };

            setAllDbTools(result.data
              .filter((t: any) => t.name && t.name.trim() !== "")
              .map((t: any) => ({
                name: t.name,
                description: t.description,
                category: t.category,
                pricing: t.pricing,
                rating: parseFloat(t.rating) || 4.5,
                icon: safeGetIcon(t.icon_url) || (t.name ? t.name.charAt(0) : '?'),
              })));

            // Parse JSON fields safely, and unwrap if double-encoded/triple-encoded
            const safeParse = (str: string, fallback: any) => {
              if (!str) return fallback;
              let content = str;
              // If it starts with [ and ends with ] but isn't valid JSON (e.g. single quotes), fix it
              if (typeof content === 'string' && content.trim().startsWith('[') && content.trim().endsWith(']')) {
                const trimmed = content.trim();
                // Check if it uses single quotes instead of double
                if (trimmed.includes("'") && !trimmed.includes('"')) {
                  try {
                    // Try to convert single quotes to double quotes for JSON.parse
                    // Simple replacement, won't handle escaped single quotes inside strings perfectly but good for basic tags
                    const fixed = trimmed.replace(/'/g, '"');
                    return JSON.parse(fixed);
                  } catch { }
                }
              }

              try {
                let parsed = JSON.parse(content);
                // Unload double stringification if any
                if (typeof parsed === 'string') {
                  try {
                    const inner = JSON.parse(parsed);
                    if (Array.isArray(inner) || typeof inner === 'object') parsed = inner;
                  } catch { }
                }

                if (Array.isArray(parsed)) {
                  return parsed.map(item => {
                    if (typeof item === 'string' && item.startsWith('[') && item.endsWith(']')) {
                      // Handle double nested strings like ["[\"Item\"]"]
                      try {
                        const sub = JSON.parse(item);
                        return Array.isArray(sub) ? sub[0] : item;
                      } catch {
                        // Try single quote fix for sub-items too
                        try {
                          return JSON.parse(item.replace(/'/g, '"'))[0];
                        } catch { return item; }
                      }
                    }
                    return item;
                  });
                }
                return Array.isArray(parsed) ? parsed : fallback;
              } catch (e) {
                // Fallback to splitting by comma if not JSON but comma-separated
                if (typeof content === 'string') {
                  // Clean up brackets if they exist but JSON failed
                  const clean = content.replace(/^\[|\]$/g, '').replace(/'/g, '');
                  return clean.split(',').map(s => s.trim()).filter(Boolean);
                }
                return fallback;
              }
            };

            foundTool = {
              id: dbTool.id,
              name: dbTool.name,
              icon: (() => {
                const rawIcon = dbTool.icon_url || "";
                const cleanIcon = rawIcon.replace(/^['"\[]|['"\]]$/g, '').trim();

                return cleanIcon ? (
                  <img
                    src={cleanIcon.startsWith('http')
                      ? cleanIcon
                      : `${API_BASE_URL}/${cleanIcon.startsWith('/') ? cleanIcon.slice(1) : cleanIcon}`}
                    alt={dbTool.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `<div class="text-xl font-bold bg-white text-black w-full h-full flex items-center justify-center rounded-[20px]">${dbTool.name.charAt(0)}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="text-xl font-bold bg-white text-black w-full h-full flex items-center justify-center rounded-[20px]">
                    {dbTool.name.charAt(0)}
                  </div>
                );
              })(),
              description: dbTool.description,
              category: dbTool.category,
              pricing: dbTool.pricing,
              rating: parseFloat(dbTool.rating) || 4.5,
              reviews: parseInt(dbTool.reviews_count) || 0,
              website: dbTool.website_url,
              pros: safeParse(dbTool.pros, []),
              cons: safeParse(dbTool.cons, []),
              features: safeParse(dbTool.features, []),
              pricing_tiers: safeParse(dbTool.pricing_tiers, []),
              media_urls: safeParse(dbTool.media_urls, []),
              releases: safeParse(dbTool.releases, []),
              prompts: safeParse(dbTool.prompts, []),
              faqs: safeParse(dbTool.faqs, []),
            };
          }
        }

        if (!foundTool) {
          // No fallback to mock data
        }

        setTool(foundTool);
      } catch (error) {
        setTool(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTool();
  }, [slug]);

  // Check if tool is saved
  useEffect(() => {
    if (currentUser && tool?.id) {
      const checkSaved = async () => {
        try {
          const res = await fetch(API_ENDPOINTS.SAVED_TOOLS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "check",
              user_id: currentUser.id,
              tool_id: tool.id,
            }),
          });
          const result = await res.json();
          if (result.status === "success") setIsSaved(result.saved);
        } catch { }
      };
      checkSaved();
    }
  }, [tool?.id, currentUser?.id]);

  const handleSaveToggle = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!tool?.id) return;
    setIsSaving(true);
    try {
      const action = isSaved ? "unsave" : "save";
      const res = await fetch(API_ENDPOINTS.SAVED_TOOLS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          user_id: currentUser.id,
          tool_id: tool.id,
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from saved" : "Tool saved successfully!");
      }
    } catch { toast.error("Failed to update saved status"); }
    finally { setIsSaving(false); }
  };

  // Fetch reviews from DB
  const fetchReviews = async () => {
    if (!slug) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.REVIEWS}?tool_slug=${encodeURIComponent(slug)}`);
      const result = await res.json();
      if (result.status === "success") setReviews(result.data);
    } catch { /* silent */ }
    finally { setReviewsLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [slug]);

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { navigate("/login"); return; }
    if (userRating === 0) { toast.error("Please select a star rating."); return; }
    if (!reviewText.trim()) { toast.error("Please write a review."); return; }

    setSubmitLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.REVIEWS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_slug: slug,
          user_id: currentUser.id,
          user_name: currentUser.fullName || currentUser.email,
          rating: userRating,
          review_text: reviewText.trim(),
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        toast.success(result.message);
        setReviewText("");
        setUserRating(0);
        fetchReviews();
      } else {
        toast.error(result.message || "Failed to submit review.");
      }
    } catch { toast.error("Network error. Please try again."); }
    finally { setSubmitLoading(false); }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
      return d.toLocaleDateString();
    } catch { return dateStr; }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback if tool not found
  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Tool Not Found</h1>
          <p className="text-muted-foreground mb-6">The AI tool you're looking for doesn't exist.</p>
          <Link to="/categories" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
            Browse All Tools
          </Link>
        </div>
      </div>
    );
  }

  const alternatives = allDbTools.filter((t) => t.name !== tool.name).slice(0, 4);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20 md:pt-32"
        style={{
          backgroundImage: `url(${runwayvideo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>

        <div className="relative section-container max-w-6xl mx-auto text-center px-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FFB347]/30 bg-[#FFB347]/10 backdrop-blur-sm mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="text-xs font-bold text-white drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>AI Tool Details</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="font-display text-2xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {tool.name}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="text-lg md:text-xl text-[#AAAAAA] mb-4 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {tool.category} • {tool.pricing} • {reviewsLoading ? tool.rating : displayRating} ⭐
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="pt-40 pb-20">
        <div className="section-container">
          <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Tools
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card glow-box p-8 md:p-10 mb-6"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center p-2">
                {tool.icon}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold text-foreground">{tool.name}</h1>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">{tool.pricing}</span>
                </div>
                <p className="text-muted-foreground mb-4 max-w-2xl">{tool.description}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold text-foreground">
                      {reviewsLoading ? tool.rating : displayRating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({displayReviewCount} {displayReviewCount === 1 ? "review" : "reviews"})
                      {avgRating !== null && (
                        <span className="ml-1 text-xs text-primary font-medium">• Live avg</span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">{tool.category}</span>
                </div>
              </div>
              <div className="flex gap-3 flex-shrink-0 flex-wrap md:flex-nowrap">
                <button
                  onClick={handleUpvote}
                  disabled={upvoteLoading}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition-all ${hasUpvoted ? "bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(255,179,71,0.15)]" : "bg-card border-border text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30"}`}
                >
                  <Triangle className={`w-5 h-5 ${hasUpvoted ? "fill-current" : ""}`} />
                  <span className="text-[10px] font-black mt-1">{upvoteCount}</span>
                </button>
                <button
                  onClick={handleSaveToggle}
                  disabled={isSaving}
                  className={`p-3 rounded-xl border transition-all ${isSaved ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(255,179,71,0.2)]" : "bg-card border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"}`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                </button>
                <a href={tool.website} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
                <Link to="/compare" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-colors">
                  Compare
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Tab Navigation ── */}
          <div className="flex items-center gap-1 p-1 bg-secondary/50 backdrop-blur-sm border border-border rounded-xl mb-8 overflow-x-auto no-scrollbar max-w-fit mx-auto sm:mx-0">
            {[
              { id: "overview", label: "Overview", icon: LayoutGrid },
              { id: "pricing", label: "Pricing", icon: CreditCard },
              { id: "prompts", label: "Prompts", icon: Terminal },
              { id: "faqs", label: "Q&A", icon: HelpCircle },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === t.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {/* Screenshots */}
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-xl font-bold flex items-center gap-2">
                          <LayoutGrid className="w-5 h-5 text-primary" /> Visual Interface
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tool.media_urls && tool.media_urls.length > 0 && (
                          <>
                            {tool.media_urls
                              .map((url: string) => {
                                // Clean up any residual brackets or quotes from malformed storage
                                return url.replace(/^['"\[]|['"\]]$/g, '').trim();
                              })
                              .filter((url: string) => {
                                if (!url) return false;
                                const lower = url.toLowerCase();
                                // Only show if it's a valid extension or a full HTTP URL
                                return lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/) || lower.startsWith('http');
                              })
                              .slice(0, 4)
                              .map((url: string, i: number) => {
                                const fullUrl = url.startsWith('http')
                                  ? url
                                  : (() => {
                                      const clean = url.startsWith('/') ? url.slice(1) : url;
                                      const final = clean.startsWith('uploads/') ? clean : `uploads/${clean}`;
                                      return `${API_BASE_URL}/${final}`;
                                    })();

                                return (
                                  <div key={i} className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden shadow-inner group/img relative">
                                    <img
                                      src={fullUrl}
                                      alt={`${tool.name} Screenshot ${i + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        // Use a cleaner fallback or just hide it
                                        target.src = "https://placehold.co/600x400/1a1a1a/444444?text=Image+Load+Failed";
                                        // target.style.display = 'none'; 
                                      }}
                                    />
                                  </div>
                                );
                              })}
                          </>
                        )}
                        {(!tool.media_urls || tool.media_urls.length === 0) && (
                          <>
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="aspect-video bg-black/50 border border-white/20 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-[#FFB347]/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-[#FFB347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M8 12h8M12 8v8M8 16h8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  <div className="text-sm font-medium text-white mb-1">Screenshot {i}</div>
                                  <div className="text-xs text-[#AAAAAA]">Interface preview</div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick Info Grid - Features, Pros, Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="glass-card p-6 border-l-4 border-l-primary flex flex-col">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Check className="w-5 h-5 text-primary" /> Key Features
                        </h3>
                        <div className="space-y-3 flex-1">
                          {tool.features && tool.features.length > 0 ? tool.features.map((f: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {f}
                            </div>
                          )) : (
                            <p className="text-xs text-muted-foreground italic">No features specified</p>
                          )}
                        </div>
                      </div>

                      <div className="glass-card p-6 border-l-4 border-l-green-500 flex flex-col">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Star className="w-5 h-5 text-green-500" /> Pros
                        </h3>
                        <div className="space-y-3 flex-1">
                          {tool.pros && tool.pros.length > 0 ? tool.pros.map((p: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-foreground">{p}</span>
                            </div>
                          )) : (
                            <p className="text-xs text-muted-foreground italic">No pros specified</p>
                          )}
                        </div>
                      </div>

                      <div className="glass-card p-6 border-l-4 border-l-red-500 flex flex-col">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <X className="w-5 h-5 text-red-500" /> Cons
                        </h3>
                        <div className="space-y-3 flex-1">
                          {tool.cons && tool.cons.length > 0 ? tool.cons.map((c: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-foreground">{c}</span>
                            </div>
                          )) : (
                            <p className="text-xs text-muted-foreground italic">No cons specified</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="glass-card p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="font-display text-xl font-semibold text-foreground">User Reviews</h2>
                        <span className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                      </div>

                      {/* ── Submit Review Form ── */}
                      {currentUser ? (
                        <form onSubmit={handleSubmitReview} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                          <p className="text-sm font-semibold text-foreground">Write a Review</p>

                          {/* Star Picker */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setUserRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-6 h-6 ${star <= (hoverRating || userRating)
                                    ? "fill-primary text-primary"
                                    : "fill-transparent text-muted-foreground"
                                    }`}
                                />
                              </button>
                            ))}
                            {userRating > 0 && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {["Poor", "Fair", "Good", "Great", "Excellent"][userRating - 1]}
                              </span>
                            )}
                          </div>

                          {/* Review Text */}
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience with this tool..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                          />

                          <button
                            type="submit"
                            disabled={submitLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {submitLoading ? "Submitting..." : "Submit Review"}
                          </button>
                        </form>
                      ) : (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Log in to leave a review for this tool.</p>
                          <Link
                            to="/login"
                            className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
                          >
                            <LogIn className="w-4 h-4" /> Log In
                          </Link>
                        </div>
                      )}

                      {/* ── Reviews List ── */}
                      {reviewsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-2xl mb-2">💬</p>
                          <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          <div className="space-y-3">
                            {reviews.map((r, i) => (
                              <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-5 rounded-2xl border transition-all ${r.is_verified ? "bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(255,179,71,0.05)]" : "bg-secondary/50 border-border"}`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-black text-slate-600 border border-white/20 select-none shadow-inner">
                                      {(r.user_name || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-foreground text-sm">{r.user_name}</span>
                                        {r.is_verified == 1 && (
                                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary text-black text-[9px] font-black uppercase tracking-tighter">
                                            <ShieldCheck size={10} /> Expert
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star
                                            key={s}
                                            className={`w-3 h-3 ${s <= r.rating
                                              ? "fill-primary text-primary"
                                              : "fill-transparent text-muted-foreground"
                                              }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{formatDate(r.created_at)}</span>
                                    {currentUser?.role === 'admin' && (
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => handleModeration(r.id, 'verify', r.is_verified == 1)}
                                          className={`p-1.5 rounded-lg border transition-colors ${r.is_verified == 1 ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:text-primary"}`}
                                          title={r.is_verified == 1 ? "Unverify Review" : "Verify as Expert"}
                                        >
                                          <ShieldCheck size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleModeration(r.id, 'hide', r.is_hidden == 1)}
                                          className={`p-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors`}
                                          title="Hide Review"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">"{r.review_text}"</p>
                              </motion.div>
                            ))}
                          </div>
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "pricing" && (
                  <motion.div
                    key="pricing"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-primary" /> Pricing Plans
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tool.pricing_tiers?.length > 0 ? (
                        tool.pricing_tiers.map((tier: any, index: number) => (
                          <div key={index} className="glass-card p-8 relative overflow-hidden group hover:border-primary/50 transition-all flex flex-col items-center text-center">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-full group-hover:bg-primary/10 transition-colors" />

                            <div className="mb-4 w-full">
                              <span className="block font-bold text-xl text-foreground mb-1">{((typeof tier === 'string') ? tier : tier.name) || (tool.name + " Plan")}</span>
                              <div className="text-3xl font-black text-primary tracking-tight">
                                {((typeof tier === 'string') ? tool.pricing : tier.price) || "Free"}
                                {tier.interval && <span className="text-sm font-medium text-muted-foreground ml-1">{tier.interval}</span>}
                              </div>
                            </div>

                            <div className="w-10 h-1 bg-primary/20 mb-4 rounded-full" />

                            <ul className="space-y-3 mb-6 w-full">
                              {((typeof tier === 'string') ? tool.features : tier.features)?.map((f: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>

                            <button className="w-full mt-auto py-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(255,179,71,0.05)] transition-all active:scale-[0.98]">
                              Get Started
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="md:col-span-2 glass-card p-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">Detailed pricing tiers are not available for this tool.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "prompts" && (
                  <motion.div
                    key="prompts"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                        <Terminal className="w-6 h-6 text-primary" /> Prompts & Use Cases
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {tool.prompts?.length > 0 ? (
                        tool.prompts.map((p: any, i: number) => (
                          <div key={i} className="glass-card p-6 flex items-start gap-4 group hover:bg-primary/5 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground leading-relaxed italic">"{typeof p === 'string' ? p : (p.text || p.content || JSON.stringify(p))}"</p>
                              <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-primary" /> Popular Prompt
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="glass-card p-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                            <Terminal className="text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">New prompt examples have not been added yet.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "faqs" && (
                  <motion.div
                    key="faqs"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                      <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {tool.faqs?.length > 0 ? (
                        tool.faqs.map((faq: any, i: number) => (
                          <div key={i} className="py-6 border-b border-white/5 last:border-0 group">
                            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-start gap-3 group-hover:text-primary transition-colors">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                              {faq.question || (typeof faq === 'string' ? faq : "Question")}
                            </h3>
                            {(faq.answer || (typeof faq === 'string' && faq.includes('|'))) && (
                              <div className="pl-5 text-sm text-muted-foreground leading-relaxed">
                                {faq.answer || (typeof faq === 'string' ? faq.split('|')[1]?.trim() : "")}
                              </div>
                            )}
                            {(!faq.answer && typeof faq === 'object' && faq.content) && (
                              <div className="pl-5 text-sm text-muted-foreground leading-relaxed">
                                {faq.content}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="glass-card p-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                            <HelpCircle className="text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">No FAQs available for this tool.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Content (Right Column) */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> Tool Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Live Rating</span>
                    <span className="font-bold text-foreground">{displayRating} ⭐</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Pricing Model</span>
                    <span className="font-bold text-primary">{tool.pricing}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alternatives */}
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Similar Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {alternatives.map((tool, i) => (
                <ToolCard key={tool.name} {...tool} delay={i * 0.05} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ToolDetail;
