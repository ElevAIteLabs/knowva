import { Check, Clock, Users, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { consultingServices } from "@/data/mockData";
import aiConsultingBg from "@/assets/aiconsultingtool.jpg";

const Consulting = () => {
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, [0, 500], [0, 40]);
  return (
    <>
      <section
        className="w-full min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${aiConsultingBg})` }}
      >
        <div className="bg-black/60 min-h-screen py-20">
          <Navbar />
          <div className="pt-40 pb-20">
            <div className="section-container">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                  AI <span className="text-gradient">Consulting</span>
                </h1>
                <p className="text-white/90 max-w-lg mx-auto">
                  Get expert guidance on selecting and implementing the right AI tools for your business
                </p>
              </motion.div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                {consultingServices.map((service, i) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ x }}
                    className={`bg-white text-gray-900 rounded-2xl shadow-xl p-8 flex flex-col ${service.popular ? "ring-2 ring-orange-500" : ""}`}
                  >
                    {service.popular && (
                      <span className="self-start px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-600 mb-4">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <div className="font-display text-2xl font-bold text-gray-900 mb-4">{service.price}</div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-3 rounded-xl transition-colors">
                      Get Started
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Booking Form */}
              <div className="flex justify-center items-center min-h-screen px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{ x }}
                  className="w-full max-w-xl p-6 rounded-2xl bg-white text-gray-900 shadow-xl"
                >
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Book a Consultation</h2>
                  <form className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full py-2 px-4 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full py-2 px-4 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Company</label>
                      <input
                        type="text"
                        className="w-full py-2 px-4 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Your company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Message</label>
                      <textarea
                        className="w-full py-2 px-4 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Tell us about your AI needs..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-3 rounded-xl transition-colors"
                    >
                      Send Message <ArrowRight className="w-4 h-4 ml-2 inline" />
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Consulting;
