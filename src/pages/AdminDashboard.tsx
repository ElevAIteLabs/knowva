import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, Trash2, ShieldAlert, Edit2, CheckCircle2, Zap,
    Layers, X, FileSpreadsheet, Upload, Download, AlertCircle,
    ChevronDown, ChevronUp, Info, BarChart2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import * as xlsx from "xlsx";
import { toast } from "sonner";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";

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
    });
    const [pricingTiers, setPricingTiers] = useState<any[]>([]);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [stats, setStats] = useState({ totalTools: 0 });

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
    }, [navigate]);

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
    const handleAddTier = () => setPricingTiers([...pricingTiers, { name: "", price: "", features: "" }]);
    const updateTier = (index: number, field: string, value: string) => {
        const updated = [...pricingTiers];
        updated[index][field] = value;
        setPricingTiers(updated);
    };
    const removeTier = (index: number) => setPricingTiers(pricingTiers.filter((_, i) => i !== index));

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
                if (!["pros", "cons", "features", "media_urls", "pricing_tiers"].includes(key)) {
                    data.append(key, value);
                }
            });

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
                features: t.features.split(',').map((s: string) => s.trim()).filter(Boolean)
            }))));

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
        setFormData({ name: "", description: "", category: "Text Generation", pricing: "Free", website_url: "", rating: "4.5", reviews_count: "0", pros: "", cons: "", features: "", icon_url: "", media_urls: "" });
        setPricingTiers([]);
        setIconFile(null);
        setMediaFiles([]);
    };

    // ── Edit click handler ────────────────────────────────────────────────────────
    const handleEditClick = (tool: any) => {
        const safeParseJoin = (str: string) => {
            if (!str) return '';
            try {
                const parsed = JSON.parse(str);
                return Array.isArray(parsed) ? parsed.join(', ') : str;
            } catch {
                return str; // If not JSON, return as is (raw comma separated)
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
        });
        setPricingTiers(parsedTiers.map((t: any) => ({ name: t.name, price: t.price, features: t.features.join(', ') })));
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
                "Name": "Example Tool",
                "Description": "A brief description of what this tool does.",
                "Category": "Text Generation",
                "Pricing": "Free",
                "Website URL": "https://example.com",
                "Rating": "4.5",
                "Reviews": "100",
                "Pros": "Easy to use, Fast, Free tier",
                "Cons": "Limited credits, No offline mode",
                "Features": "AI Writing, Code completion, API Access",
                "Logo URL": "https://example.com/logo.png",
                "Gallery URLs": "https://example.com/screenshot1.png, https://example.com/screenshot2.png"
            }
        ];
        const ws = xlsx.utils.json_to_sheet(templateData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Tools");
        xlsx.writeFile(wb, "knowva_tools_template.xlsx");
        toast.success("Template downloaded!");
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

            const rows: ImportRow[] = jsonData.map(row => ({
                name: row["Name"] || row["Tool Name"] || "(unnamed)",
                status: "pending"
            }));
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
                    return str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];
                };

                const mediaUrls = splitArr(["Media URLs", "Gallery", "Screenshots", "Gallery URLs", "Images", "Media"]);
                const iconPath = getVal(["Icon URL", "Logo URL", "Logo", "Icon", "Image URL", "Thumbnail"]);

                const toolData = new FormData();
                toolData.append("name", getVal(["Name", "Tool Name", "Tool", "Title"]));
                toolData.append("description", getVal(["Description", "About", "Summary"]));
                toolData.append("category", getVal(["Category", "Type"], "Other"));
                toolData.append("pricing", getVal(["Pricing", "Price", "Cost"], "Free"));
                toolData.append("website_url", getVal(["Website URL", "Website", "Link", "URL"]));
                toolData.append("rating", getVal(["Rating", "Stars", "Score"], "4.5"));
                toolData.append("reviews_count", getVal(["Reviews", "Reviews Count", "Count"], "0"));

                // Match local assets for the icon
                if (iconPath && !iconPath.startsWith('http')) {
                    const matchedIcon = importAssets.find(f => f.name === iconPath || f.name === iconPath.split('/').pop());
                    if (matchedIcon) {
                        toolData.append("icon", matchedIcon);
                    } else {
                        toolData.append("icon_url", iconPath);
                    }
                } else {
                    toolData.append("icon_url", iconPath);
                }

                // Match local assets for the gallery
                const finalMediaUrls: string[] = [];
                mediaUrls.forEach(url => {
                    if (url.startsWith('http')) {
                        finalMediaUrls.push(url);
                    } else {
                        const matchedFile = importAssets.find(f => f.name === url || f.name === url.split('/').pop());
                        if (matchedFile) {
                            toolData.append("media[]", matchedFile);
                        } else {
                            finalMediaUrls.push(url);
                        }
                    }
                });

                toolData.append("pros", JSON.stringify(splitArr(["Pros", "Advantages", "Benefits"])));
                toolData.append("cons", JSON.stringify(splitArr(["Cons", "Disadvantages", "Drawbacks"])));
                toolData.append("features", JSON.stringify(splitArr(["Features", "Capabilities"])));
                toolData.append("media_urls", JSON.stringify(finalMediaUrls));
                toolData.append("pricing_tiers", getVal(["Pricing Tiers", "Tiers", "Plans"], "[]"));

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

    // ─── JSX ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans">
            <Navbar />

            <main className="flex-grow pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">

                {/* ── Dashboard Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between w-full md:items-end mb-10 gap-6 glass-card p-8 glow-box mt-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                            <ShieldAlert size={32} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Command Center</h1>
                            <p className="text-white/40 text-sm max-w-xs">Manage AI tools, update system metrics, and monitor platform usage.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Bulk Import button */}
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-5 py-3 rounded-xl font-bold hover:bg-green-500/20 transition-all active:scale-95 text-sm"
                        >
                            <FileSpreadsheet size={18} /> Bulk Import Excel
                        </button>
                        {/* Add New Tool button */}
                        <button
                            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                            className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:shadow-white/10 active:scale-95 text-sm"
                        >
                            <Plus size={18} /> Add New Tool
                        </button>
                    </div>
                </div>

                {/* ── Stats Bar ────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {[
                        { label: "Total Tools in DB", value: stats.totalTools, icon: <Layers size={20} className="text-primary" /> },
                        { label: "Active Categories", value: "8", icon: <BarChart2 size={20} className="text-blue-400" /> },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-xl font-bold">{stat.value}</div>
                                <div className="text-xs text-white/40">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tool Database Table ───────────────────────────────────────────── */}
                <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="text-lg font-bold font-display flex items-center gap-2">
                            <Layers className="text-primary w-5 h-5" /> Tool Database
                            <span className="ml-2 text-xs font-normal text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{tools.length} entries</span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#0A0A0A] text-white/50 uppercase text-xs tracking-wider border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Asset / Tool</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tools.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-white/40">
                                            <FileSpreadsheet size={32} className="mx-auto mb-3 opacity-30" />
                                            No tools found. Add your first tool or import from Excel!
                                        </td>
                                    </tr>
                                ) : (
                                    tools.map((tool) => (
                                        <tr key={tool.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                        {tool.icon_url ? (
                                                            <img
                                                                src={tool.icon_url.startsWith('http')
                                                                    ? tool.icon_url
                                                                    : `${API_BASE_URL}/${tool.icon_url.startsWith('/') ? tool.icon_url.slice(1) : tool.icon_url}`}
                                                                className="w-full h-full object-cover"
                                                                alt={tool.name}
                                                            />
                                                        ) : (
                                                            <Zap size={16} className="text-white/20" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-white group-hover:text-primary transition-colors">{tool.name}</div>
                                                        <div className="text-xs text-white/40">{tool.pricing} • {tool.rating}⭐</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-white/70 border border-white/10 group-hover:border-white/20 transition-colors">
                                                    {tool.category}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEditClick(tool)} className="p-2 text-white/30 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteTool(tool.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#141414]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <FileSpreadsheet size={20} className="text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold font-display">Bulk Import via Excel / CSV</h3>
                                        <p className="text-xs text-white/40">Upload a spreadsheet to add multiple tools at once</p>
                                    </div>
                                </div>
                                <button onClick={closeImportModal} className="text-white/40 hover:text-white transition-colors p-1"><X size={22} /></button>
                            </div>

                            <div className="p-6 space-y-5">

                                {/* ── Column Format Guide (Collapsible) ── */}
                                <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                                    <button
                                        onClick={() => setShowColumnGuide(v => !v)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white/70 hover:text-white transition-colors"
                                    >
                                        <span className="flex items-center gap-2"><Info size={15} className="text-primary" /> Required Column Format</span>
                                        {showColumnGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    <AnimatePresence>
                                        {showColumnGuide && (
                                            <motion.div
                                                initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 border-t border-white/10 pt-3">
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        {[
                                                            { col: "Name *", desc: "Tool name (required)" },
                                                            { col: "Description *", desc: "Full description" },
                                                            { col: "Category", desc: "e.g. Text Generation" },
                                                            { col: "Pricing", desc: "e.g. Free / Premium" },
                                                            { col: "Website URL", desc: "Full URL with https://" },
                                                            { col: "Rating", desc: "Number 0–5 (e.g. 4.5)" },
                                                            { col: "Reviews", desc: "Review count (e.g. 100)" },
                                                            { col: "Pros", desc: "Comma-separated list" },
                                                            { col: "Cons", desc: "Comma-separated list" },
                                                            { col: "Features", desc: "Comma-separated list" },
                                                            { col: "Icon URL", desc: "URL to logo/icon" },
                                                            { col: "Media URLs", desc: "Comma-separated image URLs" },
                                                        ].map(({ col, desc }) => (
                                                            <div key={col} className="flex gap-2">
                                                                <span className="text-primary font-mono font-bold min-w-[110px]">{col}</span>
                                                                <span className="text-white/50">{desc}</span>
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
                                    <Download size={16} /> Download Excel Template
                                </button>

                                {importStatus !== "running" && (
                                    <div
                                        ref={dropZoneRef}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all
                      ${isDragging ? "border-green-400 bg-green-500/10" : importFile ? "border-green-500/50 bg-green-500/5" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}`}
                                    >
                                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} />
                                        {importFile ? (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                                    <FileSpreadsheet size={24} className="text-green-400" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-green-400">{importFile.name}</div>
                                                    <div className="text-xs text-white/40 mt-1">{(importFile.size / 1024).toFixed(1)} KB • Click to change</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <Upload size={24} className="text-white/40" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-white/70">1. Select Excel / CSV File</div>
                                                    <div className="text-xs text-white/40 mt-1">Drag & drop or click to browse</div>
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
                                            ${importAssets.length > 0 ? "border-primary/50 bg-primary/5" : "border-white/5 hover:border-white/20"}
                                        `}
                                    >
                                        <input
                                            ref={assetFileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setImportAssets(Array.from(e.target.files || []))}
                                        />
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                            <Upload size={18} className={importAssets.length > 0 ? "text-primary" : "text-white/40"} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold">{importAssets.length > 0 ? `${importAssets.length} Assets Selected` : "2. Select Image Assets (Optional)"}</div>
                                            <div className="text-[10px] text-white/40">Tool will match filenames (e.g. "logo.png") provided in Excel.</div>
                                        </div>
                                        {importAssets.length > 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setImportAssets([]); }}
                                                className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white"
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
                                            <span className="text-white/60">Importing tools...</span>
                                            <span className="font-bold text-primary">{importProgress}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
                                                            : "bg-white/5 border-white/10 text-white/40"}`}
                                            >
                                                {row.status === "success" ? <CheckCircle2 size={13} />
                                                    : row.status === "error" ? <AlertCircle size={13} />
                                                        : <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin" />}
                                                <span className="flex-1 truncate font-medium">{row.name}</span>
                                                <span>{row.status === "success" ? "Added" : row.status === "error" ? (row.message || "Failed") : "Pending..."}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Action Buttons ── */}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={closeImportModal} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm transition-colors">
                                        {importStatus === "done" ? "Close" : "Cancel"}
                                    </button>
                                    {importStatus !== "done" && (
                                        <button
                                            onClick={runImport}
                                            disabled={!importFile || importStatus === "running"}
                                            className="flex-[2] py-3 bg-green-500 text-black hover:bg-green-400 rounded-xl font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {importStatus === "running" ? (
                                                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Importing...</>
                                            ) : (
                                                <><Upload size={16} /> Start Import</>
                                            )}
                                        </button>
                                    )}
                                    {importStatus === "done" && (
                                        <button
                                            onClick={() => { setImportFile(null); setImportRows([]); setImportProgress(0); setImportStatus("idle"); }}
                                            className="flex-[2] py-3 bg-green-500 text-black hover:bg-green-400 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Upload size={16} /> Import Another File
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ════════════════════════════════════════════════════════════════════════
          MODAL 2: Add / Edit Tool (Manual Form)
      ════════════════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#141414]">
                                <h3 className="text-xl font-bold font-display">{editingId ? "Edit" : "Add Detailed"} Tool</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleAddTool} className="p-6 overflow-y-auto max-h-[75vh]">
                                <h4 className="text-lg font-bold text-primary mb-4 pt-4 border-t border-white/10">1. Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                    <div><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Tool Name *</label><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. ChatGPT" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Category *</label><input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Text Generation" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Pricing Label *</label><input required value={formData.pricing} onChange={(e) => setFormData({ ...formData, pricing: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Premium / Free" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Website URL *</label><input required type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="https://..." /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Rating *</label><input required type="number" step="0.1" max="5" min="0" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Number of Reviews</label><input type="number" value={formData.reviews_count} onChange={(e) => setFormData({ ...formData, reviews_count: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" /></div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Tool Logo / Icon</label>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-white/30 mb-1">Option A: Upload File</label>
                                                <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] || null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90 transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-white/30 mb-1">Option B: Logo URL (External or Uploaded Path)</label>
                                                <input value={formData.icon_url} onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-colors" placeholder="e.g. https://link.to/logo.png" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2"><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Full Description *</label><textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[100px]" placeholder="Detailed description of the tool..." /></div>
                                </div>

                                <h4 className="text-lg font-bold text-primary mb-4 pt-4 border-t border-white/10">2. Features & Details (Comma Separated)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                    <div className="md:col-span-2"><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Key Features</label><input value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Text generation, Code formatting, API Access" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Pros</label><textarea value={formData.pros} onChange={(e) => setFormData({ ...formData, pros: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[80px]" placeholder="e.g. Very fast, Great UI, Free tier" /></div>
                                    <div><label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold">Cons</label><textarea value={formData.cons} onChange={(e) => setFormData({ ...formData, cons: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[80px]" placeholder="e.g. Expensive, Learning curve" /></div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-bold text-primary">Tool Screenshots / Images (Optional)</label>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-white/30 mb-1">
                                                    Option A: Upload Images ({mediaFiles.length} selected)
                                                </label>
                                                <input type="file" multiple accept="image/*" onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90 transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-white/30 mb-1">Option B: Image URLs (Comma-separated)</label>
                                                <input value={formData.media_urls} onChange={(e) => setFormData({ ...formData, media_urls: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-colors" placeholder="e.g. https://link.to/image1.png, https://link.to/image2.jpg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h4 className="text-lg font-bold text-primary mb-4 pt-4 border-t border-white/10">3. Pricing Tiers</h4>
                                {pricingTiers.map((tier, index) => (
                                    <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3 relative">
                                        <button type="button" onClick={() => removeTier(index)} className="absolute top-2 right-2 text-white/30 hover:text-red-400"><X size={16} /></button>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div><label className="block text-xs text-white/50 mb-1">Tier Name</label><input value={tier.name} onChange={(e) => updateTier(index, 'name', e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Pro" /></div>
                                            <div><label className="block text-xs text-white/50 mb-1">Price</label><input value={tier.price} onChange={(e) => updateTier(index, 'price', e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. $20/mo" /></div>
                                        </div>
                                        <div><label className="block text-xs text-white/50 mb-1">Included Features (Comma separated)</label><input value={tier.features} onChange={(e) => updateTier(index, 'features', e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. 500 Credits, 4K Quality" /></div>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddTier} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/50 text-sm hover:text-white hover:border-white/50 hover:bg-white/5 transition-all text-center mb-6">
                                    + Add Pricing Tier
                                </button>

                                <div className="flex gap-4 pt-6 border-t border-white/10">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Cancel</button>
                                    <button type="submit" disabled={isLoading} className="flex-[2] py-3 bg-white text-black hover:bg-white/90 rounded-xl font-bold transition-colors disabled:opacity-50">
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
