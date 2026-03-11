import { Star, ExternalLink, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import chatgptLogo from "@/assets/chatgptlogo.png";
import midjourneyLogo from "@/assets/midjourney logo.png";
import claudeLogo from "@/assets/claude ai logo.png";
import runwayLogo from "@/assets/runway logo.png";
import jasperLogo from "@/assets/jasper logo.png";
import cursorLogo from "@/assets/cursor logo.png";
import elevenlabsLogo from "@/assets/elevenlabs logo.png";
import perplexityLogo from "@/assets/preplexity logo.png";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ToolCardProps {
  name: string;
  description: string;
  category: string;
  rating: number;
  pricing: string;
  icon: string;
  delay?: number;
}

const ToolCard = ({ name, description, category, rating, pricing, icon, delay = 0 }: ToolCardProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const user = localStorage.getItem("user");
    if (!user) {
      toast("Authentication required", {
        description: "Please log in to view tool details.",
      });
      navigate("/login");
    } else {
      navigate(`/tool/${name.toLowerCase().replace(/\s+/g, '-')}`);
    }
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

          <div className="flex items-start justify-between mb-6 relative">
            <div className="w-fit">
              <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center p-3 shadow-sm group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 overflow-hidden">
                {name.toLowerCase() === "chatgpt" ? (
                  <img src={chatgptLogo} alt="ChatGPT" className="w-8 h-8 object-contain drop-shadow" />
                ) : name.toLowerCase() === "midjourney" ? (
                  <img src={midjourneyLogo} alt="Midjourney" className="w-8 h-8 object-contain drop-shadow" />
                ) : name.toLowerCase() === "claude" ? (
                  <img src={claudeLogo} alt="Claude" className="w-8 h-8 object-contain drop-shadow" />
                ) : name.toLowerCase() === "runway" ? (
                  <img src={runwayLogo} alt="Runway" className="w-8 h-8 object-contain drop-shadow" />
                ) : name.toLowerCase() === "jasper ai" || name.toLowerCase() === "jasper" ? (
                  <img src={jasperLogo} alt="Jasper" className="w-8 h-8 object-contain drop-shadow" />
                ) : name.toLowerCase() === "cursor" ? (
                  <img src={cursorLogo} alt="Cursor" className="w-8 h-8 object-contain drop-shadow" />
                ) : name.toLowerCase() === "elevenlabs" ? (
                  <img src={elevenlabsLogo} alt="ElevenLabs" className="w-8 h-8 object-contain drop-shadow" />
                ) : name.toLowerCase() === "perplexity" ? (
                  <img src={perplexityLogo} alt="Perplexity" className="w-8 h-8 object-contain drop-shadow" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    {icon && (icon.startsWith('http') || icon.startsWith('/')) ? (
                      <img src={icon} alt={name} className="w-full h-full object-contain drop-shadow" />
                    ) : (
                      <span className="text-foreground text-xl font-black font-display">{icon}</span>
                    )}
                  </div>
                )}
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
    </motion.div>
  );
};

export default ToolCard;
