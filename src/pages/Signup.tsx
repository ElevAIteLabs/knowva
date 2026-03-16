import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User, Mail, Phone, Lock, Chrome } from "lucide-react";
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

            // Sync with backend (Signup works as Google Sync too)
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

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-orange-500/5 z-0" />
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-6 pt-40 pb-12 relative z-10">
                <div className="w-full max-w-md glass-card p-8 sm:p-10 border border-white/40 bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50">
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-bold tracking-tight mb-2 text-slate-900">Create account</h1>
                        <p className="text-slate-500 text-sm">Join Knowva to transform your workflow</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                                <Input
                                                    placeholder="John Doe"
                                                    className="bg-slate-50 border-slate-200 h-11 pl-10 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg text-slate-900"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-orange-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                                <Input
                                                    placeholder="name@example.com"
                                                    className="bg-slate-50 border-slate-200 h-11 pl-10 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg text-slate-900"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-orange-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="mobile"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">Mobile Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                                <Input
                                                    placeholder="+1 234 567 890"
                                                    className="bg-slate-50 border-slate-200 h-11 pl-10 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg text-slate-900"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-orange-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="bg-slate-50 border-slate-200 h-11 pl-10 pr-10 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg text-slate-900"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-orange-500" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-11 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-lg mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating account..." : "Sign up"}
                            </Button>
                        </form>
                    </Form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#F8FAFC] px-2 text-slate-400 font-bold tracking-wider">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 bg-white border-slate-200 text-slate-900 hover:bg-slate-50 font-bold rounded-lg flex items-center justify-center gap-2"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <Chrome size={18} className="text-primary" /> Google
                    </Button>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-bold">Log in</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Signup;
