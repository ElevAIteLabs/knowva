import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, CheckCircle2, User, Mail, Phone, Lock, ShieldCheck } from "lucide-react";
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

const profileSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits." }),
    password: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [savedBanner, setSavedBanner] = useState(false);
    const [originalValues, setOriginalValues] = useState<Partial<ProfileFormValues>>({});
    const navigate = useNavigate();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { fullName: "", email: "", mobile: "", password: "" },
    });

    const watchedValues = form.watch();

    // Detect if anything changed from the last saved state
    const isDirty =
        watchedValues.fullName !== originalValues.fullName ||
        watchedValues.email !== originalValues.email ||
        watchedValues.mobile !== originalValues.mobile ||
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
            password: "",
        };
        form.reset(vals);
        setOriginalValues(vals);
    }, [navigate, form]);

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
        <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans">
            <Navbar />

            <main className="flex-grow pt-28 pb-20 px-6">
                <div className="max-w-2xl mx-auto">

                    {/* ── Header ── */}
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center text-xl font-bold text-primary select-none">
                            {initials}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                            <p className="text-white/40 text-sm mt-0.5">
                                Changes are saved directly to the database.
                            </p>
                        </div>
                    </div>

                    {/* ── Saved Banner ── */}
                    <AnimatePresence>
                        {savedBanner && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 flex items-center gap-3 px-5 py-3.5 bg-green-500/10 border border-green-500/25 rounded-2xl text-green-400 text-sm font-medium"
                            >
                                <CheckCircle2 size={18} className="flex-shrink-0" />
                                Your profile has been updated in the database successfully!
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Form Card ── */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                {/* Full Name */}
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5">
                                                <User size={12} /> Full Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John Doe"
                                                    className="bg-[#0A0A0A] border-white/10 h-12 focus:ring-1 focus:ring-primary/50 transition-all rounded-xl font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs text-orange-500" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Email */}
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5">
                                                    <Mail size={12} /> Email Address
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="name@example.com"
                                                        className="bg-[#0A0A0A] border-white/10 h-12 focus:ring-1 focus:ring-primary/50 transition-all rounded-xl font-medium"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs text-orange-500" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Mobile */}
                                    <FormField
                                        control={form.control}
                                        name="mobile"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5">
                                                    <Phone size={12} /> Mobile Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your phone number"
                                                        className="bg-[#0A0A0A] border-white/10 h-12 focus:ring-1 focus:ring-primary/50 transition-all rounded-xl font-medium"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs text-orange-500" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5">
                                                <Lock size={12} /> New Password
                                                <span className="text-white/25 font-normal normal-case tracking-normal">(optional)</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Leave blank to keep current password"
                                                    className="bg-[#0A0A0A] border-white/10 h-12 focus:ring-1 focus:ring-primary/50 transition-all rounded-xl font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs text-orange-500" />
                                        </FormItem>
                                    )}
                                />

                                {/* Save Button */}
                                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !isDirty}
                                        className="h-12 px-8 bg-white text-black hover:bg-white/90 font-bold rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={17} className="mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    {isDirty && !isLoading && (
                                        <span className="text-xs text-[#FFB347]/80 animate-pulse">
                                            You have unsaved changes
                                        </span>
                                    )}
                                    {!isDirty && !isLoading && (
                                        <span className="text-xs text-white/25 flex items-center gap-1.5">
                                            <ShieldCheck size={13} /> No unsaved changes
                                        </span>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
