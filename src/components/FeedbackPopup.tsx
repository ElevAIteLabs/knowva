import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/config/apiConfig";

const FeedbackPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
    })();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackText.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(API_ENDPOINTS.FEEDBACK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser?.id || null,
                    user_name: currentUser?.fullName || "Anonymous",
                    user_email: currentUser?.email || "N/A",
                    message: feedbackText.trim(),
                }),
            });
            
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Thank you for your feedback!");
                setFeedbackText("");
                setIsOpen(false);
            } else {
                toast.error(result.message || "Failed to submit feedback.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquarePlus size={18} className="text-primary" />
                                <h3 className="font-bold text-slate-800 dark:text-white">Send Feedback</h3>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-white/10"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Let us know how we can improve your experience or report any issues you've found.
                            </p>
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Tell us what you think..."
                                rows={4}
                                required
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all dark:text-white custom-scrollbar resize-none"
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting || !feedbackText.trim()}
                                className="w-full bg-primary text-black font-bold h-10 rounded-xl hover:bg-primary/90 transition-all"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                                {isSubmitting ? "Sending..." : "Send Feedback"}
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full shadow-xl flex items-center justify-center border-2 border-transparent hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                aria-label="Feedback"
            >
                {isOpen ? <X size={20} /> : <MessageSquarePlus size={20} />}
            </motion.button>
        </div>
    );
};

export default FeedbackPopup;
