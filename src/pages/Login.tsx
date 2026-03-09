import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
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

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans">
            <Navbar />

            <main className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-semibold tracking-tight mb-2">Sign in</h1>
                        <p className="text-white/50 text-sm">Enter your details to access your account</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="name@example.com"
                                                className="bg-white/5 border-white/10 h-11 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg"
                                                {...field}
                                            />
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
                                        <div className="flex justify-between items-center">
                                            <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold">Password</FormLabel>
                                            <Link to="/forgot-password" title="Forgot Password" className="text-xs text-primary hover:underline">Forgot?</Link>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="bg-white/5 border-white/10 h-11 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
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
                                className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium rounded-lg mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Continue"}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-8 text-center text-sm text-white/40">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-white hover:underline font-medium">Create one</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;
