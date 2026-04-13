import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Plus, Pin, Lock, ShieldCheck, User, Clock, 
  Search, Send, X, Loader2, Sparkles, Filter, ChevronRight, Hash, Triangle, Trash2, Pencil,
  ArrowUp, ArrowDown, Upload
} from "lucide-react";
import { API_ENDPOINTS } from "@/config/apiConfig";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Forum = () => {
    const [threads, setThreads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Form state
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("General");
    const [newContent, setNewContent] = useState("");
    const [newHashtags, setNewHashtags] = useState("");
    const [newImage, setNewImage] = useState<File | null>(null);

    const currentUser = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
    })();
    const navigate = useNavigate();

    const categories = ["All", "General", "Questions", "Showcase", "Tutorials", "Feedback"];

    const fetchThreads = async () => {
        setIsLoading(true);
        try {
            let url = `${API_ENDPOINTS.COMMUNITY}?uid=${currentUser?.id || 0}`;
            if (selectedCategory !== "All") url += `&category=${selectedCategory}`;
            const res = await fetch(url);
            const result = await res.json();
            if (result.status === "success") {
                setThreads(result.data);
            }
        } catch { 
            toast.error("Failed to load forum threads"); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { 
        fetchThreads(); 
    }, [selectedCategory]);



    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search');
        if (search) {
            setSearchQuery(search);
            // Scroll to results
            setTimeout(() => {
                window.scrollTo({ top: 400, behavior: 'smooth' });
            }, 500);
        }
    }, [window.location.search]);

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) { navigate("/login"); return; }
        if (!newTitle.trim() || !newContent.trim()) { toast.error("Please fill all fields"); return; }

        setIsPosting(true);
        try {
            const formData = new FormData();
            formData.append("action", "create");
            formData.append("user_id", currentUser.id);
            formData.append("user_name", currentUser.fullName);
            formData.append("title", newTitle.trim());
            formData.append("category", newCategory);
            formData.append("content", newContent.trim());
            formData.append("hashtags", newHashtags.trim());
            if (newImage) {
                formData.append("image", newImage);
            }

            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                body: formData,
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Thread posted successfully!");
                setShowNewThreadModal(false);
                setNewTitle("");
                setNewContent("");
                setNewHashtags("");
                setNewImage(null);
                fetchThreads();
            } else { toast.error(result.message); }
        } catch { toast.error("Post failed"); }
        finally { setIsPosting(false); }
    };

    const handleVote = async (e: React.MouseEvent, threadId: number, type: 'upvote' | 'downvote') => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) { navigate("/login"); return; }
        
        try {
            const res = await fetch(API_ENDPOINTS.UPVOTES, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    target_id: threadId.toString(),
                    target_type: 'thread',
                    action_type: type
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success(result.action === 'added' ? "Vote recorded!" : (result.action === 'removed' ? "Vote removed" : "Vote updated"));
                
                // Optimistic update
                setThreads(prev => prev.map(t => {
                    if (t.id === threadId) {
                        let upCount = parseInt(t.upvotes_count || 0);
                        let downCount = parseInt(t.downvotes_count || 0);
                        
                        if (type === 'upvote') {
                            if (result.action === 'added') upCount++;
                            else if (result.action === 'removed') upCount--;
                            else if (result.action === 'updated') { upCount++; downCount--; }
                        } else {
                            if (result.action === 'added') downCount++;
                            else if (result.action === 'removed') downCount--;
                            else if (result.action === 'updated') { downCount++; upCount--; }
                        }
                        
                        return { 
                            ...t, 
                            upvotes_count: result.new_upvotes ?? result.new_count ?? result.upvotes ?? result.count ?? upCount,
                            downvotes_count: result.new_downvotes ?? result.downvotes ?? downCount,
                            user_vote: result.user_vote 
                        };
                    }
                    return t;
                }));
            }
        } catch {
            toast.error("Vote failed");
        }
    };

    const handleDeleteThread = async (e: React.MouseEvent, threadId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) return;
        if (!confirm("Delete this discussion permanently?")) return;

        try {
            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: 'delete',
                    user_id: currentUser.id,
                    thread_id: threadId
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Discussion deleted");
                fetchThreads();
            } else { toast.error(result.message); }
        } catch { toast.error("Deletion error"); }
    };

    const handleModeration = async (e: React.MouseEvent, threadId: number, action: 'pin' | 'lock' | 'hide', currentStatus: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser || currentUser.role !== 'admin') return;
        try {
            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    admin_id: currentUser.id,
                    thread_id: threadId,
                    status: !currentStatus
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success(result.message);
                fetchThreads();
            } else { toast.error(result.message); }
        } catch { toast.error("Moderation error"); }
    };

    const filteredThreads = threads.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (t.hashtags && t.hashtags.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const getPopularHashtags = () => {
        const counts: { [key: string]: number } = {};
        threads.forEach(t => {
            if (t.hashtags) {
                const tags = t.hashtags.split(/\s+/).filter(tag => tag.trim() !== "");
                tags.forEach(tag => {
                    const normalized = tag.startsWith("#") ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
                    counts[normalized] = (counts[normalized] || 0) + 1;
                });
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag);
    };

    const popularTags = getPopularHashtags();

    const handleTagClick = (tag: string) => {
        setSearchQuery(tag);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };
    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return dateStr; }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-black text-slate-900 dark:text-white font-sans transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-40 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {!currentUser ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[32px] p-12 md:p-20 text-center shadow-xl"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <Lock size={40} className="text-primary" />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black mb-4 dark:text-white">Access Restricted</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto">
                                To view and participate in the community forum, please log in to your account.
                            </p>
                            <Button 
                                onClick={() => navigate("/login")}
                                className="bg-primary text-black hover:bg-primary/90 font-black rounded-2xl h-14 px-12 text-lg shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            >
                                Log In to Explore
                            </Button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div className="space-y-2 text-center md:text-left">
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-center md:justify-start gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]"
                                    >
                                        <Sparkles size={12} /> Community Hub
                                    </motion.div>
                                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                        Collective <span className="text-primary">Intelligence</span>
                                    </h1>
                                    <p className="text-slate-500 max-w-lg mx-auto md:mx-0 text-sm md:text-base">
                                        Connect with AI founders, prompt engineers, and tech enthusiasts.
                                    </p>
                                </div>

                                <Button 
                                    onClick={() => setShowNewThreadModal(true)}
                                    className="bg-primary text-black hover:bg-primary/90 font-black rounded-2xl h-12 md:h-14 px-6 md:px-8 transition-all hover:scale-105 w-full md:w-auto mt-4 md:mt-0"
                                >
                                    <Plus size={20} className="mr-2" /> Start Discussion
                                </Button>
                            </div>

                            {/* Stats & Search Bar */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                                <div className="lg:col-span-3 space-y-8">
                                    
                                    {/* Filters & Search - Regular Style */}
                                    <div className="flex flex-col gap-4">
                                        <div className="relative w-full">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                type="text"
                                                placeholder="Search discussions (e.g. #ai)..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full h-12 md:h-14 pl-12 pr-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary transition-all font-medium text-slate-700 dark:text-white text-sm"
                                            />
                                            {searchQuery && (
                                                <button 
                                                    onClick={() => setSearchQuery("")}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className={`h-10 md:h-14 px-4 md:px-6 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                                                        selectedCategory === cat 
                                                        ? "bg-primary text-black border-b-2 border-black/10" 
                                                        : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-white/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Threads List */}
                                    <div className="space-y-4">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center py-20">
                                                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Knowledge...</p>
                                            </div>
                                        ) : filteredThreads.length === 0 ? (
                                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[32px] p-20 text-center">
                                                <MessageSquare size={48} className="mx-auto text-slate-200 mb-6" />
                                                <h3 className="text-xl font-bold text-slate-800 mb-2">No discussions found</h3>
                                                <p className="text-slate-500 text-sm">Be the first to start a conversation in this category!</p>
                                            </div>
                                        ) : (
                                            filteredThreads.map((thread, idx) => (
                                                <motion.div
                                                    key={thread.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`group block bg-white dark:bg-zinc-900 border rounded-[32px] p-6 transition-all hover:border-primary/30 relative overflow-hidden ${thread.is_pinned ? "border-primary/50" : "border-slate-200 dark:border-white/10 cursor-pointer"}`}
                                                    onClick={() => navigate(`/community/${thread.id}`)}
                                                >
                                                    {!!thread.is_pinned && (
                                                        <div className="absolute top-0 right-4 md:right-10 bg-primary text-black px-2 md:px-3 py-1 rounded-b-lg md:rounded-b-xl text-[8px] md:text-[10px] font-black uppercase tracking-tighter animate-pulse">
                                                            Pinned Activity
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex flex-col md:flex-row gap-6">
                                                        <div className="flex-grow space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                                    {thread.category}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                                                    <Clock size={14} /> {formatDate(thread.created_at)}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold border-l dark:border-white/10 pl-3 border-slate-100">
                                                                    <ArrowUp size={14} className={thread.user_vote == 1 ? "text-orange-500" : "text-primary"} /> {thread.upvotes_count || 0}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                                                    {thread.title}
                                                                    {!!thread.is_locked && <Lock size={16} className="text-slate-400" />}
                                                                </h2>
                                                                <p className="text-slate-500 text-sm line-clamp-2 mt-2 leading-relaxed">
                                                                    {thread.content}
                                                                </p>
                                                                {thread.hashtags && (
                                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                                        {thread.hashtags.split(/\s+/).filter((s: string) => s.trim() !== "").map((tag: string, i: number) => {
                                                                            const displayTag = tag.startsWith('#') ? tag : `#${tag}`;
                                                                            return (
                                                                                <span 
                                                                                    key={i} 
                                                                                    onClick={(e) => { e.stopPropagation(); handleTagClick(displayTag); }}
                                                                                    className="text-[11px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
                                                                                >
                                                                                    {displayTag}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                                                                <div className="flex items-center gap-2 md:gap-3">
                                                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] md:text-xs font-black text-primary border border-primary/20 flex-shrink-0">
                                                                        {thread.user_name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="text-[12px] md:text-sm font-bold text-slate-700 dark:text-white/80 line-clamp-1">
                                                                        {thread.user_name}
                                                                        <span className="hidden md:block text-[10px] font-medium text-slate-400 dark:text-white/40 uppercase tracking-widest">Thought Leader</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {/* Admin Controls */}
                                                                    {currentUser?.role === 'admin' && (
                                                                        <div className="flex gap-1 border-r pr-2 border-slate-100 dark:border-white/10">
                                                                            <button 
                                                                                onClick={(e) => handleModeration(e, thread.id, 'pin', thread.is_pinned == 1)}
                                                                                className={`p-2 rounded-xl transition-all ${thread.is_pinned == 1 ? "bg-primary text-black" : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:bg-primary/20 hover:text-primary"}`}
                                                                                title="Pin Discussion"
                                                                            >
                                                                                <Pin size={16} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={(e) => handleModeration(e, thread.id, 'lock', thread.is_locked == 1)}
                                                                                className={`p-2 rounded-xl transition-all ${thread.is_locked == 1 ? "bg-slate-900 dark:bg-zinc-800 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:bg-slate-900 dark:hover:bg-zinc-700 hover:text-white"}`}
                                                                                title="Lock Discussion"
                                                                            >
                                                                                <Lock size={16} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={(e) => handleDeleteThread(e, thread.id)}
                                                                                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all"
                                                                                title="Delete Discussion"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {/* Author Only Edit/Delete */}
                                                                    {currentUser?.id == thread.user_id && currentUser?.role !== 'admin' && (
                                                                        <div className="flex gap-1 border-r pr-2 border-slate-100 dark:border-white/10">
                                                                             <button 
                                                                                onClick={(e) => { e.stopPropagation(); navigate(`/community/${thread.id}?edit=true`); }}
                                                                                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:bg-primary/20 hover:text-primary transition-all"
                                                                                title="Edit My Discussion"
                                                                            >
                                                                                <Pencil size={16} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={(e) => handleDeleteThread(e, thread.id)}
                                                                                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all"
                                                                                title="Delete My Discussion"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex gap-2 md:gap-3 items-center">
                                                                      <div className="flex bg-slate-100/50 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 scale-90 md:scale-100 items-center">
                                                                        <button 
                                                                            onClick={(e) => handleVote(e, thread.id, 'upvote')}
                                                                            className={`p-1.5 md:p-2 flex items-center gap-1.5 transition-all ${thread.user_vote == 1 ? "text-orange-500 bg-orange-50 dark:bg-orange-500/10" : "text-slate-400 dark:text-white/30 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-white/5"}`}
                                                                            title="Upvote"
                                                                        >
                                                                            <ArrowUp size={18} strokeWidth={3} className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                            <span className="text-[10px] md:text-xs font-black">{thread.upvotes_count || 0}</span>
                                                                        </button>
                                                                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-0.5" />
                                                                        <button 
                                                                            onClick={(e) => handleVote(e, thread.id, 'downvote')}
                                                                            className={`p-1.5 md:p-2 flex items-center gap-1.5 transition-all ${thread.user_vote == -1 ? "text-blue-500 bg-blue-50 dark:bg-blue-500/10" : "text-slate-400 dark:text-white/30 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/5"}`}
                                                                            title="Downvote"
                                                                        >
                                                                            <span className="text-[10px] md:text-xs font-black">{thread.downvotes_count || 0}</span>
                                                                            <ArrowDown size={18} strokeWidth={3} className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                        </button>
                                                                      </div>
                                                                      <Button variant="ghost" className="text-primary font-black text-[10px] md:text-xs hover:bg-primary/5 uppercase tracking-widest px-0 flex-shrink-0">
                                                                          <span className="hidden md:inline">Read Thread</span> <ChevronRight size={14} className="ml-1" />
                                                                      </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Sidebar - Hidden on mobile, shown on large screens */}
                                <div className="hidden lg:block space-y-8">
                                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[32px] p-8 shadow-sm">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                            <Hash size={14} /> Popular Topics
                                        </h3>
                                        <div className="space-y-4">
                                            {popularTags.length > 0 ? (
                                                popularTags.map(tag => (
                                                    <div 
                                                        key={tag} 
                                                        onClick={() => handleTagClick(tag)}
                                                        className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform"
                                                    >
                                                        <span className="text-slate-600 dark:text-white/60 font-bold text-sm group-hover:text-primary transition-colors">{tag}</span>
                                                        <span className="text-[10px] font-black px-2 py-1 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">Popular</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] font-bold text-slate-400 italic">No hashtags yet...</p>
                                            )}
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* New Thread Modal */}
            <AnimatePresence>
                {showNewThreadModal && (
                    <div 
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer"
                        onClick={() => setShowNewThreadModal(false)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-[40px] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh] border border-white/20 dark:border-white/10 overflow-hidden cursor-default"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Start Discussion</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Join the Collective Mind</p>
                                </div>
                                <button onClick={() => setShowNewThreadModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreateThread} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Discussion Title</label>
                                    <input 
                                        type="text"
                                        placeholder="What's on your mind?"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full h-14 px-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold text-slate-700 dark:text-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {categories.filter(c => c !== "All").map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setNewCategory(cat)}
                                                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${newCategory === cat ? "bg-primary border-primary text-black shadow-lg shadow-primary/10" : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:border-primary/50"}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Deep Dive Content</label>
                                    <textarea 
                                        placeholder="Share your insights, ask a question, or show off a project..."
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        rows={6}
                                        className="w-full px-6 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] focus:outline-none focus:border-primary transition-all font-medium text-slate-700 dark:text-white resize-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Attachment (Optional)</label>
                                    <div className="relative group/file">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full h-14 px-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-3 transition-all group-hover/file:border-primary/50 overflow-hidden">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Upload size={16} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 truncate">
                                                {newImage ? newImage.name : "Click to upload discussion image"}
                                            </span>
                                            {newImage && (
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { e.stopPropagation(); setNewImage(null); }}
                                                    className="ml-auto p-1.5 hover:bg-red-500/10 text-red-500 rounded-md z-20"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Hashtags (Space separated)</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. #ai #saas #automation"
                                        value={newHashtags}
                                        onChange={(e) => setNewHashtags(e.target.value)}
                                        className="w-full h-14 px-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold text-slate-700 dark:text-white"
                                    />
                                </div>

                                <Button 
                                    type="submit"
                                    disabled={isPosting}
                                    className="w-full bg-slate-900 text-white hover:bg-slate-800 font-black rounded-2xl h-16 shadow-xl transition-all active:scale-[0.98]"
                                >
                                    {isPosting ? <Loader2 className="animate-spin mr-2" /> : <Send size={20} className="mr-2" />}
                                    {isPosting ? "Publishing Thinking..." : "Launch Discussion"}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default Forum;
