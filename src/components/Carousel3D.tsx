import { useState, useEffect, useCallback, useRef } from "react";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
// Hardcoded logos removed

import { API_BASE_URL } from "@/config/apiConfig";

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

const Carousel3D = ({ items, autoRotateInterval = 2000 }: Carousel3DProps) => {
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

  // Auto-rotate consistently every 1.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, autoRotateInterval);
    return () => clearInterval(timer);
  }, [total, autoRotateInterval]);

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

    const rotateY = -offset * 30;
    const radius = 420;
    const radian = (offset * 35 * Math.PI) / 180;

    const translateX = Math.sin(radian) * radius * 1.6; // Increased multiplier to spread to edges
    const translateZ = Math.cos(radian) * radius - radius;

    // Dramatic scale difference for center focus
    const scale = isCenter ? 1.25 : 0.75 - (absOffset * 0.05);
    const opacity = isCenter ? 1 : Math.max(0.3, 0.6 - (absOffset * 0.1));

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex: Math.round((translateZ + radius) * 10),
      filter: isCenter ? "none" : `blur(${absOffset * 2}px) brightness(${0.4 + (0.6 * (1 - absOffset / (total / 2)))})`,
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
          perspective: isMobile ? "none" : "2500px",
          height: isMobile ? "480px" : "640px",
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
                className="absolute w-[300px] sm:w-[340px]"
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
                  perspective: "2000px"
                }}
              >
                <div className="relative group select-none">
                  {/* Outer Button Wrapper to preserve HTML semantics for accessibility */}
                  <button onClick={(e) => handleCardClick(e, tool.name)} className="block w-full text-left h-full focus:outline-none">
                    <div className="bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md overflow-hidden relative">

                      {/* Premium card reflection effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none"></div>


                      {/* Icon Section */}
                      <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-4xl mb-6 overflow-hidden shadow-inner p-2 relative z-10">
                        {tool.icon && (typeof tool.icon === 'string' && (tool.icon.replace(/^['"\[]|['"\]]$/g, '').trim().startsWith('http') || tool.icon.includes('.') || tool.icon.includes('/'))) ? (() => {
                          const cleanIcon = typeof tool.icon === 'string' ? tool.icon.replace(/^['"\[]|['"\]]$/g, '').trim() : '';
                          return (
                            <img
                              src={(() => {
                                if (cleanIcon.startsWith('http')) return cleanIcon;
                                const clean = cleanIcon.startsWith('/') ? cleanIcon.slice(1) : cleanIcon;
                                const final = clean.startsWith('uploads/') ? clean : `uploads/${clean}`;
                                return `${API_BASE_URL}/${final}`;
                              })()}
                              alt={tool.name}
                              className="w-full h-full object-contain drop-shadow"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.parentElement) {
                                  target.parentElement.innerHTML = `<span class="text-foreground text-xl font-black font-display">${tool.name.charAt(0)}</span>`;
                                }
                              }}
                            />
                          );
                        })() : (
                          <span className="text-foreground text-xl font-black font-display">
                            {((typeof tool.icon === 'string' && tool.icon.length < 5) ? tool.icon : (tool.name ? tool.name.charAt(0) : '?'))}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="font-display text-2xl font-bold text-foreground mb-3 transition-colors duration-300">
                          {tool.name}
                        </h3>
                        <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3 font-light">
                          {tool.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                            {tool.category}
                          </span>
                          <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-bold text-foreground">{tool.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                  {/* Pricing Badge floats outside the absolute button flow but inside relative container */}
                  <div className="absolute top-6 right-6 pointer-events-none z-20">
                    <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${tool.pricing === "Paid"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                      }`}>
                      {tool.pricing}
                    </span>
                  </div>
                </div>
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
