import { useState, useEffect, useCallback, useRef } from "react";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import chatgptLogo from "@/assets/chatgptlogo.png";
import midjourneyLogo from "@/assets/midjourney logo.png";
import claudeLogo from "@/assets/claude ai logo.png";
import runwayLogo from "@/assets/runway logo.png";
import jasperLogo from "@/assets/jasper logo.png";
import cursorLogo from "@/assets/cursor logo.png";
import elevenlabsLogo from "@/assets/elevenlabs logo.png";
import perplexityLogo from "@/assets/preplexity logo.png";

interface CarouselCard {
  name: string;
  description: string;
  category: string;
  rating: number;
  pricing: string;
  icon: string;
}

interface Carousel3DProps {
  items: CarouselCard[];
  autoRotateInterval?: number;
}

const Carousel3D = ({ items, autoRotateInterval = 3000 }: Carousel3DProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const total = items.length;
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent, toolName: string) => {
    e.preventDefault();
    const user = localStorage.getItem("user");
    if (!user) {
      toast("Authentication required", {
        description: "Please log in to view tool details.",
      });
      navigate("/login");
    } else {
      navigate(`/tool/${toolName.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  // Auto-rotate
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, autoRotateInterval);
    return () => clearInterval(timer);
  }, [isHovered, total, autoRotateInterval]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Drag/swipe support
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragStartX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX === null) return;
    const diff = e.clientX - dragStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) goNext();
      else goPrev();
    }
    setDragStartX(null);
  };

  const getCardStyle = (index: number) => {
    let offset = index - activeIndex;
    // Wrap around for circular effect
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);
    const isCenter = offset === 0;

    if (isMobile) {
      // Mobile: simple horizontal slide
      return {
        transform: `translateX(${offset * 105}%) scale(${isCenter ? 1 : 0.85})`,
        opacity: absOffset > 1 ? 0 : isCenter ? 1 : 0.5,
        zIndex: total - absOffset,
        filter: isCenter ? "none" : "blur(1px)",
      };
    }

    // Desktop: 3D circular perspective
    const angle = offset * (360 / Math.max(total, 5));
    const radius = 320;
    const radian = (angle * Math.PI) / 180;
    const translateX = Math.sin(radian) * radius;
    const translateZ = Math.cos(radian) * radius - radius;
    const scale = 0.65 + 0.35 * ((translateZ + radius) / radius);
    const opacity = Math.max(0.25, Math.min(1, 0.3 + 0.7 * ((translateZ + radius) / radius)));

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
      opacity,
      zIndex: Math.round((translateZ + radius) * 10),
      filter: absOffset === 0 ? "none" : `blur(${Math.min(absOffset * 0.8, 2)}px)`,
    };
  };

  // Dots indicator
  const dots = (
    <div className="flex items-center justify-center gap-2 mt-8">
      {items.map((_, i) => (
        <button
          key={i}
          onClick={() => setActiveIndex(i)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex
            ? "bg-primary w-6"
            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );

  return (
    <div className="relative w-full">
      {/* 3D Carousel Container */}
      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden"
        style={{
          perspective: isMobile ? "none" : "1200px",
          height: isMobile ? "420px" : "460px",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((tool, index) => {
            const style = getCardStyle(index);
            return (
              <motion.div
                key={`${tool.name}-${index}`}
                className="absolute w-[320px] sm:w-[360px]"
                animate={{
                  x: 0,
                  ...style,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                }}
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: style.zIndex,
                }}
              >
                <button onClick={(e) => handleCardClick(e, tool.name)} className="block w-full text-left group select-none">
                  <div className="bg-white text-gray-900 border border-[#f0f0f0] rounded-2xl p-8 hover:bg-[#F9FAFB] hover:scale-[1.05] hover:border-[#FFB347] transition-all duration-500 ease-in-out shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    {/* Icon Section */}
                    <div className="w-16 h-16 rounded-2xl bg-white/50 border border-slate-300 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-2">
                      {tool.name.toLowerCase() === "chatgpt" ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
                          <img src={chatgptLogo} alt="ChatGPT" className="w-8 h-8 object-contain" />
                        </div>
                      ) : tool.name.toLowerCase() === "midjourney" ? (
                        <div className="w-full h-full flex items-center justify-center bg-blue-900 rounded-lg">
                          <img src={midjourneyLogo} alt="Midjourney" className="w-8 h-8 object-contain" />
                        </div>
                      ) : tool.name.toLowerCase() === "claude" ? (
                        <div className="w-full h-full flex items-center justify-center bg-orange-600 rounded-lg">
                          <img src={claudeLogo} alt="Claude" className="w-8 h-8 object-contain" />
                        </div>
                      ) : tool.name.toLowerCase() === "runway" ? (
                        <div className="w-full h-full flex items-center justify-center bg-purple-700 rounded-lg">
                          <img src={runwayLogo} alt="Runway" className="w-8 h-8 object-contain" />
                        </div>
                      ) : tool.name.toLowerCase() === "jasper ai" || tool.name.toLowerCase() === "jasper" ? (
                        <div className="w-full h-full flex items-center justify-center bg-yellow-600 rounded-lg">
                          <img src={jasperLogo} alt="Jasper" className="w-8 h-8 object-contain" />
                        </div>
                      ) : tool.name.toLowerCase() === "cursor" ? (
                        <div className="w-full h-full flex items-center justify-center bg-green-700 rounded-lg">
                          <img src={cursorLogo} alt="Cursor" className="w-8 h-8 object-contain" />
                        </div>
                      ) : tool.name.toLowerCase() === "elevenlabs" ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-zinc-800 rounded-lg">
                          <img src={elevenlabsLogo} alt="ElevenLabs" className="w-8 h-8 object-contain" />
                        </div>
                      ) : tool.name.toLowerCase() === "perplexity" ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-700 to-teal-800 rounded-lg">
                          <img src={perplexityLogo} alt="Perplexity" className="w-8 h-8 object-contain" />
                        </div>
                      ) : tool.icon && (tool.icon.startsWith('http') || tool.icon.startsWith('/')) ? (
                        <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain" />
                      ) : (
                        <span>{tool.icon}</span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#FFB347] transition-colors duration-300">
                      {tool.name}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                      {tool.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 bg-white/50 px-3 py-2 rounded-lg border border-slate-300">
                        {tool.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
                        <span className="text-sm font-medium text-slate-900">{tool.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tool.pricing === "Paid"
                      ? "bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/30"
                      : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                      }`}>
                      {tool.pricing}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={goPrev}
          className="w-10 h-10 rounded-full border border-border bg-secondary/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:glow-border transition-all duration-300"
          aria-label="Previous slide"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goNext}
          className="w-10 h-10 rounded-full border border-border bg-secondary/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:glow-border transition-all duration-300"
          aria-label="Next slide"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
      {dots}
    </div>
  );
};

export default Carousel3D;
