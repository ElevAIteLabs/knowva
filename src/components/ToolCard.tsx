import { Star, ExternalLink } from "lucide-react";
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
      transition={{ duration: 0.4, delay }}
    >
      <button onClick={handleClick} className="block w-full text-left group">
        <div className="bg-white text-slate-900 border border-[#f0f0f0] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFB347] hover:shadow-[0_8px_25px_rgba(255,179,71,0.15)] relative overflow-hidden group">
          {/* White stroke/glow effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border-2 border-white/20"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)]"></div>
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-fit">
              {name.toLowerCase() === "chatgpt" ? (
                <div className="p-3 rounded-lg bg-gray-900">
                  <img src={chatgptLogo} alt="ChatGPT" className="w-5 h-5 object-contain" />
                </div>
              ) : name.toLowerCase() === "midjourney" ? (
                <div className="p-3 rounded-lg bg-blue-900">
                  <img src={midjourneyLogo} alt="Midjourney" className="w-5 h-5 object-contain" />
                </div>
              ) : name.toLowerCase() === "claude" ? (
                <div className="p-3 rounded-lg bg-orange-600">
                  <img src={claudeLogo} alt="Claude" className="w-5 h-5 object-contain" />
                </div>
              ) : name.toLowerCase() === "runway" ? (
                <div className="p-3 rounded-lg bg-purple-700">
                  <img src={runwayLogo} alt="Runway" className="w-5 h-5 object-contain" />
                </div>
              ) : name.toLowerCase() === "jasper ai" || name.toLowerCase() === "jasper" ? (
                <div className="p-3 rounded-lg bg-yellow-600">
                  <img src={jasperLogo} alt="Jasper" className="w-5 h-5 object-contain" />
                </div>
              ) : name.toLowerCase() === "cursor" ? (
                <div className="p-3 rounded-lg bg-green-700">
                  <img src={cursorLogo} alt="Cursor" className="w-5 h-5 object-contain" />
                </div>
              ) : name.toLowerCase() === "elevenlabs" ? (
                <div className="p-3 rounded-lg bg-gradient-to-br from-neutral-900 to-zinc-800">
                  <img src={elevenlabsLogo} alt="ElevenLabs" className="w-5 h-5 object-contain" />
                </div>
              ) : name.toLowerCase() === "perplexity" ? (
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-700 to-teal-800">
                  <img src={perplexityLogo} alt="Perplexity" className="w-5 h-5 object-contain" />
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-gray-900 flex items-center justify-center">
                  {icon && (icon.startsWith('http') || icon.startsWith('/')) ? (
                    <img src={icon} alt={name} className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-white text-sm font-bold">{icon}</span>
                  )}
                </div>
              )}
            </div>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
              {pricing}
            </span>
          </div>

          <h3 className="font-display font-semibold text-slate-900 mb-1.5 group-hover:text-[#FFB347] transition-colors">
            {name}
          </h3>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 bg-white/50 px-2.5 py-1 rounded-md">{category}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
              <span className="text-sm font-medium text-slate-900">{rating}</span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

export default ToolCard;
