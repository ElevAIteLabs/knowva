import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, Trash2, ShieldAlert, Edit2, CheckCircle2, Zap,
    Layers, X, FileSpreadsheet, Upload, Download, AlertCircle,
    ChevronDown, ChevronUp, Info, BarChart2, Search, TrendingUp,
    MessageSquare, Users, Settings, MessageCircle, ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import * as xlsx from "xlsx";
import { toast } from "sonner";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";
import { categories as categoryOptions } from "@/data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ImportRow {
    name: string;
    status: "pending" | "success" | "error";
    message?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [tools, setTools] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"inventory" | "community" | "feedback" | "analytics">("inventory");
    const [analyticsData, setAnalyticsData] = useState<{
        users: any[],
        totalUsers: number,
        totalLogins: number,
        weeklyActiveUsers: number
    }>({
        users: [],
        totalUsers: 0,
        totalLogins: 0,
        weeklyActiveUsers: 0
    });
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
    const [communityThreads, setCommunityThreads] = useState<any[]>([]);
    const [communityReplies, setCommunityReplies] = useState<any[]>([]);
    const [isCommunityLoading, setIsCommunityLoading] = useState(false);
    const [communitySubTab, setCommunitySubTab] = useState<"threads" | "replies">("threads");
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // Import state
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importRows, setImportRows] = useState<ImportRow[]>([]);
    const [importStatus, setImportStatus] = useState<"idle" | "running" | "done">("idle");
    const [showColumnGuide, setShowColumnGuide] = useState(false);
    const [importAssets, setImportAssets] = useState<File[]>([]);
    const assetFileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Text Generation",
        pricing: "Free",
        website_url: "",
        rating: "4.5",
        reviews_count: "0",
        pros: "",
        cons: "",
        features: "",
        icon_url: "",
        media_urls: "",
        is_trending: 0,
        prompts: "",
        upvotes: "0",
    });
    const [pricingTiers, setPricingTiers] = useState<any[]>([]);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [stats, setStats] = useState({ totalTools: 0 });
    const [selectedAdminCategories, setSelectedAdminCategories] = useState<string[]>([]);
