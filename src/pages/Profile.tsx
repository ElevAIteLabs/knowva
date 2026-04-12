import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, CheckCircle2, User, Mail, Phone, Lock, ShieldCheck, Bookmark, Settings, LogOut, Loader2, Sparkles, Star, MessageSquare, Pin, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_ENDPOINTS } from "@/config/apiConfig";
import { motion, AnimatePresence } from "framer-motion";
import ToolCard from "@/components/ToolCard";

const profileSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits." }),
    linkedinUrl: z.string().url({ message: "Invalid URL." }).or(z.literal("")),
    password: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [savedBanner, setSavedBanner] = useState(false);
    const [originalValues, setOriginalValues] = useState<Partial<ProfileFormValues>>({});
    const [activeTab, setActiveTab] = useState<"settings" | "saved" | "reviews" | "questions">("settings");
    const [savedTools, setSavedTools] = useState<any[]>([]);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [userQuestions, setUserQuestions] = useState<any[]>([]);
    const [isToolsLoading, setIsToolsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const navigate = useNavigate();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { fullName: "", email: "", mobile: "", linkedinUrl: "", password: "" },
    });

    const watchedValues = form.watch();

    // Detect if anything changed from the last saved state
    const isDirty =
        watchedValues.fullName !== originalValues.fullName ||
        watchedValues.email !== originalValues.email ||
        watchedValues.mobile !== originalValues.mobile ||
        watchedValues.linkedinUrl !== originalValues.linkedinUrl ||
        !!(watchedValues.password && watchedValues.password.trim() !== "");

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            toast.error("Please log in to manage your profile.");
            navigate("/login");
            return;
        }
        const user = JSON.parse(userStr);
        setUserId(user.id);
        const vals = {
            fullName: user.fullName || "",
            email: user.email || "",
            mobile: user.mobile || "",
            linkedinUrl: user.linkedin_url || "",
            password: "",
        };
        form.reset(vals);
        setOriginalValues(vals);

        // Refresh all data on mount to ensure sidebar stats are correct
        fetchSavedTools(user.id);
        fetchUserReviews(user.id);
        fetchUserQuestions(user.id);
    }, [navigate, form, activeTab]); // Added activeTab to ensure sidebar stats refresh on tab change

    const fetchSavedTools = async (uid: number) => {
        setIsToolsLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.SAVED_TOOLS}?user_id=${uid}`);
            const result = await response.json();
            if (result.status === "success") {
                setSavedTools(result.data.map((t: any) => ({
                    ...t,
                    rating: parseFloat(t.rating) || 4.5,
                    icon: (() => {
                        let url = t.icon_url || "";
                        if (url.startsWith('[') && url.endsWith(']')) {
                            try { const parsed = JSON.parse(url); if (Array.isArray(parsed)) url = parsed[0]; } catch { }
                        }
                        return url;
                    })()
                })));
            }
        } catch (e) {
            toast.error("Failed to load saved tools");
        } finally {
            setIsToolsLoading(false);
        }
    };

    const fetchUserReviews = async (uid: number) => {
        setIsDataLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.REVIEWS}?user_id=${uid}`);
            const result = await response.json();
            if (result.status === "success") setUserReviews(result.data);
        } catch { toast.error("Failed to load reviews"); }
        finally { setIsDataLoading(false); }
    };

    const fetchUserQuestions = async (uid: number) => {
        setIsDataLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.COMMUNITY}?user_id=${uid}`);
            const result = await response.json();
            if (result.status === "success") setUserQuestions(result.data);
        } catch { toast.error("Failed to load questions"); }
        finally { setIsDataLoading(false); }
    };

    const handleDeleteDiscussion = async (e: React.MouseEvent, threadId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userId) return;
        if (!window.confirm("Delete this discussion permanently?")) return;

        try {
            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "delete",
                    user_id: userId,
                    thread_id: threadId
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Discussion deleted");
                fetchUserQuestions(userId);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Deletion failed");
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.AUTH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update_profile",
                    id: userId,
                    fullName: data.fullName,
                    email: data.email,
                    mobile: data.mobile,
                    linkedin_url: data.linkedinUrl,
                    password: data.password?.trim() || undefined,
                }),
            });
            const result = await response.json();

            if (result.status === "success") {
                // Persist updated user to localStorage
                localStorage.setItem("user", JSON.stringify(result.user));
                window.dispatchEvent(new Event("storage"));

                // Reset form to freshly saved values
                const newVals = {
                    fullName: result.user.fullName || data.fullName,
                    email: result.user.email || data.email,
                    mobile: result.user.mobile || data.mobile,
                    linkedinUrl: result.user.linkedin_url || data.linkedinUrl,
                    password: "",
                };
                form.reset(newVals);
                setOriginalValues(newVals);

                // Show success banner
                setSavedBanner(true);
                setTimeout(() => setSavedBanner(false), 4000);
                toast.success("Profile updated in database!");
            } else {
                toast.error(result.message || "Could not update profile.");
            }
        } catch {
            toast.error("Server connection error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Avatar initials from full name
    const initials = watchedValues.fullName
        ? watchedValues.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <Navbar />

            <main className="flex-grow pt-40 pb-20 px-6">
                <div className="max-w-6xl mx-auto">

                    {/* ── Header ── */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-2xl md:text-3xl font-black text-primary select-none shadow-sm capitalize flex-shrink-0">
                                {initials}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-1 text-foreground leading-tight">
                                    Hey, {watchedValues.fullName.split(" ")[0] || "Founder"}!
                                </h1>
                                <p className="text-muted-foreground text-[12px] md:text-sm flex items-center gap-2">
                                    <Sparkles size={14} className="text-primary" />
                                    Account & Personal Discovery Hub
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200 backdrop-blur-md overflow-x-auto no-scrollbar scroll-smooth">
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === "settings" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <Settings size={18} className="w-3.5 h-3.5 md:w-4 md:h-4" /> Settings
                                </button>
                                <button
                                    onClick={() => setActiveTab("saved")}
                                    className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === "saved" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <Bookmark size={18} className="w-3.5 h-3.5 md:w-4 md:h-4" /> Saved
                                </button>
                                <button
                                    onClick={() => setActiveTab("reviews")}
                                    className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === "reviews" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <Star size={18} className="w-3.5 h-3.5 md:w-4 md:h-4" /> Reviews
                                </button>
                                <button
                                    onClick={() => setActiveTab("questions")}
                                    className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === "questions" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <MessageSquare size={18} className="w-3.5 h-3.5 md:w-4 md:h-4" /> Questions
                                </button>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    localStorage.removeItem("user");
                                    window.dispatchEvent(new Event("storage"));
                                    navigate("/login");
                                }}
                                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl h-12 md:h-auto py-2.5 px-6 font-bold flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0"
                            >
                                <LogOut size={18} /> Logout
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait" initial={false}>
                        {activeTab === "settings" ? (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="transform-gpu"
                            >
                                {/* ── Saved Banner ── */}
                                <AnimatePresence>
                                    {savedBanner && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mb-8 flex items-center gap-3 px-6 py-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-medium shadow-sm"
                                        >
                                            <CheckCircle2 size={18} className="flex-shrink-0 text-green-500" />
                                            Success! Your profile settings have been synchronized.
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Form Column */}
                                    <div className="lg:col-span-2">
                                        <div className="bg-card border border-border rounded-[32px] p-8 md:p-10 shadow-sm">
                                            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-foreground">
                                                <User size={20} className="text-primary" /> Personal Information
                                            </h2>
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                                    <FormField
                                                        control={form.control}
                                                        name="fullName"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground font-black">Full Name</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Display Name"
                                                                        className="bg-secondary/50 border-border h-12 md:h-14 px-5 focus:border-primary/50 transition-all rounded-2xl font-bold text-base md:text-lg text-foreground"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs text-orange-600" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <FormField
                                                            control={form.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-black">Email Address</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            className="bg-secondary/50 border-border h-14 px-5 focus:border-primary/50 transition-all rounded-2xl font-bold text-foreground"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="mobile"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-black">Mobile Number</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            className="bg-secondary/50 border-border h-14 px-5 focus:border-primary/50 transition-all rounded-2xl font-bold text-foreground"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="linkedinUrl"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground font-black flex items-center gap-2">
                                                                    LinkedIn Profile URL <span className="text-muted-foreground/60 normal-case font-normal">(Optional)</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="https://linkedin.com/in/username"
                                                                        className="bg-secondary/50 border-border h-12 md:h-14 px-5 focus:border-primary/50 transition-all rounded-2xl font-medium text-base text-foreground"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs text-orange-600" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground font-black">Security Pin / Password</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="password"
                                                                        placeholder="••••••••"
                                                                        className="bg-secondary/50 border-border h-12 md:h-14 px-5 focus:border-primary/50 transition-all rounded-2xl font-bold text-foreground"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <p className="text-[10px] text-muted-foreground mt-1 italic">Leave blank if you don't wish to rotate your password.</p>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="pt-8 border-t border-slate-100 flex items-center justify-start gap-4">
                                                        <Button
                                                            type="submit"
                                                            disabled={isLoading || !isDirty}
                                                            className="h-14 px-10 bg-primary text-black hover:bg-primary/90 font-black rounded-2xl shadow-md transition-all disabled:opacity-30 flex items-center gap-3 w-full md:w-auto"
                                                        >
                                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                                                            Save Profile
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </div>
                                    </div>

                                    {/* Sidebar Stats */}
                                    <div className="space-y-6">
                                        <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6">Discovery Stats</h3>
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center group cursor-pointer" onClick={() => setActiveTab("saved")}>
                                                    <span className="text-muted-foreground font-bold text-sm">Saved Tools</span>
                                                    <span className="text-2xl font-black text-foreground group-hover:scale-110 transition-transform group-hover:text-primary">
                                                        {savedTools.length || 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center group cursor-pointer" onClick={() => setActiveTab("reviews")}>
                                                    <span className="text-muted-foreground font-bold text-sm">Total Reviews</span>
                                                    <span className="text-2xl font-black text-foreground group-hover:scale-110 transition-transform group-hover:text-primary">
                                                        {userReviews.length || 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center group cursor-pointer" onClick={() => setActiveTab("questions")}>
                                                    <span className="text-muted-foreground font-bold text-sm">Discussions</span>
                                                    <span className="text-2xl font-black text-foreground group-hover:scale-110 transition-transform group-hover:text-primary">
                                                        {userQuestions.length || 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground font-bold text-sm">Member Since</span>
                                                    <span className="text-sm font-bold text-foreground">March 2026</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground font-bold text-sm">Account Status</span>
                                                    <span className="text-[10px] uppercase font-black px-2 py-1 bg-green-100 text-green-700 rounded-md border border-green-200">Active</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pro Access Section Removed */}
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === "saved" ? (
                            <motion.div
                                key="saved"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-8 transform-gpu"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black mb-1 flex items-center gap-3 text-foreground">
                                            <Bookmark className="text-primary" /> Saved Inventory
                                        </h2>
                                        <p className="text-muted-foreground text-sm">Access your curated collection of AI architecture & tools.</p>
                                    </div>
                                    {savedTools.length > 0 && (
                                        <div className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                                            {savedTools.length} Tools Bookmarked
                                        </div>
                                    )}
                                </div>

                                {isToolsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                        <p className="font-bold tracking-widest uppercase text-xs text-muted-foreground">Loading Knowledge Base...</p>
                                    </div>
                                ) : savedTools.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                        {savedTools.map((tool, idx) => (
                                            <ToolCard key={tool.id || idx} {...tool} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-card border border-border rounded-[40px] py-32 flex flex-col items-center justify-center text-center px-6 shadow-sm">
                                        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                                            <Bookmark size={32} className="text-muted-foreground/30" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-foreground">Your discovery hub is empty</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-8">
                                            Bookmark your favorite AI tools while browsing to see them here and build your custom AI stack.
                                        </p>
                                        <Button
                                            onClick={() => navigate("/")}
                                            className="bg-foreground text-background font-black px-10 py-6 rounded-2xl hover:scale-105 transition-all shadow-xl"
                                        >
                                            Start Exploring
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === "reviews" ? (
                            <motion.div
                                key="reviews"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black mb-1 flex items-center gap-3 text-foreground">
                                            <Star className="text-primary fill-current" /> My Contributions
                                        </h2>
                                        <p className="text-muted-foreground text-sm">Reviews and ratings you've shared with the community.</p>
                                    </div>
                                    {userReviews.length > 0 && (
                                        <div className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                                            {userReviews.length} Reviews Written
                                        </div>
                                    )}
                                </div>

                                {isDataLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                        <p className="font-bold tracking-widest uppercase text-xs text-muted-foreground">Loading reviews...</p>
                                    </div>
                                ) : userReviews.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {userReviews.map((r, i) => (
                                            <div key={i} className="bg-card border border-border rounded-[32px] p-8 shadow-sm hover:border-primary/40 transition-all group relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] block mb-2">{r.tool_slug}</span>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"} />)}
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed italic text-sm">"{r.review_text}"</p>
                                                {r.is_verified == 1 && (
                                                    <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-tighter border border-green-500/20">
                                                        <ShieldCheck size={12} /> Expert Verified
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-card border border-border rounded-[40px] py-32 text-center shadow-sm">
                                        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                                            <Star size={32} className="text-muted-foreground/30" />
                                        </div>
                                        <p className="text-muted-foreground font-bold mb-6">You haven't shared any reviews yet.</p>
                                        <Button onClick={() => navigate("/")} className="bg-primary text-black font-black rounded-2xl h-14 px-10 shadow-xl shadow-primary/10">Write First Review</Button>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="questions"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black mb-1 flex items-center gap-3 text-foreground">
                                            <MessageSquare className="text-primary" /> My Discussions
                                        </h2>
                                        <p className="text-muted-foreground text-sm">Threads you've started in the community forum.</p>
                                    </div>
                                    {userQuestions.length > 0 && (
                                        <div className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                                            {userQuestions.length} Questions Asked
                                        </div>
                                    )}
                                </div>

                                {isDataLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                        <p className="font-bold tracking-widest uppercase text-xs text-muted-foreground">Loading discussions...</p>
                                    </div>
                                ) : userQuestions.length > 0 ? (
                                    <div className="space-y-4">
                                        {userQuestions.map((q, i) => (
                                            <div key={i} className="bg-card border border-border rounded-[32px] p-8 shadow-sm hover:border-primary transition-all flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/community/${q.id}`)}>
                                                <div>
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <span className="px-3 py-1 bg-secondary text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest">{q.category}</span>
                                                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">{new Date(q.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{q.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {q.is_pinned == 1 && <Pin size={20} className="text-primary animate-pulse" />}
                                                    {q.is_locked == 1 && <Lock size={20} className="text-muted-foreground/40" />}

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/community/${q.id}`); }}
                                                            className="p-3 bg-secondary/50 text-muted-foreground/40 hover:bg-primary/10 hover:text-primary rounded-2xl transition-all"
                                                            title="Edit Discussion"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteDiscussion(e, q.id)}
                                                            className="p-3 bg-secondary/50 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive rounded-2xl transition-all"
                                                            title="Delete Discussion"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>

                                                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground/30 group-hover:bg-primary group-hover:text-black transition-all group-hover:rotate-45">
                                                        <ChevronRight size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-card border border-border rounded-[40px] py-32 text-center shadow-sm">
                                        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                                            <MessageSquare size={32} className="text-muted-foreground/30" />
                                        </div>
                                        <p className="text-muted-foreground font-bold mb-6">No community discussions yet.</p>
                                        <Button onClick={() => navigate("/community")} className="bg-primary text-black font-black rounded-2xl h-14 px-10 shadow-xl shadow-primary/10">Join Discussion</Button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
