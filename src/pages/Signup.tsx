import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
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
        <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans">
            <Navbar />

            <main className="flex-grow flex items-center justify-center p-6 mt-16 pb-12">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-semibold tracking-tight mb-2">Create account</h1>
                        <p className="text-white/50 text-sm">Join Knowva to transform your workflow</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold">Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                                <Input
                                                    placeholder="John Doe"
                                                    className="bg-white/5 border-white/10 h-11 pl-10 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg"
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
                                        <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold">Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                                <Input
                                                    placeholder="name@example.com"
                                                    className="bg-white/5 border-white/10 h-11 pl-10 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg"
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
                                        <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold">Mobile Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                                <Input
                                                    placeholder="+1 234 567 890"
                                                    className="bg-white/5 border-white/10 h-11 pl-10 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg"
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
                                        <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="bg-white/5 border-white/10 h-11 pl-10 pr-10 focus:ring-1 focus:ring-primary/50 transition-all rounded-lg"
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
                                {isLoading ? "Creating account..." : "Sign up"}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-8 text-center text-sm text-white/40">
                        Already have an account?{" "}
                        <Link to="/login" className="text-white hover:underline font-medium">Log in</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Signup;
