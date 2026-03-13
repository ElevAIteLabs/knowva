import { Star, ExternalLink, ArrowUpRight, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// Hardcoded logos removed


import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/apiConfig";
import { useState, useEffect } from "react";

interface ToolCardProps {
  id?: number;
  name: string;
  description: string;
  category: string;
  rating: number;
  pricing: string;
  icon: string;
  delay?: number;
}

const ToolCard = ({ id, name, description, category, rating, pricing, icon, delay = 0 }: ToolCardProps) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (currentUser && id) {
      checkIfSaved();
    }
  }, [id, currentUser?.id]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SAVED_TOOLS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check",
          user_id: currentUser.id,
          tool_id: id,
        }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setIsSaved(result.saved);
      }
    } catch (e) {
      console.error("Error checking saved status", e);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      toast("Authentication required", {
        description: "Please log in to save tools.",
      });
      navigate("/login");
      return;
    }

    if (!id) return;

    setIsSaving(true);
    try {
      const action = isSaved ? "unsave" : "save";
      const response = await fetch(API_ENDPOINTS.SAVED_TOOLS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          user_id: currentUser.id,
          tool_id: id,
        }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from saved" : "Saved to your profile!");
      }
    } catch (e) {
      toast.error("Failed to update saved status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast("Authentication required", {
        description: "Please log in to view tool details.",
      });
      navigate("/login");
    } else {
      navigate(`/tool/${name.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const safeGetIcon = (iconInput: any) => {
    if (!iconInput) return null;
    if (typeof iconInput !== 'string') return null;
    let cleanIcon = iconInput.replace(/^['"\[]|['"\]]$/g, '').trim();
    if (!cleanIcon) return null;
    if (cleanIcon.startsWith('http')) return cleanIcon;
    
    // Ensure relative paths have uploads/ prefix if they are likely just filenames
    let cleanPath = cleanIcon.startsWith('/') ? cleanIcon.slice(1) : cleanIcon;
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }
    return `${API_BASE_URL}/${cleanPath}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <button onClick={handleClick} className="block w-full text-left group h-full focus:outline-none">
        <div className="flex flex-col h-full bg-card text-card-foreground border border-border rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,179,71,0.08)] hover:border-primary/40 relative overflow-hidden backdrop-blur-sm z-10">

          {/* Subtle Background Glow Animation on Hover */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none z-[-1]"></div>

          {/* Bookmark Button */}
          <button
            onClick={handleSave}
            className={`absolute top-16 right-5 z-[20] p-2.5 rounded-xl transition-all duration-300 backdrop-blur-md border ${isSaved
              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(255,179,71,0.3)]"
              : "bg-background/40 text-muted-foreground border-white/10 hover:border-primary/50 hover:text-primary"
              }`}
            disabled={isSaving}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
          </button>

          <div className="flex items-start justify-between mb-6 relative">
            <div className="w-fit">
              <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center p-3 shadow-sm group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 overflow-hidden text-foreground">
                <div className="flex items-center justify-center w-full h-full">
                  {icon && (typeof icon === 'string' && (icon.replace(/^['"\[]|['"\]]$/g, '').trim().startsWith('http') || icon.includes('.') || icon.includes('/'))) ? (
                    <img
                      src={safeGetIcon(icon) || ''}
                      alt={name}
                      className="w-full h-full object-contain drop-shadow"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `<span class="text-foreground text-xl font-black font-display">${name.charAt(0)}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-foreground text-xl font-black font-display">
                      {((typeof icon === 'string' && icon.length < 5) ? icon : (name ? name.charAt(0) : '?'))}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full bg-secondary text-secondary-foreground border border-border group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                {pricing}
              </span>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center rotate-0 group-hover:bg-primary group-hover:text-background transition-all duration-500">
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-background transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed font-light">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
            <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
              {category}
            </span>
            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-bold text-foreground">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </button>
    </motion.div >
  );
};

export default ToolCard;
