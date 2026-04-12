import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User, Mail, Phone, Lock, Chrome, Sparkles } from "lucide-react";
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

const signupSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    mobile: z.string().min(10, { message: "Enter a valid mobile number." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
                toast.success("Welcome to Knowva!");
                localStorage.setItem("user", JSON.stringify(syncResult.user));
                navigate("/");
            } else {
                toast.error(syncResult.message || "Google sign-in failed.");
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

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            mobile: "",
            password: "",
        },
    });

    const onSubmit = async (data: SignupFormValues) => {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.AUTH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "signup",
                    fullName: data.fullName,
                    email: data.email,
                    mobile: data.mobile,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (result.status === "success") {
                toast.success("Account created successfully!");
                navigate("/login");
            } else {
                toast.error(result.message || "Registration failed.");
            }
        } catch (error) {
            toast.error("Server connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    const [dbToolsCount, setDbToolsCount] = useState<string>("2.5K+");
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
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[100px]" />
                        
                        {/* Dynamic Icons Background */}
                        <div className="absolute inset-0 overflow-hidden opacity-[0.1] -rotate-[15deg] scale-125">
                            <div className="grid grid-cols-4 gap-8 pointer-events-none">
                                {[...previewIcons, ...previewIcons].map((icon, i) => (
                                    <div key={i} className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 p-4 flex items-center justify-center backdrop-blur-sm animate-float" style={{ animationDelay: `${i * 0.7}s` }}>
                                        <img src={icon} alt="" className="w-full h-full object-contain filter grayscale invert opacity-50" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold mb-8 backdrop-blur-md">
                            <Sparkles className="w-3 h-3 text-primary" /> <span>Join the Creator Economy</span>
                        </div>
                        <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-6">
                            Build your <br />
                            <span className="text-primary italic">AI Arsenal.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
                            Create your account to save {dbToolsCount} tools, write reviews, and stay updated with the latest AI trends tailored just for you.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Personalized AI recommendations",
                                "Exclusive early access to tools",
                                "Expert community insights"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                    <span className="text-slate-300 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Signup Form */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 pt-44 sm:pt-56 bg-slate-50">
                    <div className="w-full max-w-md">
                        <div className="mb-14 lg:text-left text-center mt-6">
                            <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-3">Create Account</h1>
                            <p className="text-slate-500 font-medium">Join thousands of builders today.</p>
                        </div>

                        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            {/* Decorative line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-500 to-primary/0" />

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Full Name</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        placeholder="John Doe"
                                                        className="bg-slate-50 border-slate-200 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl text-slate-900 placeholder:text-slate-300"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs text-orange-600 font-medium" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Email</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="name@mail.com"
                                                            className="bg-slate-50 border-slate-200 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl text-slate-900 placeholder:text-slate-300"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-orange-600 font-medium" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="mobile"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Mobile</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="+1..."
                                                            className="bg-slate-50 border-slate-200 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl text-slate-900 placeholder:text-slate-300"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-orange-600 font-medium" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                    <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Password</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            className="bg-slate-50 border-slate-200 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-xl pr-10 text-slate-900 placeholder:text-slate-300"
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
                                        className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] mt-4"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Generating credentials..." : "Start Discovery"}
                                    </Button>
                                </form>
                            </Form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-100"></span>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                                    <span className="bg-white px-4 text-slate-300">Or use social</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 bg-white border-slate-200 text-slate-900 hover:bg-slate-50 font-bold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                <Chrome size={20} className="text-primary fill-primary/10" /> Sync Google
                            </Button>

                            <div className="mt-8 text-center text-sm font-medium text-slate-400">
                                Already a member?{" "}
                                <Link to="/login" className="text-primary hover:text-orange-600 transition-colors font-black">Secure login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Signup;
