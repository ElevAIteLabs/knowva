import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
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

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const response = await fetch(API_ENDPOINTS.AUTH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "google_sync",
                    email: user.email,
                    fullName: user.displayName || "Google User",
                }),
            });

            const syncResult = await response.json();

            if (syncResult.status === "success") {
                toast.success("Welcome back!");
                localStorage.setItem("user", JSON.stringify(syncResult.user));
                navigate("/");
            } else {
                toast.error(syncResult.message || "Google sign-in failed during sync.");
            }
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            if (error.code !== "auth/popup-closed-by-user") {
                toast.error("Google sign-in failed.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.AUTH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "login",
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (result.status === "success") {
                toast.success("Welcome back!");
                localStorage.setItem("user", JSON.stringify(result.user));
                navigate("/");
            } else {
                toast.error(result.message || "Invalid credentials.");
            }
        } catch (error) {
            toast.error("Server connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    const [dbToolsCount, setDbToolsCount] = useState<string>("2.5K+");
    const [makersCount, setMakersCount] = useState<string>("50K+");
    const [previewIcons, setPreviewIcons] = useState<string[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.TOOLS);
                const result = await response.json();
                if (result.status === "success" && Array.isArray(result.data)) {
                    setDbToolsCount(`${result.data.length}+`);
                    
                    // Get first 8 icons for preview
                    const icons = result.data.slice(0, 8).map((t: any) => {
                        let url = t.icon_url || "";
                        if (url.startsWith('[') && url.endsWith(']')) {
                            try { const parsed = JSON.parse(url); if (Array.isArray(parsed)) url = parsed[0]; } catch { }
                        }
                        if (!url) return "";
                        if (url.startsWith('http')) return url;
                        const cleanPath = url.startsWith('/') ? url.slice(1) : url;
                        const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
                        return `${API_BASE_URL}/${finalPath}`;
                    }).filter(Boolean);
                    setPreviewIcons(icons);
                }
            } catch (e) {
                console.error("Failed to fetch tool stats", e);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-primary/30">
            <Navbar />

            <main className="flex-grow flex flex-col lg:flex-row h-full min-h-screen">
                {/* Left Side: Visual/Branding (Hidden on mobile) */}
                <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
                    {/* Background effects */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[100px]" />
                        
                        {/* Dynamic Icons Background */}
                        <div className="absolute inset-0 overflow-hidden opacity-[0.15] rotate-[15deg] scale-125">
                            <div className="grid grid-cols-4 gap-8 pointer-events-none">
                                {[...previewIcons, ...previewIcons].map((icon, i) => (
                                    <div key={i} className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 p-4 flex items-center justify-center backdrop-blur-sm animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                                        <img src={icon} alt="" className="w-full h-full object-contain filter grayscale" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold mb-8 backdrop-blur-md">
                            <ArrowRight className="w-3 h-3 text-primary" /> <span>Elevate Your Workflow</span>
                        </div>
                        <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-6">
                            Discovery starts <br />
                            <span className="text-primary italic">right here.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
                            Access our library of {dbToolsCount} AI tools and models. Join thousands of innovators building the future with state-of-the-art intelligence.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { count: dbToolsCount, label: "AI Tools" },
                                { count: makersCount, label: "Makers" }
                            ].map((stat, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest font-black">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 pt-44 sm:pt-56 bg-slate-50">
                    <div className="w-full max-w-md">
                        <div className="mb-14 lg:text-left text-center mt-6">
                            <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-3">Welcome Back</h1>
                            <p className="text-slate-500 font-medium">Please enter your details to sign in to your account.</p>
                        </div>

                        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            {/* Decorative line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-500 to-primary/0" />

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Email Address</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        placeholder="name@company.com"
                                                        className="bg-slate-50 border-slate-200 h-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl text-slate-900 placeholder:text-slate-300"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs text-orange-600 font-medium" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                        <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Password</FormLabel>
                                                    </div>
                                                    <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-primary hover:text-orange-600 transition-colors">Forgot?</Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            className="bg-slate-50 border-slate-200 h-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl pr-10 text-slate-900 placeholder:text-slate-300"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                                        >
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs text-orange-600 font-medium" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] mt-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Signing in...
                                            </div>
                                        ) : "Continuue to Platform"}
                                    </Button>
                                </form>
                            </Form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-100"></span>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                                    <span className="bg-white px-4 text-slate-300">Or connect with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 bg-white border-slate-200 text-slate-900 hover:bg-slate-50 font-bold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                <Chrome size={20} className="text-primary fill-primary/10" /> Google Account
                            </Button>

                            <div className="mt-8 text-center text-sm font-medium text-slate-400">
                                New to Knowva?{" "}
                                <Link to="/signup" className="text-primary hover:text-orange-600 transition-colors font-black">Create free account</Link>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-[10px] text-slate-300 font-medium uppercase tracking-widest">
                            &copy; 2026 Knowva Design Lab. All rights reserved.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;
