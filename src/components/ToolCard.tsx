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
        <div className="flex flex-col h-full bg-card text-card-foreground border border-border rounded-2xl md:rounded-3xl p-3 sm:p-6 transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 relative overflow-hidden backdrop-blur-sm z-10">




          <div className="flex items-start justify-between mb-3 sm:mb-4 relative">
            <div className="w-fit">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-secondary/80 border border-border flex items-center justify-center p-2 sm:p-2.5 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 overflow-hidden text-foreground">
                <div className="flex items-center justify-center w-full h-full">
                  {icon && (typeof icon === 'string' && (icon.replace(/^['"\[]|['"\]]$/g, '').trim().startsWith('http') || icon.includes('.') || icon.includes('/'))) ? (
                    <img
                      src={safeGetIcon(icon) || ''}
                      alt={name}
                      className="w-full h-full object-contain"
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:inline-block px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full bg-secondary text-secondary-foreground border border-border group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                {pricing}
              </span>
              <button
                onClick={handleSave}
                className={`p-1.5 sm:p-2.5 rounded-lg transition-all duration-300 backdrop-blur-md border z-[20] ${isSaved
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/40 text-muted-foreground border-white/10 hover:border-primary/50 hover:text-primary"
                  }`}
                disabled={isSaving}
              >
                <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base sm:text-xl font-display font-bold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-[11px] sm:text-sm text-muted-foreground mb-4 sm:mb-6 line-clamp-2 leading-relaxed font-light">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 sm:pt-4 border-t border-border mt-auto gap-2 sm:gap-0">
            <span className="text-[9px] sm:text-xs font-medium text-muted-foreground bg-secondary/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-border/50 truncate max-w-[80px] sm:max-w-none">
              {category}
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-yellow-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-yellow-500/20 self-end sm:self-auto">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-[11px] sm:text-sm font-bold text-foreground">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </button>
    </motion.div >
  );
};

export default ToolCard;
