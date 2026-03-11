import { Check, X, Star, Layers, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { comparisonTools } from "@/data/mockData";
import compareaitools from "@/assets/compareaitools.jpg";
import chatgptlogo from "@/assets/chatgptlogo.png";
import claudelogo from "@/assets/claude ai logo.png";
import geminilogo from "@/assets/geminilogo.png";

const features = [
  { label: "Pricing", key: "pricing" },
  { label: "Rating", key: "rating" },
  { label: "Best For", key: "bestFor" },
  { label: "Context Window", key: "contextWindow" },
  { label: "Speed", key: "speed" },
  { label: "API Access", key: "apiAccess", boolean: true },
  { label: "Free Trial", key: "freeTrial", boolean: true },
  { label: "Code Generation", key: "codeGen", boolean: true },
  { label: "Image Generation", key: "imageGen", boolean: true },
];

const Compare = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <div className="pt-36 pb-32 relative overflow-hidden border-b border-border" 
           style={{
             backgroundImage: `url(${compareaitools})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }}>
        {/* Deep dark gradient overlay compatible with dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background backdrop-blur-sm" />
        
        <div className="relative section-container z-10 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6 tracking-wide uppercase">
                <Layers className="w-4 h-4" />
                Side-By-Side Analysis
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tight">
              Compare AI Tools <span className="gradient-text glow-effect drop-shadow-sm">Side by Side</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light">
              Evaluate features, pricing, and technical capabilities to find the perfect foundation for your workflow.
            </p>
          </motion.div>

          {/* Compare Cards Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4"
          >
            {comparisonTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card backdrop-blur-md rounded-3xl border border-border shadow-[0_20px_40px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,179,71,0.08)] hover:border-primary/40 transition-all duration-500 group relative"
              >
                
                {/* Dynamic Inner Glow */}
                <div className={`absolute top-0 inset-x-0 h-40 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-3xl pointer-events-none -z-10 bg-gradient-to-b ${
                    tool.name === 'ChatGPT' ? 'from-green-500' :
                    tool.name === 'Claude' ? 'from-orange-500' :
                    'from-blue-500'
                  }`}
                />

                {/* Card Header */}
                <div className="p-8 pb-0 text-center relative z-10 flex-col items-center">
                  <div className={`w-20 h-20 mx-auto rounded-3xl mb-6 flex items-center justify-center shadow-inner relative group-hover:scale-110 transition-transform duration-500 ${
                    tool.name === 'ChatGPT' ? 'bg-gradient-to-br from-teal-500/20 to-emerald-600/20 border border-teal-500/30' :
                    tool.name === 'Claude' ? 'bg-gradient-to-br from-orange-400/20 to-red-500/20 border border-orange-500/30' :
                    'bg-gradient-to-br from-blue-400/20 to-indigo-600/20 border border-blue-500/30'
                  }`}>
                    {tool.name === 'ChatGPT' ? <img src={chatgptlogo} alt="ChatGPT" className="w-10 h-10 object-contain drop-shadow" /> : 
                     tool.name === 'Claude' ? <img src={claudelogo} alt="Claude" className="w-10 h-10 object-contain drop-shadow" /> : 
                     tool.name === 'Gemini' ? <img src={geminilogo} alt="Gemini" className="w-10 h-10 object-contain drop-shadow" /> : 
                     <span className="text-3xl">{tool.icon}</span>}
                  </div>
                  
                  <h3 className="font-display text-3xl font-black text-foreground mb-3">{tool.name}</h3>
                  <div className="inline-flex items-center justify-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg mb-6">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-bold text-foreground">{tool.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-border mx-auto mb-6"></div>

                {/* Features List */}
                <div className="px-8 pb-8 flex-1 flex flex-col">
                  <div className="space-y-4 mb-8 flex-1">
                    {features.map((feature) => {
                      const val = (tool as any)[feature.key];
                      return (
                        <div key={feature.label} className="flex items-center justify-between text-sm group/feature">
                          <span className="text-muted-foreground font-medium">{feature.label}</span>
                          <span className="text-foreground font-bold text-right flex items-center justify-end">
                            {feature.boolean ? (
                                val ? (
                                    <div className="bg-emerald-500/10 p-1 rounded-md border border-emerald-500/20"><Check className="w-4 h-4 text-emerald-500" /></div>
                                ) : (
                                    <div className="bg-destructive/10 p-1 rounded-md border border-destructive/20"><X className="w-4 h-4 text-destructive" /></div>
                                )
                            ) : (
                              val
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Get Started Button */}
                  <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.02] ${
                    tool.name === 'ChatGPT' ? 'bg-teal-500 hover:bg-teal-600 hover:shadow-teal-500/30 text-white' :
                    tool.name === 'Claude' ? 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-600/30 text-white' :
                    'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30 text-white'
                  }`}>
                    Deploy {tool.name} <Zap className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Compare;