// 
    const getSafeLogo = (path: any) => {
        if (!path || typeof path !== 'string') return null;
        const clean = path.replace(/^['"\[]|['"\]]$/g, '').trim();
        if (!clean || (!clean.includes('.') && !clean.includes('/') && !clean.startsWith('http'))) return null;
        if (clean.startsWith('http')) return clean;
        const cp = clean.startsWith('/') ? clean.slice(1) : clean;
        const fp = cp.startsWith('uploads/') ? cp : `uploads/${cp}`;
        return `${API_BASE_URL}/${fp}`;
    };

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (!userStr) { navigate("/login"); return; }
        const user = JSON.parse(userStr);
        if (user.email !== "admin@knowva.com") {
            toast.error("Unauthorized access.");
            navigate("/");
            return;
        }
        fetchTools();
        fetchCommunityThreads();
        fetchCommunityReplies();
        fetchFeedbacks();
        fetchAnalytics();
    }, [navigate]);

    const fetchAnalytics = async () => {
        setIsAnalyticsLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.ANALYTICS}?action=get_users`);
            const result = await response.json();
            if (result.status === "success") {
                setAnalyticsData(result.data);
            }
        } catch {
            toast.error("Failed to fetch user analytics.");
        } finally {
            setIsAnalyticsLoading(false);
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.FEEDBACK);
            const result = await response.json();
            if (result.status === "success") {
                setFeedbacks(result.data);
            }
        } catch {
            toast.error("Failed to fetch feedbacks.");
        }
    };

    const fetchCommunityReplies = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const response = await fetch(`${API_ENDPOINTS.COMMUNITY}?action=get_all_replies&user_id=${user.id}`);
            const result = await response.json();
            if (result.status === "success") {
                setCommunityReplies(result.data);
            }
        } catch {
            toast.error("Failed to fetch community replies.");
        }
    };

    const handleDeleteReply = async (id: number) => {
        if (!confirm("Remove this reply?")) return;
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const response = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete_reply", reply_id: id, user_id: user.id }),
            });
            const result = await response.json();
            if (result.status === "success") {
                toast.success("Reply deleted.");
                fetchCommunityReplies();
            }
        } catch { toast.error("Failed to delete reply."); }
    };

    const fetchCommunityThreads = async () => {
        setIsCommunityLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const response = await fetch(`${API_ENDPOINTS.COMMUNITY}?uid=${user.id || 0}`);
            const result = await response.json();
            if (result.status === "success") {
                setCommunityThreads(result.data);
            }
        } catch {
            toast.error("Failed to fetch community threads.");
        } finally {
            setIsCommunityLoading(false);
        }
    };

    const handleDeleteThread = async (id: number) => {
        if (!confirm("Delete this entire discussion and all its replies?")) return;
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        try {
            const response = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", thread_id: id, user_id: user.id }),
            });
            const result = await response.json();
            if (result.status === "success") {
                toast.success("Discussion removed.");
                fetchCommunityThreads();
            }
        } catch { toast.error("Failed to delete thread."); }
    };

    // ── Fetch tools from DB ──────────────────────────────────────────────────────
    const fetchTools = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.TOOLS);
            const result = await response.json();
            if (result.status === "success") {
                setTools(result.data);
                setStats({ totalTools: result.data.length });
            }
        } catch {
            toast.error("Failed to fetch tools.");
        }
    };

    // ── Pricing tier helpers ─────────────────────────────────────────────────────
    const handleAddTier = () => setPricingTiers([...pricingTiers, { name: "", price: "", features: "", interval: "" }]);
    const updateTier = (index: number, field: string, value: string) => {
        const updated = [...pricingTiers];
        updated[index][field] = value;
        setPricingTiers(updated);
    };
    const removeTier = (index: number) => setPricingTiers(pricingTiers.filter((_, i) => i !== index));

    // ── FAQ helpers ──────────────────────────────────────────────────────────────
    const handleAddFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
    const updateFaq = (index: number, field: string, value: string) => {
        const updated = [...faqs];
        updated[index][field] = value;
        setFaqs(updated);
    };
    const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

    // ── Add / Edit tool (manual form) ────────────────────────────────────────────
    const handleAddTool = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let result;
            const data = new FormData();

            if (editingId) {
                data.append("id", editingId.toString());
            }

            // Append basic fields except those we handle specially (Pros, Cons, etc.)
            Object.entries(formData).forEach(([key, value]) => {
                if (!["pros", "cons", "features", "media_urls", "pricing_tiers", "is_trending", "faqs", "releases", "prompts"].includes(key)) {
                    data.append(key, value.toString());
                }
            });

            data.append("is_trending", formData.is_trending.toString());

            if (iconFile) data.append("icon", iconFile);
            mediaFiles.forEach((file) => data.append("media[]", file));

            const processArray = (val: string) => {
                const trimmed = (val || "").trim();
                // If it already looks like a JSON array, don't re-stringify it
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
                return JSON.stringify(trimmed.split(",").map(s => s.trim()).filter(Boolean));
            };

            data.append("pros", processArray(formData.pros));
            data.append("cons", processArray(formData.cons));
            data.append("features", processArray(formData.features));
            data.append("media_urls", processArray(formData.media_urls));

            data.append("pricing_tiers", JSON.stringify(pricingTiers.map(t => ({
                name: t.name,
                price: t.price,
                interval: t.interval || "",
                features: t.features.split(',').map((s: string) => s.trim()).filter(Boolean)
            }))));

            data.append("faqs", JSON.stringify(faqs.map(f => ({
                question: f.question,
                answer: f.answer
            }))));

            data.append("prompts", processArray(formData.prompts));

            const response = await fetch(API_ENDPOINTS.TOOLS, {
                method: "POST",
                body: data,
            });
            result = await response.json();
            if (result.status === "success") {
                toast.success(editingId ? "Tool updated successfully!" : "Tool added successfully!");
                resetForm();
                setIsAddModalOpen(false);
                fetchTools();
            } else {
                toast.error(result.message || "Failed to save tool.");
            }
        } catch {
            toast.error("An error occurred while saving the tool.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: "", description: "", category: "Text Generation", pricing: "Free",
            website_url: "", rating: "4.5", reviews_count: "0", pros: "", cons: "",
            features: "", icon_url: "", media_urls: "", is_trending: 0,
            prompts: "", upvotes: "0"
        });
        setPricingTiers([]);
        setFaqs([]);
        setIconFile(null);
        setMediaFiles([]);
    };

    // ── Edit click handler ────────────────────────────────────────────────────────
    const handleEditClick = (tool: any) => {
        const safeParseJoin = (val: any) => {
            if (!val) return '';
            if (Array.isArray(val)) return val.join(', ');
            if (typeof val !== 'string') return String(val);
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed.join(', ') : val;
            } catch {
                return val; // If not JSON, return as is (raw comma separated)
            }
        };
        let parsedTiers: any[] = [];
        try { parsedTiers = JSON.parse(tool.pricing_tiers) || []; } catch { }
        setFormData({
            name: tool.name,
            description: tool.description,
            category: tool.category,
            pricing: tool.pricing,
            website_url: tool.website_url,
            rating: tool.rating,
            reviews_count: tool.reviews_count || "0",
            pros: safeParseJoin(tool.pros),
            cons: safeParseJoin(tool.cons),
            features: safeParseJoin(tool.features),
            icon_url: tool.icon_url || "",
            media_urls: safeParseJoin(tool.media_urls),
            is_trending: parseInt(tool.is_trending) || 0,
            prompts: safeParseJoin(tool.prompts),
            upvotes: tool.upvotes || "0",
        });
        const safeFeatures = (feat: any) => {
            if (Array.isArray(feat)) return feat.join(', ');
            if (typeof feat === 'string') return feat;
            return "";
        };

        setPricingTiers(parsedTiers.map((t: any) => ({
            name: t.name || "",
            price: t.price || "",
            interval: t.interval || "",
            features: safeFeatures(t.features)
        })));

        let parsedFaqs: any[] = [];
        try { parsedFaqs = JSON.parse(tool.faqs) || []; } catch { }
        setFaqs(parsedFaqs.map((f: any) => ({
            question: f.question || "",
            answer: f.answer || ""
        })));
        setEditingId(tool.id);
        setIsAddModalOpen(true);
    };

    // ── Delete tool ──────────────────────────────────────────────────────────────
    const handleDeleteTool = async (id: number) => {
        if (!confirm("Are you sure you want to delete this tool?")) return;
        try {
            const response = await fetch(API_ENDPOINTS.TOOLS, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const result = await response.json();
            if (result.status === "success") { toast.success("Tool deleted!"); fetchTools(); }
        } catch { toast.error("Failed to delete tool."); }
    };

    // ── Excel Import helpers ─────────────────────────────────────────────────────
    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
            setImportFile(file);
        } else {
            toast.error("Please upload an .xlsx, .xls, or .csv file.");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImportFile(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                "Name": "ChatGPT",
                "Description": "A powerful AI language model that can understand and generate human-like text based on the input it receives. Useful for writing, coding, analysis, and conversation.",
                "Category": "Text Generation",
                "Pricing": "Free",
                "Website URL": "https://chat.openai.com",
                "Rating": "4.8",
                "Reviews": "50000",
                "Pros": "Easy to use, Fast responses, Versatile, Free tier available, High-quality output",
                "Cons": "Limited knowledge cutoff, Can be slow during peak times, No real-time internet access",
                "Features": "AI Writing, Code completion, Analysis, Conversation, Translation, Summarization",
                "Logo URL": "https://example.com/chatgpt-logo.png",
                "Gallery URLs": "https://example.com/chatgpt-ui.png, https://example.com/chatgpt-mobile.png",
                "Pricing Tiers": '[{"name":"Free","price":"$0","features":"Basic GPT-3.5, Limited messages"},{"name":"Plus","price":"$20/month","features":"GPT-4, Faster responses, Priority access"}]',
                "Prompts": "Solve this equation: 2x+5=15, Write a python script to scrape data",
                "FAQs": '[{"question":"Is ChatGPT free?","answer":"Yes, there is a free version with GPT-4o mini."}]'
            },
            {
                "Name": "Midjourney",
                "Description": "An AI-powered image generation tool that creates stunning artwork and images from text descriptions using advanced machine learning models.",
                "Category": "Image Generation",
                "Pricing": "Paid",
                "Website URL": "https://midjourney.com",
                "Rating": "4.6",
                "Reviews": "25000",
                "Pros": "High-quality images, Artistic styles, Fast generation, Community features",
                "Cons": "Subscription required, Learning curve, No free tier",
                "Features": "Text-to-image, Image variations, Upscaling, Style transfer",
                "Logo URL": "https://example.com/midjourney-logo.png",
                "Gallery URLs": "https://example.com/midjourney-art1.png, https://example.com/midjourney-art2.png",
                "Pricing Tiers": '[{"name":"Basic","price":"$10/month","features":"200 images, Private mode"},{"name":"Standard","price":"$30/month","features":"Unlimited images, Fast queue"}]'
            },
            {
                "Name": "GitHub Copilot",
                "Description": "An AI-powered code completion tool that helps developers write code faster and more accurately by suggesting entire lines or blocks of code.",
                "Category": "Code Assistant",
                "Pricing": "Paid",
                "Website URL": "https://github.com/features/copilot",
                "Rating": "4.5",
                "Reviews": "15000",
                "Pros": "Excellent code suggestions, Multiple language support, IDE integration",
                "Cons": "Subscription required, Sometimes suggests incorrect code",
                "Features": "Code completion, Function generation, Documentation help, Multi-language support",
                "Logo URL": "https://example.com/copilot-logo.png",
                "Gallery URLs": "https://example.com/copilot-vscode.png, https://example.com/copilot-suggestion.png",
                "Pricing Tiers": '[{"name":"Individual","price":"$10/month","features":"Individual license"},{"name":"Business","price":"$19/month","features":"Commercial license, Management"}]'
            }
        ];
        const ws = xlsx.utils.json_to_sheet(templateData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "AI Tools Template");

        // Add a second sheet with instructions
        const instructions = [
            { "Field": "Name", "Required": "Yes", "Description": "The name of the AI tool", "Example": "ChatGPT" },
            { "Field": "Description", "Required": "Yes", "Description": "Detailed description of what the tool does", "Example": "AI language model for text generation" },
            { "Field": "Category", "Required": "No", "Description": "Tool category (Text Generation, Image Generation, Code Assistant, etc.)", "Example": "Text Generation" },
            { "Field": "Pricing", "Required": "No", "Description": "Pricing model (Free, Premium, Subscription, etc.)", "Example": "Free / Premium" },
            { "Field": "Website URL", "Required": "No", "Description": "Official website URL", "Example": "https://example.com" },
            { "Field": "Rating", "Required": "No", "Description": "Rating from 0-5", "Example": "4.5" },
            { "Field": "Reviews", "Required": "No", "Description": "Total number of reviews", "Example": "1000" },
            { "Field": "Pros", "Required": "No", "Description": "Advantages (comma-separated)", "Example": "Easy to use, Fast, Free tier" },
            { "Field": "Cons", "Required": "No", "Description": "Disadvantages (comma-separated)", "Example": "Limited features, Slow" },
            { "Field": "Features", "Required": "No", "Description": "Key features (comma-separated)", "Example": "AI Writing, Code completion" },
            { "Field": "Logo URL", "Required": "No", "Description": "URL to logo image OR filename if uploading separately", "Example": "https://example.com/logo.png OR chatgpt-logo.png" },
            { "Field": "Gallery URLs", "Required": "No", "Description": "Screenshot URLs (comma-separated) OR filenames if uploading separately", "Example": "https://example.com/screen1.png, screen2.png" },
            { "Field": "Pricing Tiers", "Required": "No", "Description": "JSON array of pricing plans", "Example": '[{"name":"Free","price":"$0","features":"Basic features"}]' },
            { "Field": "Prompts", "Required": "No", "Description": "Example prompts (comma-separated)", "Example": "Write a poem, Code a game" },
            { "Field": "FAQs", "Required": "No", "Description": "JSON array of questions and answers", "Example": '[{"question":"Q?","answer":"A."}]' }
        ];
        const wsInstructions = xlsx.utils.json_to_sheet(instructions);
        xlsx.utils.book_append_sheet(wb, wsInstructions, "Instructions");

        xlsx.writeFile(wb, "knowva_ai_tools_template.xlsx");
        toast.success("Comprehensive AI Tools template downloaded!");
    };

    const runImport = async () => {
        if (!importFile) return;
        setImportStatus("running");
        setImportProgress(0);
        setImportRows([]);

        try {
            const data = await importFile.arrayBuffer();
            const workbook = xlsx.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = xlsx.utils.sheet_to_json<any>(worksheet);

            if (jsonData.length === 0) {
                toast.error("The file is empty.");
                setImportStatus("idle");
                return;
            }

            const rows: ImportRow[] = jsonData.map(row => {
                const namePossibleKeys = ["Name", "Tool Name", "Tool", "Title"];
                const rowKeys = Object.keys(row);
                const match = namePossibleKeys.find(pk =>
                    rowKeys.some(rk => rk.toLowerCase().trim() === pk.toLowerCase().trim())
                );
                const actualKey = match ? rowKeys.find(rk => rk.toLowerCase().trim() === match.toLowerCase().trim()) : null;
                const name = actualKey ? row[actualKey].toString() : "(unnamed)";

                return {
                    name,
                    status: "pending"
                };
            });
            setImportRows(rows);

            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];

                // Helper to get value case-insensitively
                const getVal = (possibleKeys: string[], defaultVal: string = "") => {
                    const rowKeys = Object.keys(row);
                    const match = possibleKeys.find(pk =>
                        rowKeys.some(rk => rk.toLowerCase().trim() === pk.toLowerCase().trim())
                    );
                    if (!match) return defaultVal;
                    const actualKey = rowKeys.find(rk => rk.toLowerCase().trim() === match.toLowerCase().trim())!;
                    return (row[actualKey] || defaultVal).toString();
                };

                const splitArr = (keys: string[]) => {
                    const str = getVal(keys, "");
                    // Split by comma OR newline to be more flexible with Excel input
                    return str ? str.split(/[,\n\r]+/).map(s => s.trim()).filter(Boolean) : [];
                };

                const mediaUrls = splitArr(["Media URLs", "Gallery", "Screenshots", "Gallery URLs", "Images", "Media"]);
                const iconPath = getVal(["Icon URL", "Logo URL", "Logo", "Icon", "Image URL", "Thumbnail"]).trim();

                const rawCategory = getVal(["Category"], "Other");
                const rawPricing = getVal(["Pricing", "Price", "Cost", "Type"], "Free");

                let finalCategory = rawCategory;
                let finalPricing = rawPricing;

                // Fix for common mistake: Pricing labels in Category column
                const pricingKeywords = ["free", "freemium", "paid"];
                if (pricingKeywords.includes(rawCategory.toLowerCase().trim())) {
                    finalPricing = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
                    // If Category was used for pricing, try to see if Pricing column had the actual category
                    if (rawPricing && !pricingKeywords.includes(rawPricing.toLowerCase().trim())) {
                        finalCategory = rawPricing;
                    } else {
                        finalCategory = "Other";
                    }
                }

                const toolData = new FormData();
                toolData.append("name", getVal(["Name", "Tool Name", "Tool", "Title"]));
                toolData.append("description", getVal(["Description", "About", "Summary"]));
                toolData.append("category", finalCategory);
                toolData.append("pricing", finalPricing);
                toolData.append("website_url", getVal(["Website URL", "Website", "Link", "URL"]));
                toolData.append("rating", getVal(["Rating", "Stars", "Score"], "4.5"));
                toolData.append("reviews_count", getVal(["Reviews", "Reviews Count", "Count"], "0"));

                // Match local assets for the icon
                if (iconPath && !iconPath.startsWith('http')) {
                    const iconFilename = iconPath.split(/[/\\]/).pop()?.trim().toLowerCase();
                    const matchedIcon = importAssets.find(f => {
                        const assetName = f.name.toLowerCase();
                        if (!assetName.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/)) return false;
                        return assetName === iconFilename ||
                            assetName.split('.')[0] === iconFilename?.split('.')[0];
                    });

                    if (matchedIcon) {
                        toolData.append("icon", matchedIcon);
                    } else {
                        // If not matched locally, assume it's already on the server
                        // Prepend 'uploads/' if missing
                        const finalIconPath = iconPath.startsWith('uploads/') ? iconPath : `uploads/${iconPath}`;
                        toolData.append("icon_url", finalIconPath);
                    }
                } else if (iconPath) {
                    toolData.append("icon_url", iconPath);
                }

                // Match local assets for the gallery
                const finalMediaUrls: string[] = [];
                let missingMedia = false;

                mediaUrls.forEach(url => {
                    const trimmedUrl = url.trim();
                    if (!trimmedUrl) return;

                    if (trimmedUrl.startsWith('http')) {
                        finalMediaUrls.push(trimmedUrl);
                    } else {
                        const filename = trimmedUrl.split(/[/\\]/).pop()?.trim().toLowerCase();
                        const matchedFile = importAssets.find(f => {
                            const assetName = f.name.toLowerCase();
                            return assetName === filename ||
                                assetName.split('.')[0] === filename?.split('.')[0];
                        });

                        if (matchedFile) {
                            toolData.append("media[]", matchedFile);
                        } else {
                            // If not matched locally, assume it's already on the server
                            const finalPath = trimmedUrl.startsWith('uploads/') ? trimmedUrl : `uploads/${trimmedUrl}`;
                            finalMediaUrls.push(finalPath);
                        }
                    }
                });

                toolData.append("pros", JSON.stringify(splitArr(["Pros", "Pro", "Advantages", "Benefits"])));
                toolData.append("cons", JSON.stringify(splitArr(["Cons", "Con", "Disadvantages", "Drawbacks"])));
                toolData.append("features", JSON.stringify(splitArr(["Features", "Feature", "Capabilities"])));
                toolData.append("media_urls", JSON.stringify(finalMediaUrls));

                // Handle Pricing Tiers - Look for complex JSON OR simple Plan columns
                let pricingTiersStr = getVal(["Pricing Tiers", "Tiers", "Plans"], "");
                if (!pricingTiersStr || pricingTiersStr === "[]") {
                    const singlePlanName = getVal(["Plan Name", "Plan", "Price Name"]);
                    const singlePlanPrice = getVal(["Plan Price", "Price", "Cost", "Value"]);
                    const singlePlanFeatures = splitArr(["Plan Features", "Features", "What's included"]);

                    if (singlePlanName) {
                        pricingTiersStr = JSON.stringify([{
                            name: singlePlanName,
                            price: singlePlanPrice || finalPricing,
                            features: singlePlanFeatures.length > 0 ? singlePlanFeatures : splitArr(["Features", "Capabilities"])
                        }]);
                    }
                }
                toolData.append("pricing_tiers", pricingTiersStr || "[]");

                toolData.append("prompts", JSON.stringify(splitArr(["Prompts", "Examples", "Use Cases"])));
                const rawFaqs = getVal(["FAQs", "Q&A", "FAQ", "Questions"], "[]");
                let finalFaqs = "[]";
                if (rawFaqs.startsWith('[') && rawFaqs.endsWith(']')) {
                    finalFaqs = rawFaqs;
                } else if (rawFaqs !== "[]") {
                    // Try to parse key-value pairs separated by pipe or semicolon
                    const faqList = rawFaqs.split(',').map(item => {
                        const parts = item.split(/[|;]/);
                        if (parts.length >= 2) {
                            return { question: parts[0].trim(), answer: parts[1].trim() };
                        }
                        return { question: item.trim(), answer: "" };
                    });
                    finalFaqs = JSON.stringify(faqList);
                }
                toolData.append("faqs", finalFaqs);

                try {
                    const response = await fetch(API_ENDPOINTS.TOOLS, { method: "POST", body: toolData });
                    const result = await response.json();
                    const newStatus = result.status === "success" ? "success" : "error";
                    const msg = result.status !== "success" ? result.message : undefined;
                    setImportRows(prev => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], status: newStatus, message: msg };
                        return updated;
                    });
                    if (result.status === "success") successCount++;
                    else failCount++;
                } catch {
                    setImportRows(prev => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], status: "error", message: "Network error" };
                        return updated;
                    });
                    failCount++;
                }

                setImportProgress(Math.round(((i + 1) / jsonData.length) * 100));
            }

            setImportStatus("done");
            const failMsg = failCount > 0 ? ` ${failCount} failed.` : "";
            toast.success(`Import complete! ${successCount} tools added.${failMsg}`);
            fetchTools();
        } catch {
            toast.error("Failed to parse your file. Make sure it matches the template.");
            setImportStatus("idle");
        }
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setImportFile(null);
        setImportAssets([]);
        setImportRows([]);
        setImportProgress(0);
        setImportStatus("idle");
        setShowColumnGuide(false);
    };

    const filteredTools = tools.filter(tool => {
        const matchesSearch = !searchQuery || 
            tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedAdminCategories.length === 0 || selectedAdminCategories.includes(tool.category);
        return matchesSearch && matchesCategory;
    });

    // ─── JSX ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <Navbar />

            <main className="flex-grow pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ── Left Sidebar Navigation ──────────────────────────────────── */}
                    <aside className="lg:w-64 space-y-2 flex-shrink-0">
                        <div className="glass-card p-4 space-y-1">
                            <button
                                onClick={() => setActiveTab("inventory")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "inventory" ? "bg-yellow-500 text-black" : "text-foreground/40 hover:bg-white/5 hover:text-foreground"}`}
                            >
                                <Layers size={18} />
                                Content Inventory
                            </button>
                            <button
                                onClick={() => setActiveTab("community")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "community" ? "bg-yellow-500 text-black" : "text-foreground/40 hover:bg-white/5 hover:text-foreground"}`}
                            >
                                <MessageSquare size={18} />
                                Community Center
                            </button>
                            <button
                                onClick={() => setActiveTab("feedback")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "feedback" ? "bg-yellow-500 text-black" : "text-foreground/40 hover:bg-white/5 hover:text-foreground"}`}
                            >
                                <MessageCircle size={18} />
                                User Feedback
                            </button>
                            <button
                                onClick={() => setActiveTab("analytics")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "analytics" ? "bg-yellow-500 text-black" : "text-foreground/40 hover:bg-white/5 hover:text-foreground"}`}
                            >
                                <Users size={18} />
                                User Insights
                            </button>
                        </div>

                        <div className="p-6 glass-card border border-primary/10 bg-primary/5 rounded-2xl hidden lg:block">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <ShieldAlert size={14} />
                                <span className="text-[10px] uppercase font-black tracking-widest">Admin Status</span>
                            </div>
                            <p className="text-[10px] text-foreground/50 leading-relaxed font-bold">You are operating in elevated mode. Every action is recorded.</p>
                        </div>
                    </aside>

                    {/* ── Right Content Area ───────────────────────────────────────── */}
                    <div className="flex-1 min-w-0">
                        {activeTab === "inventory" ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                {/* ── Inventory Header ── */}
                                <div className="flex flex-col md:flex-row justify-between w-full md:items-end mb-10 gap-6 glass-card p-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-yellow-500/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                                            <Layers size={32} className="text-yellow-500" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Inventory</h1>
                                            <p className="text-foreground/40 text-sm max-w-xs">Global repository for AI tools and frameworks.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-5 py-3 rounded-xl font-bold hover:bg-green-500/20 transition-all text-sm"><FileSpreadsheet size={18} /> Bulk Import</button>
                                        <button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="flex items-center gap-2 bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all text-sm"><Plus size={18} /> Add Tool</button>
                                    </div>
                                </div>

                                {/* ── Stats Bar (Moved inside tab) ── */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    {[
                                        { label: "Total Tools in DB", value: stats.totalTools, icon: <Layers size={20} className="text-yellow-500" /> },
                                        { label: "Active Categories", value: "8", icon: <BarChart2 size={20} className="text-yellow-400" /> },
                                    ].map((stat, i) => (
                                        <div key={i} className="glass-card p-5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/30 border border-border flex items-center justify-center flex-shrink-0">
                                                {stat.icon}
                                            </div>
                                            <div>
                                                <div className="text-xl font-bold">{stat.value}</div>
                                                <div className="text-xs text-foreground/40">{stat.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Inventory Database ── */}
                                <div className="glass-card overflow-hidden">
                                    <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/30">
                                        <h2 className="text-lg font-bold font-display flex items-center gap-2">
                                            <Layers className="text-yellow-500 w-5 h-5" /> All Inventory
                                            <span className="ml-2 text-xs font-normal text-foreground/40 bg-secondary/30 border border-border px-2 py-0.5 rounded-full">{tools.length} entries</span>
                                        </h2>
                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                            {/* Category multi-filter */}
                                            <div className="flex flex-wrap gap-2 max-w-md justify-end">
                                                {selectedAdminCategories.length > 0 && (
                                                    <button 
                                                        onClick={() => setSelectedAdminCategories([])}
                                                        className="px-3 py-1.5 text-[10px] font-bold text-primary hover:underline"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                                <select 
                                                    className="bg-card border border-border rounded-xl px-3 py-2 text-xs focus:border-primary focus:outline-none"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val && !selectedAdminCategories.includes(val)) {
                                                            setSelectedAdminCategories([...selectedAdminCategories, val]);
                                                        }
                                                        e.target.value = "";
                                                    }}
                                                >
                                                    <option value="">+ Filter Category</option>
                                                    {Array.from(new Set(tools.map(t => t.category).filter(Boolean))).sort().map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                
                                                {selectedAdminCategories.map(cat => (
                                                    <button 
                                                        key={cat}
                                                        onClick={() => setSelectedAdminCategories(selectedAdminCategories.filter(c => c !== cat))}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors"
                                                    >
                                                        {cat} <X size={10} />
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="relative w-full sm:w-64">
                                                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-card border border-border rounded-xl px-4 py-2.5 pl-10 text-sm focus:border-primary transition-colors placeholder:text-muted-foreground/50" />
                                                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-card text-muted-foreground uppercase text-[10px] tracking-widest border-b border-border font-black">
                                                <tr>
                                                    <th className="px-6 py-4">Tool / Identity</th>
                                                    <th className="px-6 py-4">Status / Tags</th>
                                                    <th className="px-6 py-4 text-right">Ops</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-sm font-bold">
                                                {/* Existing Inventory Rows Mapping */}
                                                {(searchQuery ? filteredTools : tools).map((tool) => (
                                                    <tr key={tool.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden text-black">
                                                                    {getSafeLogo(tool.icon_url) ? (
                                                                        <img 
                                                                            src={getSafeLogo(tool.icon_url)!} 
                                                                            className="w-full h-full object-contain"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement;
                                                                                target.style.display = 'none';
                                                                                if (target.parentElement) {
                                                                                    target.parentElement.innerHTML = `<span class="text-xs font-bold">${tool.name?.charAt(0) || '?'}</span>`;
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-black/40">{tool.name?.charAt(0) || '?'}</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="text-foreground group-hover:text-primary transition-colors">{tool.name}</div>
                                                                    <div className="text-[10px] text-foreground/40 font-bold">{tool.pricing} • {tool.rating}⭐</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 bg-secondary/50 rounded-lg text-[10px] border border-border">{tool.category}</span>
                                                        </td>
                                                        {/* <td className="px-6 py-4 text-center">
                                                            <div className="text-primary font-black">{tool.upvotes || 0}</div>
                                                        </td> */}
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button onClick={() => handleEditClick(tool)} className="p-2 text-foreground/20 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-all"><Edit2 size={16} /></button>
                                                                <button onClick={() => handleDeleteTool(tool.id)} className="p-2 text-foreground/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === "community" ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row justify-between w-full md:items-end mb-10 gap-6 glass-card p-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-yellow-500/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                                            <MessageSquare size={32} className="text-primary" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Community</h1>
                                            <p className="text-foreground/40 text-sm max-w-xs">Moderate threads and manage conversations.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-secondary/30 px-6 py-4 rounded-2xl border border-border">
                                            <div className="text-[10px] font-black uppercase text-foreground/40 mb-1">Threads</div>
                                            <div className="text-2xl font-black text-foreground">{communityThreads.length}</div>
                                        </div>
                                        <div className="bg-secondary/30 px-6 py-4 rounded-2xl border border-border">
                                            <div className="text-[10px] font-black uppercase text-foreground/40 mb-1">Total Replies</div>
                                            <div className="text-2xl font-black text-foreground">{communityReplies.length}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-6">
                                    <button
                                        onClick={() => setCommunitySubTab("threads")}
                                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${communitySubTab === "threads" ? "bg-primary text-black" : "bg-secondary/30 text-foreground/40 hover:text-foreground"}`}
                                    >
                                        Discussions ({communityThreads.length})
                                    </button>
                                    <button
                                        onClick={() => setCommunitySubTab("replies")}
                                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${communitySubTab === "replies" ? "bg-primary text-black" : "bg-secondary/30 text-foreground/40 hover:text-foreground"}`}
                                    >
                                        User Replies ({communityReplies.length})
                                    </button>
                                </div>

                                {communitySubTab === "threads" ? (
                                    <div className="glass-card overflow-hidden">
                                        <div className="p-6 border-b border-border bg-secondary/30">
                                            <h2 className="text-lg font-bold font-display flex items-center gap-2">
                                                <Users className="text-primary w-5 h-5" /> Discussion Threads
                                            </h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-card text-muted-foreground uppercase text-[10px] tracking-widest border-b border-border font-black">
                                                    <tr>
                                                        <th className="px-6 py-4">Title / Context</th>
                                                        <th className="px-6 py-4">Author</th>
                                                        <th className="px-6 py-4 text-right">Ops</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-sm font-bold">
                                                    {communityThreads.map((thread) => (
                                                        <tr key={thread.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="max-w-md">
                                                                    <div className="text-foreground group-hover:text-primary transition-colors text-base line-clamp-1">{thread.title}</div>
                                                                    <div className="text-[10px] text-foreground/40 font-bold mt-1 uppercase tracking-widest">{thread.category}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs">{thread.user_name}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button onClick={() => navigate(`/community/${thread.id}`)} className="p-2 text-foreground/20 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><ChevronRight size={16} /></button>
                                                                    <button onClick={() => handleDeleteThread(thread.id)} className="p-2 text-foreground/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-card overflow-hidden">
                                        <div className="p-6 border-b border-border bg-secondary/30">
                                            <h2 className="text-lg font-bold font-display flex items-center gap-2">
                                                <MessageCircle className="text-primary w-5 h-5" /> Recent User Responses
                                            </h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-card text-muted-foreground uppercase text-[10px] tracking-widest border-b border-border font-black">
                                                    <tr>
                                                        <th className="px-6 py-4">Reply Content</th>
                                                        <th className="px-6 py-4">In Thread</th>
                                                        <th className="px-6 py-4">Author</th>
                                                        <th className="px-6 py-4 text-right">Ops</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-sm font-bold">
                                                    {communityReplies.map((reply) => (
                                                        <tr key={reply.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="max-w-xs line-clamp-2 text-foreground/70 font-normal">{reply.content}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs text-primary max-w-[150px] truncate">{reply.thread_title}</td>
                                                            <td className="px-6 py-4 text-xs">{reply.user_name}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button onClick={() => navigate(`/community/${reply.thread_id}`)} className="p-2 text-foreground/20 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><ChevronRight size={16} /></button>
                                                                    <button onClick={() => handleDeleteReply(reply.id)} className="p-2 text-foreground/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === "feedback" ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col justify-between w-full mb-10 gap-6 glass-card p-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-yellow-500/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                                            <MessageCircle size={32} className="text-primary" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">User Feedback</h1>
                                            <p className="text-foreground/40 text-sm max-w-xs">Review suggestions, bug reports, and thoughts from the community.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card overflow-hidden">
                                    <div className="p-6 border-b border-border bg-secondary/30">
                                        <h2 className="text-lg font-bold font-display flex items-center gap-2">
                                            <MessageCircle className="text-primary w-5 h-5" /> Recent Feedback
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-card text-muted-foreground uppercase text-[10px] tracking-widest border-b border-border font-black">
                                                <tr>
                                                    <th className="px-6 py-4">User Info</th>
                                                    <th className="px-6 py-4">Message</th>
                                                    <th className="px-6 py-4">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-sm font-medium">
                                                {feedbacks.map((fbd) => (
                                                    <tr key={fbd.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-foreground">{fbd.user_name}</div>
                                                            <div className="text-xs text-foreground/50">{fbd.user_email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-xl text-foreground/80 whitespace-pre-wrap">{fbd.message}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs tabular-nums text-foreground/50">
                                                            {new Date(fbd.created_at).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {feedbacks.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-8 text-center text-foreground/50">
                                                            No feedback available yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === "analytics" ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row justify-between w-full md:items-end mb-10 gap-6 glass-card p-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-yellow-500/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                                            <Users size={32} className="text-primary" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">User Insights</h1>
                                            <p className="text-foreground/40 text-sm max-w-xs">Detailed statistics and activity logs for all registered users.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={fetchAnalytics} 
                                            disabled={isAnalyticsLoading}
                                            className="flex items-center gap-2 bg-secondary/30 text-foreground border border-border px-5 py-3 rounded-xl font-bold hover:bg-secondary/50 transition-all text-sm"
                                        >
                                            <Zap size={18} className={isAnalyticsLoading ? "animate-spin" : ""} /> 
                                            {isAnalyticsLoading ? "Refreshing..." : "Refresh Data"}
                                        </button>
                                    </div>
                                </div>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: "Total Registrations", value: analyticsData.totalUsers, color: "text-blue-500", icon: <Users size={20} /> },
                                        { label: "Global Login Volume", value: analyticsData.totalLogins, color: "text-green-500", icon: <Zap size={20} /> },
                                        { label: "Weekly Active Users", value: analyticsData.weeklyActiveUsers, color: "text-yellow-500", icon: <TrendingUp size={20} /> },
                                    ].map((stat, i) => (
                                        <div key={i} className="glass-card p-6 flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center ${stat.color}`}>
                                                {stat.icon}
                                            </div>
                                            <div>
                                                <div className="text-3xl font-black">{stat.value}</div>
                                                <div className="text-[10px] uppercase font-black tracking-widest text-foreground/40">{stat.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* User Table */}
                                <div className="glass-card overflow-hidden">
                                    <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-center">
                                        <h2 className="text-lg font-bold font-display flex items-center gap-2">
                                            <ShieldAlert className="text-primary w-5 h-5" /> Registered User Base
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-card text-muted-foreground uppercase text-[10px] tracking-widest border-b border-border font-black">
                                                <tr>
                                                    <th className="px-6 py-4">User</th>
                                                    <th className="px-6 py-4">Contact info</th>
                                                    <th className="px-6 py-4">Session activity</th>
                                                    <th className="px-6 py-4 text-right">Login Count</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-sm font-bold">
                                                {analyticsData.users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary">
                                                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-foreground">{user.name || "Anonymous"}</div>
                                                                    <div className="text-[10px] text-foreground/40">ID: #{user.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-foreground/80">{user.email}</div>
                                                            <div className="text-[10px] text-foreground/40">{user.mobile || "No Mobile"}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs">
                                                                {user.last_login ? new Date(user.last_login).toLocaleString() : "Never"}
                                                            </div>
                                                            <div className="text-[10px] text-foreground/40 uppercase tracking-widest">Last Login</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="px-3 py-1 bg-secondary/50 rounded-full text-xs font-black text-primary border border-primary/20">
                                                                {user.login_count || 0}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {analyticsData.users.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-foreground/30 font-medium">
                                                            No user records found in the database.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </div>
                </div>
            </main>
            <Footer />

            {/* ════════════════════════════════════════════════════════════════════════
          MODAL 1: Bulk Import Excel
      ════════════════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isImportModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden my-8"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <FileSpreadsheet size={20} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold font-display text-foreground">Bulk Import via Excel / CSV</h3>
                                        <p className="text-xs text-muted-foreground">Upload a spreadsheet to add multiple tools at once</p>
                                    </div>
                                </div>
                                <button onClick={closeImportModal} className="text-muted-foreground hover:text-foreground transition-colors p-1"><X size={22} /></button>
                            </div>

                            <div className="p-6 space-y-5">

                                {/* ── Column Format Guide (Collapsible) ── */}
                                <div className="rounded-xl border border-border bg-secondary/5 overflow-hidden">
                                    <button
                                        onClick={() => setShowColumnGuide(v => !v)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <span className="flex items-center gap-2 text-foreground"><Info size={15} className="text-primary" /> Required Column Format</span>
                                        {showColumnGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    <AnimatePresence>
                                        {showColumnGuide && (
                                            <motion.div
                                                initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 border-t border-border pt-3">
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        {[
                                                            { col: "Name *", desc: "AI Tool name (e.g. ChatGPT)" },
                                                            { col: "Description *", desc: "Detailed description of the tool" },
                                                            { col: "Category", desc: "Text Generation, Image Generation, Code Assistant, etc." },
                                                            { col: "Pricing", desc: "Free, Premium, Subscription, Freemium" },
                                                            { col: "Website URL", desc: "Official website (https://example.com)" },
                                                            { col: "Rating", desc: "Rating 0-5 (e.g. 4.5)" },
                                                            { col: "Reviews", desc: "Total review count (e.g. 50000)" },
                                                            { col: "Pros", desc: "Advantages (comma-separated)" },
                                                            { col: "Cons", desc: "Disadvantages (comma-separated)" },
                                                            { col: "Features", desc: "Key features (comma-separated)" },
                                                            { col: "Logo URL", desc: "Image URL OR filename for upload" },
                                                            { col: "Gallery URLs", desc: "Screenshots (comma-separated URLs or filenames)" },
                                                            { col: "Pricing Tiers", desc: "JSON array of pricing plans" },
                                                        ].map(({ col, desc }) => (
                                                            <div key={col} className="flex gap-2">
                                                                <span className="text-primary font-mono font-bold min-w-[110px]">{col}</span>
                                                                <span className="text-muted-foreground">{desc}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ── Download Template ── */}
                                <button
                                    onClick={downloadTemplate}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5 transition-all"
                                >
                                    <Download size={16} /> Download AI Tools Template (with Examples)
                                </button>

                                {importStatus !== "running" && (
                                    <div
                                        ref={dropZoneRef}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all
                      ${isDragging ? "border-green-400 bg-green-500/10" : importFile ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-white/30 hover:bg-white/[0.02]"}`}
                                    >
                                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} />
                                        {importFile ? (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                                    <FileSpreadsheet size={24} className="text-green-400" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-green-400">{importFile.name}</div>
                                                    <div className="text-xs text-foreground/40 mt-1">{(importFile.size / 1024).toFixed(1)} KB • Click to change</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-secondary/30 border border-border flex items-center justify-center">
                                                    <Upload size={24} className="text-foreground/40" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-muted-foreground">1. Select Excel / CSV File</div>
                                                    <div className="text-xs text-foreground/40 mt-1">Drag & drop or click to browse</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ── Asset Upload Dropzone (New) ── */}
                                {importStatus === "idle" && (
                                    <div
                                        onClick={() => assetFileInputRef.current?.click()}
                                        className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-4
                                            ${importAssets.length > 0 ? "border-primary/50 bg-primary/5" : "border-white/5 hover:border-border"}
                                        `}
                                    >
                                        <input
                                            ref={assetFileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                // Strictly filter for images just in case the browser 'accept' attribute is bypassed
                                                const images = files.filter(f => f.type.startsWith('image/'));
                                                setImportAssets(images);
                                                if (images.length < files.length) {
                                                    toast.warning(`${files.length - images.length} non-image files ignored.`);
                                                }
                                            }}
                                        />
                                        <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center border border-border">
                                            <Upload size={18} className={importAssets.length > 0 ? "text-primary" : "text-foreground/40"} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold">{importAssets.length > 0 ? `${importAssets.length} Assets Selected` : "2. Select Image Assets (Required if using filenames)"}</div>
                                            <div className="text-[10px] text-foreground/40">Only images (PNG, JPG, SVG, WebP) are accepted for logos and galleries.</div>
                                        </div>
                                        {importAssets.length > 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setImportAssets([]); }}
                                                className="p-1 hover:bg-secondary/50 rounded-md text-foreground/40 hover:text-foreground"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* ── Progress Bar (while running) ── */}
                                {importStatus === "running" && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Importing tools...</span>
                                            <span className="font-bold text-primary">{importProgress}%</span>
                                        </div>
                                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                                animate={{ width: `${importProgress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── Row-by-row Results ── */}
                                {importRows.length > 0 && (
                                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                                        {importRows.map((row, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs border
                          ${row.status === "success" ? "bg-green-500/5 border-green-500/20 text-green-400"
                                                        : row.status === "error" ? "bg-red-500/5 border-red-500/20 text-red-400"
                                                            : "bg-secondary/30 border-border text-foreground/40"}`}
                                            >
                                                {row.status === "success" ? <CheckCircle2 size={13} />
                                                    : row.status === "error" ? <AlertCircle size={13} />
                                                        : <div className="w-3 h-3 rounded-full border border-border border-t-white/60 animate-spin" />}
                                                <span className="flex-1 truncate font-medium">{row.name}</span>
                                                <span>{row.status === "success" ? "Added" : row.status === "error" ? (row.message || "Failed") : "Pending..."}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Action Buttons ── */}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={closeImportModal} className="flex-1 py-3 bg-secondary/30 hover:bg-secondary/50 rounded-xl font-bold text-sm transition-colors">
                                        {importStatus === "done" ? "Close" : "Cancel"}
                                    </button>
                                    {importStatus !== "done" && (
                                        <button
                                            onClick={runImport}
                                            disabled={!importFile || importStatus === "running"}
                                            className="flex-[2] py-3 bg-green-500 text-background hover:bg-green-400 rounded-xl font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {importStatus === "running" ? (
                                                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Importing...</>
                                            ) : (
                                                <><Upload size={16} /> Start Import</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-border rounded-3xl w-full max-w-4xl overflow-hidden my-8"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                                        <Zap size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold font-display text-white">{editingId ? "Edit" : "Add New"} AI Tool</h3>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-sans">Manual Entry Mode</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleAddTool} className="p-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                                <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-primary/30"></span>
                                    1. Basic Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                    <div><label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Tool Name *</label><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. ChatGPT" /></div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Category *</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled className="bg-background">Select Category</option>
                                            {categoryOptions.map(cat => (
                                                <option key={cat.name} value={cat.name} className="bg-background">
                                                    {cat.name}
                                                </option>
                                            ))}
                                            <option value="Other" className="bg-background">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Pricing Label * (e.g. Free, Paid, Lifetime)</label>
                                        <input
                                            required
                                            value={formData.pricing}
                                            onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                            placeholder="Free / Paid / Freemium..."
                                        />
                                    </div>
                                    <div><label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Website URL *</label><input required type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="https://..." /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Rating *</label><input required type="number" step="0.1" max="5" min="0" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Number of Reviews</label><input type="number" value={formData.reviews_count} onChange={(e) => setFormData({ ...formData, reviews_count: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" /></div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Tool Logo / Icon</label>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white border border-border flex items-center justify-center overflow-hidden shrink-0 text-black">
                                                {iconFile ? (
                                                    <img src={URL.createObjectURL(iconFile)} className="w-full h-full object-contain" />
                                                ) : getSafeLogo(formData.icon_url) ? (
                                                    <img src={getSafeLogo(formData.icon_url)!} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-xl font-bold">{formData.name?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-muted-foreground/60 mb-1">Option A: Upload File</label>
                                                <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] || null)} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-background hover:file:bg-primary/90 transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-muted-foreground/60 mb-1">Option B: Logo URL (External or Uploaded Path)</label>
                                                <input value={formData.icon_url} onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-colors" placeholder="e.g. https://link.to/logo.png" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2"><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold ml-1">Full Description *</label><textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all min-h-[120px]" placeholder="Detailed description of the tool..." /></div>
                                    <div className="md:col-span-2 flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                                        <input
                                            type="checkbox"
                                            id="is_trending"
                                            checked={formData.is_trending === 1}
                                            onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked ? 1 : 0 })}
                                            className="w-5 h-5 accent-primary rounded cursor-pointer"
                                        />
                                        <label htmlFor="is_trending" className="text-sm font-bold text-foreground cursor-pointer flex items-center gap-2">
                                            <TrendingUp size={16} className="text-primary" /> Mark as Trending Tool (Highlights on Homepage)
                                        </label>
                                    </div>
                                </div>

                                <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6 mt-8 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-primary/30"></span>
                                    2. Features & Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                    <div className="md:col-span-2"><label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Key Features</label><input value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Text generation, Code formatting, API Access" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Pros</label><textarea value={formData.pros} onChange={(e) => setFormData({ ...formData, pros: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[80px]" placeholder="e.g. Very fast, Great UI, Free tier" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Cons</label><textarea value={formData.cons} onChange={(e) => setFormData({ ...formData, cons: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[80px]" placeholder="e.g. Expensive, Learning curve" /></div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold text-primary">Tool Screenshots / Images (Optional)</label>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-muted-foreground/60 mb-1">
                                                    Option A: Upload Images ({mediaFiles.length} selected)
                                                </label>
                                                <input type="file" multiple accept="image/*" onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-background hover:file:bg-primary/90 transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-muted-foreground/60 mb-1">Option B: Image URLs (Comma-separated)</label>
                                                <input value={formData.media_urls} onChange={(e) => setFormData({ ...formData, media_urls: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-colors" placeholder="e.g. https://link.to/image1.png, https://link.to/image2.jpg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6 mt-8 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-primary/30"></span>
                                    3. Pricing Tiers
                                </h4>
                                {pricingTiers.map((tier, index) => (
                                    <div key={index} className="p-4 bg-secondary/30 border border-border rounded-xl mb-3 relative">
                                        <button type="button" onClick={() => removeTier(index)} className="absolute top-2 right-2 text-muted-foreground/60 hover:text-red-400"><X size={16} /></button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                            <div><label className="block text-xs text-muted-foreground mb-1">Plan Name</label><input value={tier.name} onChange={(e) => updateTier(index, 'name', e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Pro Plan" /></div>
                                            <div><label className="block text-xs text-muted-foreground mb-1">Price</label><input value={tier.price} onChange={(e) => updateTier(index, 'price', e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. $20" /></div>
                                            <div><label className="block text-xs text-muted-foreground mb-1">Billing (e.g. /mo, /yr)</label><input value={tier.interval} onChange={(e) => updateTier(index, 'interval', e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. /monthly" /></div>
                                        </div>
                                        <div><label className="block text-xs text-muted-foreground mb-1">Included Features (Comma separated)</label><input value={tier.features} onChange={(e) => updateTier(index, 'features', e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. 500 Credits, 4K Quality" /></div>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddTier} className="w-full py-3 border border-dashed border-border rounded-xl text-muted-foreground text-sm hover:text-foreground hover:border-white/50 hover:bg-secondary/30 transition-all text-center mb-6">
                                    + Add Pricing Tier
                                </button>

                                <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6 mt-8 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-primary/30"></span>
                                    4. Extended Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                    <div className="md:col-span-2"><label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Prompts / Examples (Comma separated)</label><textarea value={formData.prompts} onChange={(e) => setFormData({ ...formData, prompts: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[100px]" placeholder="e.g. Write a poem about space, Code a React button" /></div>
                                </div>

                                <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6 mt-8 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-primary/30"></span>
                                    5. Q&A / FAQs
                                </h4>
                                {faqs.map((faq, index) => (
                                    <div key={index} className="p-4 bg-secondary/30 border border-border rounded-xl mb-3 relative">
                                        <button type="button" onClick={() => removeFaq(index)} className="absolute top-2 right-2 text-muted-foreground/60 hover:text-red-400"><X size={16} /></button>
                                        <div className="space-y-3">
                                            <div><label className="block text-xs text-muted-foreground mb-1">Question</label><input value={faq.question} onChange={(e) => updateFaq(index, 'question', e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Is there a free trial?" /></div>
                                            <div><label className="block text-xs text-muted-foreground mb-1">Answer</label><textarea value={faq.answer} onChange={(e) => updateFaq(index, 'answer', e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[60px]" placeholder="e.g. Yes, we offer a 7-day free trial..." /></div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddFaq} className="w-full py-3 border border-dashed border-border rounded-xl text-muted-foreground text-sm hover:text-foreground hover:border-white/50 hover:bg-secondary/30 transition-all text-center mb-6">
                                    + Add FAQ
                                </button>

                                <div className="flex gap-4 pt-6 border-t border-border">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-secondary/30 hover:bg-secondary/50 rounded-xl font-bold transition-colors">Cancel</button>
                                    <button type="submit" disabled={isLoading} className="flex-[2] py-3 bg-primary text-primary-foreground hover:bg-white/90 rounded-xl font-bold transition-colors disabled:opacity-50">
                                        {isLoading ? "Saving..." : (editingId ? "Update Tool" : "Add Content to Platform")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
