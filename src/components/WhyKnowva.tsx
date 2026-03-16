import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  Lightbulb,
  Mail,
  ShieldCheck,
  Upload,
  Star,
  Sparkles,
  MessageCircle,
  Bell,
  ArrowRight,
} from "lucide-react";

interface WhyCard {
  title: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  floatingIcons: React.ReactNode[];
  cta: string;
  ctaLink: string;
  accentColor: string;
}

const cards: WhyCard[] = [
  {
    title: "Discover & Compare",
    description:
      "Explore, filter, and compare AI tools in seconds - all in one unified place.",
    badge: "Fast Engine",
    icon: <ArrowLeftRight className="w-6 h-6" />,
    floatingIcons: [
      <Sparkles key="s" className="w-4 h-4" />,
      <Star key="st" className="w-3.5 h-3.5" />,
    ],
    cta: "Explore Tools",
    ctaLink: "/categories",
    accentColor: "from-orange-500/20 to-amber-500/10",
  },
  {
    title: "Smart Matches",
    description:
      "Personalized AI tool matches based on your specific goals and industry.",
    badge: "AI Powered",
    icon: <Lightbulb className="w-6 h-6" />,
    floatingIcons: [
      <Sparkles key="s" className="w-4 h-4" />,
      <Star key="st" className="w-3.5 h-3.5" />,
    ],
    cta: "Get Matched",
    ctaLink: "/categories",
    accentColor: "from-cyan-500/20 to-blue-500/10",
  },
  {
    title: "Stay Ahead",
    description:
      "Get the newest AI tools, trends, and actionable insights straight to your inbox.",
    badge: "Fresh Content",
    icon: <Mail className="w-6 h-6" />,
    floatingIcons: [
      <Bell key="b" className="w-4 h-4" />,
      <MessageCircle key="m" className="w-3.5 h-3.5" />,
    ],
    cta: "Subscribe",
    ctaLink: "/newsletter",
    accentColor: "from-purple-500/20 to-violet-500/10",
  },
  {
    title: "Enterprise Trust",
    description:
      "Make confident decisions with verified tools and authentic user ratings.",
    badge: "Verified Data",
    icon: <ShieldCheck className="w-6 h-6" />,
    floatingIcons: [
      <Star key="s1" className="w-4 h-4" />,
      <ShieldCheck key="s2" className="w-3.5 h-3.5" />,
    ],
    cta: "See Reviews",
    ctaLink: "/categories",
    accentColor: "from-emerald-500/20 to-teal-500/10",
  },
  {
    title: "For Creators",
    description:
      "Launch your tool, track performance, and reach millions of developers.",
    badge: "Scale Growth",
    icon: <Upload className="w-6 h-6" />,
    floatingIcons: [
      <Sparkles key="s" className="w-4 h-4" />,
      <ArrowRight key="a" className="w-3.5 h-3.5" />,
    ],
    cta: "Submit Now",
    ctaLink: "/providers",
    accentColor: "from-rose-500/20 to-pink-500/10",
  },
];

const ParallaxCard = ({
  card,
  index,
}: {
  card: WhyCard;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x, y });
  };

  const handleMouseLeave = () => {
    setMouse({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      className="relative flex-shrink-0 w-[280px] sm:w-[320px] lg:w-full h-full flex flex-col"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative h-full rounded-3xl overflow-hidden border border-border bg-card"
        animate={{
          rotateY: mouse.x * 6,
          rotateX: -mouse.y * 4,
          scale: hovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >


        {/* Floating icons — foreground parallax */}
        {card.floatingIcons.map((icon, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/40 z-0 pointer-events-none"
            animate={{
              x: mouse.x * (20 + i * 15),
              y: mouse.y * (15 + i * 10),
            }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            style={{
              top: i === 0 ? "15%" : "auto",
              bottom: i === 1 ? "15%" : "auto",
              right: i === 0 ? "10%" : "auto",
              left: i === 1 ? "10%" : "auto",
            }}
          >
            {icon}
          </motion.div>
        ))}

        {/* Mid-layer content */}
        <motion.div
          className="relative z-10 p-6 sm:p-8 flex flex-col h-full min-h-[320px] flex-1 backdrop-blur-sm"
          animate={{
            x: mouse.x * 4,
            y: mouse.y * 3,
            translateZ: hovered ? 20 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Badge */}
          <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-wider font-bold mb-6">
            <Sparkles className="w-3 h-3" />
            {card.badge}
          </span>

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary mb-5">
            {card.icon}
          </div>

          {/* Title */}
          <h3 className="font-display text-xl font-bold text-foreground mb-3 leading-snug">
            {card.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1 font-light">
            {card.description}
          </p>

          {/* CTA */}
          <Link
            to={card.ctaLink}
            className="inline-flex justify-self-end mt-auto items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary transition-colors group"
          >
            {card.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const WhyKnowva = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent pointer-events-none" />
      
      <div className="section-container relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6 tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            Enterprise Infrastructure
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
            The Intelligent <span className="gradient-text">Discovery Hub</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light">
            Everything you need to find, compare, and trust the right AI tools—built into a single platform.
          </p>
        </motion.div>
        
        {/* Cards */}
        <div className="w-full">
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0 lg:items-stretch lg:gap-4 xl:gap-6">
            {cards.map((card, i) => (
              <div key={card.title} className="snap-center lg:h-full lg:flex lg:flex-col">
                <div className="flex-1 w-full h-full">
                  <ParallaxCard card={card} index={i} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyKnowva;
