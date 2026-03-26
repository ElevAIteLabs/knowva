import { Check, BarChart3, Users, Zap, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { providerPlans } from "@/data/mockData";

const benefits = [
  { icon: Users, title: "Targeted Exposure", description: "Reach thousands of qualified users actively searching for AI tools." },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Track views, clicks, and conversions with detailed analytics." },
  { icon: Zap, title: "Featured Placement", description: "Get priority placement in search results and category pages." },
  { icon: Globe, title: "Global Reach", description: "Connect with developers, startups, and enterprises worldwide." },
];

const Providers = () => {
  return (
    <>
      {/* Hero Section with Gradient */}
      <section
        className="w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-background flex items-center justify-center relative overflow-hidden"
      >
        <Navbar />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-40 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              For AI <span className="text-gradient">Providers</span>
            </h1>
            <p className="text-white/90 max-w-lg mx-auto mb-8">
              List your AI tool on KNOWva and reach thousands of potential users
            </p>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Submit Your AI Tool <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <b.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Second Section: Pricing Cards */}
      <section className="relative py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl font-bold text-center mb-12 text-foreground">Listing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providerPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 bg-card flex flex-col max-w-sm rounded-2xl shadow-lg border border-border ${plan.popular ? "ring-2 ring-primary/20" : ""}`}
              >
                {plan.popular && (
                  <span className="self-start px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-4">
                    Recommended
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold mb-1 text-foreground">{plan.name}</h3>
                <div className="font-display text-2xl font-bold mb-4 text-foreground">{plan.price}</div>
                <ul className="space-y-3 mb-6 flex-1 text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-medium text-sm transition-colors duration-300 bg-foreground text-background hover:opacity-90`}>
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Third Section: Submit Tool CTA */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background text-center">
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card glow-box glow-border p-10 md:p-14 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Ready to Get <span className="text-gradient">Discovered</span>?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Submit your AI tool today and start reaching qualified users immediately.
            </p>
            <button className="bg-primary hover:bg-primary/90 text-black px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105">
              Submit Your AI Tool
            </button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Providers;
