import { Star, ExternalLink, Check, X, ChevronLeft, Send, LogIn, Loader2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";

import { toast } from "sonner";
import chatgptlogo from "@/assets/chatgptlogo.png";
import midjourneylogo from "@/assets/midjourney logo.png";
import claudelogo from "@/assets/claude ai logo.png";
import cursorlogo from "@/assets/cursor logo.png";
import runwaylogo from "@/assets/runway logo.png";
import jasperlogo from "@/assets/jasper logo.png";
import elevenlabslogo from "@/assets/elevenlabs logo.png";
import perplexitylogo from "@/assets/preplexity logo.png";
import chatgpt1 from "@/assets/chatgpt1.png";
import chatgpt2 from "@/assets/chaptgpt2.png";
import chatgpt3 from "@/assets/chatgpt3.png";
import chatgpt4 from "@/assets/chatgpt4.png";
import midjourney1 from "@/assets/Midjourney1.png";
import midjourney2 from "@/assets/Midjourney2.png";
import midjourney3 from "@/assets/Midjourney3.png";
import midjourney4 from "@/assets/Midjourney4.png";
import claude1 from "@/assets/claude1.png";
import claude2 from "@/assets/claude2.png";
import claude3 from "@/assets/claude3.png";
import claude4 from "@/assets/claude4.png";
import cursor1 from "@/assets/cursor1.png";
import cursor2 from "@/assets/cursor2.png";
import cursor3 from "@/assets/cursor3.png";
import cursor4 from "@/assets/cursor4.png";
import runway1 from "@/assets/runway1.mp4";
import runway2 from "@/assets/runway2.mp4";
import runway3 from "@/assets/runway3.mp4";
import runway4 from "@/assets/runway4.mp4";
import jasper1 from "@/assets/jasper1.mp4";
import jasper2 from "@/assets/jasper2.mp4";
import jasper3 from "@/assets/jasper3.mp4";
import jasper4 from "@/assets/jasper4.mp4";
import elevenlabs1 from "@/assets/elevenlabs1.mp4";
import elevenlabs2 from "@/assets/elevenlabs2.mp4";
import elevenlabs3 from "@/assets/elevenlabs3.mp4";
import elevenlabs4 from "@/assets/elevenlabs4.mp4";
import perplexity1 from "@/assets/preplexity1.png";
import perplexity2 from "@/assets/preplexity2.png";
import herosection from "@/assets/herosection.mp4";
import perplexity3 from "@/assets/preplexity3.png";
import perplexity4 from "@/assets/preplexity4.png";
import sora1 from "@/assets/sora1.mp4";
import sora2 from "@/assets/sora2.mp4";
import sora3 from "@/assets/sora3.mp4";
import sora4 from "@/assets/sora4.mp4";
import devin1 from "@/assets/devin1.mp4";
import devin2 from "@/assets/devin2.mp4";
import devin3 from "@/assets/devin3.mp4";
import devin4 from "@/assets/devin4.mp4";
import geminiUltra1 from "@/assets/gemini ultra1.mp4";
import geminiUltra2 from "@/assets/gemini ultra2.mp4";
import geminiUltra3 from "@/assets/gemini ultra3.mp4";
import geminiUltra4 from "@/assets/gemini ultra4.mp4";
import udio1 from "@/assets/udio1.mp4";
import udio2 from "@/assets/udio2.mp4";
import udio3 from "@/assets/udio3.mp4";
import udio4 from "@/assets/udio4.mp4";
import runwayvideo from "@/assets/runwayvideo.jpg";

const tools = {
  'chatgpt': {
    name: "ChatGPT",
    icon: <img src={chatgptlogo} alt="ChatGPT" className="w-full h-full object-contain" />,
    description: "ChatGPT is an advanced AI language model developed by OpenAI. It excels at natural language understanding, text generation, coding assistance, creative writing, and complex reasoning tasks.",
    category: "Text Generation",
    pricing: "Premium",
    rating: 4.8,
    reviews: 1247,
    website: "https://chat.openai.com",
    pros: ["Excellent natural language understanding", "Strong coding capabilities", "Regular model updates", "Plugin ecosystem", "Multi-modal support"],
    cons: ["Can hallucinate facts", "Knowledge cutoff date", "Requires subscription for best model", "Rate limits on free tier"],
    features: ["Text generation", "Code generation", "Image generation (DALL-E)", "File analysis", "Web browsing", "Custom GPTs"],
    pricingTiers: [
      { name: "Free", price: "$0", features: ["GPT-3.5 access", "Basic features"] },
      { name: "Plus", price: "$20/mo", features: ["GPT-4 access", "DALL-E", "Browsing", "Priority access"] },
      { name: "Team", price: "$25/mo", features: ["Everything in Plus", "Admin console", "Higher limits"] },
    ],
  },
  'midjourney': {
    name: "Midjourney",
    icon: <img src={midjourneylogo} alt="Midjourney" className="w-full h-full object-contain" />,
    description: "Midjourney is an AI-powered image generation service that creates stunning artwork from text prompts. Known for its artistic style and high-quality outputs.",
    category: "Image Generation",
    pricing: "Paid",
    rating: 4.7,
    reviews: 892,
    website: "https://midjourney.com",
    pros: ["Exceptional artistic quality", "Consistent style", "Active community", "Regular updates"],
    cons: ["Subscription required", "Learning curve", "Limited free trial"],
    features: ["Text-to-image generation", "Style customization", "Batch generation", "Community gallery"],
    pricingTiers: [
      { name: "Basic", price: "$10/mo", features: ["200 generations", "Basic styles"] },
      { name: "Standard", price: "$30/mo", features: ["Unlimited generations", "All styles"] },
      { name: "Pro", price: "$60/mo", features: ["Priority queue", "Commercial license"] },
    ],
  },
  'claude': {
    name: "Claude",
    icon: <img src={claudelogo} alt="Claude" className="w-full h-full object-contain" />,
    description: "Claude is an AI assistant known for being helpful, harmless, and honest. Excellent at analysis, writing, and complex reasoning tasks.",
    category: "Text Generation",
    pricing: "Premium",
    rating: 4.6,
    reviews: 756,
    website: "https://claude.ai",
    pros: ["Strong reasoning", "Large context window", "Safety focused", "Good for analysis"],
    cons: ["Slower responses", "Limited image capabilities", "Knowledge cutoff"],
    features: ["Text generation", "Code analysis", "Document review", "Conversation memory"],
    pricingTiers: [
      { name: "Free", price: "$0", features: ["Basic Claude", "Limited usage"] },
      { name: "Pro", price: "$20/mo", features: ["Claude 2", "Higher limits", "Priority access"] },
    ],
  },
  'cursor': {
    name: "Cursor",
    icon: <img src={cursorlogo} alt="Cursor" className="w-full h-full object-contain" />,
    description: "Cursor is an AI-powered code editor that helps developers write better code faster with intelligent suggestions and completions.",
    category: "Developer Tools",
    pricing: "Premium",
    rating: 4.5,
    reviews: 623,
    website: "https://cursor.sh",
    pros: ["Excellent code suggestions", "IDE integration", "Fast performance", "Multi-language support"],
    cons: ["Subscription for advanced features", "Learning curve", "Resource intensive"],
    features: ["AI code completion", "Code explanation", "Bug detection", "Refactoring suggestions"],
    pricingTiers: [
      { name: "Free", price: "$0", features: ["Basic suggestions", "200 requests/day"] },
      { name: "Pro", price: "$20/mo", features: ["Advanced AI", "Unlimited requests"] },
      { name: "Business", price: "$40/mo", features: ["Team features", "Priority support"] },
    ],
  },
  'runway': {
    name: "Runway",
    icon: <img src={runwaylogo} alt="Runway" className="w-full h-full object-contain" />,
    description: "Runway is an AI-powered video editing and generation platform for creative professionals. It offers advanced video manipulation, text-to-video generation, and AI-powered editing tools.",
    category: "Video",
    pricing: "Premium",
    rating: 4.5,
    reviews: 412,
    website: "https://runwayml.com",
    pros: ["Professional video tools", "Text-to-video generation", "High-quality output", "Regular updates"],
    cons: ["Learning curve", "Credit system", "Limited free tier"],
    features: ["Video generation", "Text-to-video", "Video editing", "AI effects"],
    pricingTiers: [
      { name: "Free", price: "$0", features: ["125 credits/month", "Basic features"] },
      { name: "Standard", price: "$15/mo", features: ["625 credits/month", "HD exports"] },
      { name: "Pro", price: "$35/mo", features: ["2250 credits/month", "4K exports", "Priority processing"] },
    ],
  },
  'jasper-ai': {
    name: "Jasper AI",
    icon: <img src={jasperlogo} alt="Jasper AI" className="w-full h-full object-contain" />,
    description: "Jasper AI is an AI-powered content creation platform designed for marketing teams and copywriters. It helps generate high-quality marketing copy, blog posts, and creative content.",
    category: "Marketing",
    pricing: "Paid",
    rating: 4.4,
    reviews: 892,
    website: "https://jasper.ai",
    pros: ["Marketing focused", "Brand voice training", "Template library", "SEO optimization"],
    cons: ["Expensive", "Learning curve", "Limited free trial"],
    features: ["Content generation", "Brand voice", "Templates", "SEO tools"],
    pricingTiers: [
      { name: "Creator", price: "$39/mo", features: ["1 user", "50+ templates", "Brand voice"] },
      { name: "Pro", price: "$99/mo", features: ["3 users", "Unlimited words", "Advanced features"] },
      { name: "Business", price: "$199/mo", features: ["10+ users", "API access", "Custom templates"] },
    ],
  },
  'elevenlabs': {
    name: "ElevenLabs",
    icon: <img src={elevenlabslogo} alt="ElevenLabs" className="w-full h-full object-contain" />,
    description: "ElevenLabs is an AI voice synthesis and cloning platform that creates realistic speech from text. Perfect for content creators, developers, and businesses.",
    category: "Audio",
    pricing: "Premium",
    rating: 4.5,
    reviews: 623,
    website: "https://elevenlabs.io",
    pros: ["Realistic voices", "Voice cloning", "Multiple languages", "Fast generation"],
    cons: ["Credit system", "Limited free tier", "Complex setup"],
    features: ["Text-to-speech", "Voice cloning", "Voice design", "Audio API"],
    pricingTiers: [
      { name: "Free", price: "$0", features: ["10,000 characters/month", "Basic voices"] },
      { name: "Starter", price: "$5/mo", features: ["30,000 characters/month", "Custom voices"] },
      { name: "Creator", price: "$22/mo", features: ["100,000 characters/month", "Instant voice cloning"] },
    ],
  },
  'perplexity': {
    name: "Perplexity",
    icon: <img src={perplexitylogo} alt="Perplexity" className="w-full h-full object-contain" />,
    description: "Perplexity is an AI-powered search engine that provides accurate, sourced answers to your questions. It combines AI with real-time web search for reliable information.",
    category: "Search",
    pricing: "Premium",
    rating: 4.6,
    reviews: 445,
    website: "https://perplexity.ai",
    pros: ["Real-time search", "Source citations", "Accurate answers", "Fast responses"],
    cons: ["Limited free features", "Sometimes slow", "Requires internet"],
    features: ["AI search", "Source citations", "Real-time data", "Conversation mode"],
    pricingTiers: [
      { name: "Free", price: "$0", features: ["Basic search", "Limited queries"] },
      { name: "Pro", price: "$20/mo", features: ["Unlimited queries", "Advanced models", "File upload"] },
      { name: "Enterprise", price: "Custom", features: ["API access", "Custom models", "Priority support"] },
    ],
  },
  'sora': {
    name: "Sora",
    icon: "📹",
    description: "Sora is OpenAI's revolutionary text-to-video model that creates realistic, high-quality video scenes from text descriptions. Pushing the boundaries of AI video generation.",
    category: "Video",
    pricing: "Paid",
    rating: 4.3,
    reviews: 312,
    website: "https://openai.com/sora",
    pros: ["High-quality output", "Realistic scenes", "Text-to-video", "OpenAI technology"],
    cons: ["Limited access", "Expensive", "Long generation times", "Usage limits"],
    features: ["Text-to-video", "Scene generation", "High resolution", "Realistic physics"],
    pricingTiers: [
      { name: "Basic", price: "$29/mo", features: ["100 credits/month", "720p videos"] },
      { name: "Pro", price: "$99/mo", features: ["500 credits/month", "1080p videos", "Priority queue"] },
      { name: "Enterprise", price: "Custom", features: ["Unlimited credits", "4K videos", "API access"] },
    ],
  },
  'devin': {
    name: "Devin",
    icon: "🛠️",
    description: "Devin is the world's first autonomous AI software engineer that can plan, code, debug, and deploy software projects independently. Revolutionizing development workflows.",
    category: "Developer Tools",
    pricing: "Paid",
    rating: 4.2,
    reviews: 278,
    website: "https://devin.ai",
    pros: ["Autonomous coding", "Full project handling", "Debugging skills", "Deployment automation"],
    cons: ["Very expensive", "Limited access", "Complex setup", "Learning curve"],
    features: ["Autonomous coding", "Project planning", "Debugging", "Deployment"],
    pricingTiers: [
      { name: "Individual", price: "$500/mo", features: ["Personal projects", "Basic support"] },
      { name: "Team", price: "$2000/mo", features: ["Team collaboration", "Advanced features"] },
      { name: "Enterprise", price: "Custom", features: ["Custom solutions", "Dedicated support", "SLA"] },
    ],
  },
  'gemini-ultra': {
    name: "Gemini Ultra",
    icon: "💎",
    description: "Gemini Ultra is Google's most capable AI model with multimodal reasoning abilities. Excels at complex tasks, coding, analysis, and understanding various data types.",
    category: "Text Generation",
    pricing: "Premium",
    rating: 4.5,
    reviews: 567,
    website: "https://gemini.google.com",
    pros: ["Multimodal capabilities", "Large context window", "Google integration", "Fast responses"],
    cons: ["Privacy concerns", "Inconsistent quality", "Limited API access"],
    features: ["Multimodal reasoning", "Code generation", "Image analysis", "Large context"],
    pricingTiers: [
      { name: "Free", price: "$0", features: ["Basic Gemini", "Limited usage"] },
      { name: "Advanced", price: "$20/mo", features: ["Gemini Ultra", "Higher limits", "Advanced features"] },
      { name: "API", price: "Custom", features: ["API access", "Enterprise features", "Priority support"] },
    ],
  },
  'udio': {
    name: "Udio",
    icon: "🎶",
    description: "Udio is an AI music generation platform that creates complete songs from text descriptions. Generate original music with vocals, instruments, and professional quality.",
    category: "Audio",
    pricing: "Premium",
    rating: 4.1,
    reviews: 234,
    website: "https://udio.com",
    pros: ["Full song generation", "High quality audio", "Multiple genres", "Fast generation"],
    cons: ["Limited free tier", "Credit system", "Genre limitations"],
    features: ["Text-to-music", "Song generation", "Multiple genres", "Vocal synthesis"],
    pricingTiers: [
      { name: "Free", price: "$0", features: ["10 songs/month", "Basic quality"] },
      { name: "Standard", price: "$10/mo", features: ["600 songs/month", "High quality"] },
      { name: "Pro", price: "$30/mo", features: ["Unlimited songs", "Premium quality", "Commercial rights"] },
    ],
  }
};

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
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

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
            setAllDbTools(result.data
              .filter((t: any) => t.name && t.name.trim() !== "")
              .map((t: any) => ({
                name: t.name,
                description: t.description,
                category: t.category,
                pricing: t.pricing,
                rating: parseFloat(t.rating) || 4.5,
                icon: t.icon_url
                  ? (t.icon_url.startsWith('http')
                    ? t.icon_url
                    : `${API_BASE_URL}/${t.icon_url.startsWith('/') ? t.icon_url.slice(1) : t.icon_url}`)
                  : (t.name ? t.name.charAt(0) : '?'),
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
              name: dbTool.name,
              icon: (() => {
                const nameLower = dbTool.name.toLowerCase();
                if (nameLower === "chatgpt") return <div className="p-3 rounded-lg bg-gray-900 w-full h-full flex items-center justify-center"><img src={chatgptlogo} alt="ChatGPT" className="w-full h-full object-contain" /></div>;
                if (nameLower === "midjourney") return <div className="p-3 rounded-lg bg-blue-900 w-full h-full flex items-center justify-center"><img src={midjourneylogo} alt="Midjourney" className="w-full h-full object-contain" /></div>;
                if (nameLower === "claude") return <div className="p-3 rounded-lg bg-orange-600 w-full h-full flex items-center justify-center"><img src={claudelogo} alt="Claude" className="w-full h-full object-contain" /></div>;
                if (nameLower === "runway") return <div className="p-3 rounded-lg bg-purple-700 w-full h-full flex items-center justify-center"><img src={runwaylogo} alt="Runway" className="w-full h-full object-contain" /></div>;
                if (nameLower === "jasper ai" || nameLower === "jasper") return <div className="p-3 rounded-lg bg-yellow-600 w-full h-full flex items-center justify-center"><img src={jasperlogo} alt="Jasper" className="w-full h-full object-contain" /></div>;
                if (nameLower === "cursor") return <div className="p-3 rounded-lg bg-green-700 w-full h-full flex items-center justify-center"><img src={cursorlogo} alt="Cursor" className="w-full h-full object-contain" /></div>;
                if (nameLower === "elevenlabs") return <div className="p-3 rounded-lg bg-gradient-to-br from-neutral-900 to-zinc-800 w-full h-full flex items-center justify-center"><img src={elevenlabslogo} alt="ElevenLabs" className="w-full h-full object-contain" /></div>;
                if (nameLower === "perplexity") return <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-700 to-teal-800 w-full h-full flex items-center justify-center"><img src={perplexitylogo} alt="Perplexity" className="w-full h-full object-contain" /></div>;

                return dbTool.icon_url ? (
                  <img
                    src={dbTool.icon_url.startsWith('http')
                      ? dbTool.icon_url
                      : `${API_BASE_URL}/${dbTool.icon_url.startsWith('/') ? dbTool.icon_url.slice(1) : dbTool.icon_url}`}
                    alt={dbTool.name}
                    className="w-full h-full object-contain"
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
              pricingTiers: safeParse(dbTool.pricing_tiers, []),
              media_urls: safeParse(dbTool.media_urls, []),
            };
          }
        }

        // Fallback to local mock data if not in DB
        if (!foundTool) {
          foundTool = tools[slug?.toLowerCase() || 'chatgpt'];
        }

        setTool(foundTool);
      } catch (error) {
        setTool(tools[slug?.toLowerCase() || 'chatgpt']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTool();
  }, [slug]);

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
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-5 md:pt-10"
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

      <div className="pt-24 pb-20">
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
              <div className="flex gap-3 flex-shrink-0">
                <a href={tool.website} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
                <Link to="/compare" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-colors">
                  Compare
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Screenshots */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                <div className="grid grid-cols-2 gap-4">
                  {tool.name === "ChatGPT" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={chatgpt1} alt="ChatGPT Screenshot 1" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={chatgpt2} alt="ChatGPT Screenshot 2" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={chatgpt3} alt="ChatGPT Screenshot 3" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={chatgpt4} alt="ChatGPT Screenshot 4" className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Midjourney" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={midjourney1} alt="Midjourney Screenshot 1" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={midjourney2} alt="Midjourney Screenshot 2" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={midjourney3} alt="Midjourney Screenshot 3" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={midjourney4} alt="Midjourney Screenshot 4" className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Claude" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={claude1} alt="Claude Screenshot 1" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={claude2} alt="Claude Screenshot 2" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={claude3} alt="Claude Screenshot 3" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={claude4} alt="Claude Screenshot 4" className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Cursor" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={cursor1} alt="Cursor Screenshot 1" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={cursor2} alt="Cursor Screenshot 2" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={cursor3} alt="Cursor Screenshot 3" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={cursor4} alt="Cursor Screenshot 4" className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Jasper AI" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={jasper1} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={jasper2} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={jasper3} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={jasper4} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "ElevenLabs" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={elevenlabs1} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={elevenlabs2} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={elevenlabs3} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={elevenlabs4} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Perplexity" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={perplexity1} alt="Perplexity Screenshot 1" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={perplexity2} alt="Perplexity Screenshot 2" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={perplexity3} alt="Perplexity Screenshot 3" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <img src={perplexity4} alt="Perplexity Screenshot 4" className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Sora" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={sora1} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={sora2} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={sora3} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={sora4} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Devin" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={devin1} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={devin2} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={devin3} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={devin4} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Gemini Ultra" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={geminiUltra1} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={geminiUltra2} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={geminiUltra3} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={geminiUltra4} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Udio" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={udio1} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={udio2} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={udio3} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={udio4} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.name === "Runway" && (
                    <>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={runway1} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={runway2} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={runway3} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                        <video src={runway4} autoPlay muted loop className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                  {tool.media_urls && tool.media_urls.length > 0 && (
                    <>
                      {tool.media_urls.map((url: string, i: number) => {
                        const fullUrl = url.startsWith('http')
                          ? url
                          : `${API_BASE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;

                        return (
                          <div key={i} className="aspect-video bg-black/50 border border-white/20 rounded-xl overflow-hidden">
                            <img src={fullUrl} alt={`${tool.name} Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </>
                  )}
                  {(!tool.media_urls || tool.media_urls.length === 0) && tool.name !== "ChatGPT" && tool.name !== "Midjourney" && tool.name !== "Claude" && tool.name !== "Cursor" && tool.name !== "Jasper AI" && tool.name !== "ElevenLabs" && tool.name !== "Perplexity" && tool.name !== "Sora" && tool.name !== "Devin" && tool.name !== "Gemini Ultra" && tool.name !== "Udio" && tool.name !== "Runway" && (
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
              </motion.div>

              {/* Features */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Key Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {tool.features?.map((f: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Reviews Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-6">
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
                          className="p-4 bg-secondary/50 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                                {(r.user_name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium text-foreground text-sm block">{r.user_name}</span>
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
                            <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(r.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{r.review_text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Pricing</h2>
                <div className="space-y-3">
                  {tool.pricingTiers?.map((tier: any, index: number) => (
                    <div key={index} className="p-4 bg-secondary/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{tier.name}</span>
                        <span className="text-primary font-semibold">{tier.price}</span>
                      </div>
                      <ul className="space-y-1">
                        {tier.features?.map((f: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-primary" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Pros & Cons */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Pros & Cons</h2>
                <div className="space-y-3 mb-4">
                  {tool.pros?.map((p: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{p}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {tool.cons?.map((c: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
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
