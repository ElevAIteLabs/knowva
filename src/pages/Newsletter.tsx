import { Mail, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const newsletters = [
  { title: "AI Tools Weekly #47 – Sora Goes Public", date: "Feb 7, 2026", description: "OpenAI's video model is finally available. Plus: 5 new developer tools and a deep dive into AI code editors." },
  { title: "AI Tools Weekly #46 – The Rise of AI Agents", date: "Jan 31, 2026", description: "Autonomous AI agents are changing how teams work. We compare the top 8 agent frameworks." },
  { title: "AI Tools Weekly #45 – Best Free AI Tools of 2026", date: "Jan 24, 2026", description: "Our curated list of the best free AI tools for developers, marketers, and creators." },
  { title: "AI Tools Weekly #44 – Enterprise AI Trends", date: "Jan 17, 2026", description: "How enterprises are adopting AI in 2026. Featuring insights from 200+ companies." },
  { title: "AI Tools Weekly #43 – Audio AI Revolution", date: "Jan 10, 2026", description: "Voice cloning, music generation, and podcast AI — the audio space is exploding." },
];

const Newsletter = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-background">
      <Navbar />
      <div className="pt-40 pb-20">
        <div className="section-container">
          {/* Subscribe Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card glow-box glow-border p-10 md:p-14 text-center max-w-2xl mx-auto mb-16"
          >
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              AI Tools <span className="text-gradient">Weekly</span>
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join 15,000+ professionals getting the latest AI tool launches, updates, and expert insights every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <button className="px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors whitespace-nowrap">
                Subscribe Free
              </button>
            </div>
          </motion.div>

          {/* Archive */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Newsletter Archive</h2>
            <div className="space-y-4">
              {newsletters.map((n, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 hover:glow-border transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">{n.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{n.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> {n.date}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Newsletter;
