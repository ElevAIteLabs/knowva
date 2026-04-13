import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, MessageSquare, Send, User, Clock, Star, Share2,
    MoreVertical, ShieldCheck, Heart, TrendingUp, ChevronRight, ChevronLeft,
    Globe, Clock as ClockIcon, MessageCircle, AlertCircle,
    CheckCircle2, Sparkles, Pin, Lock, Trash2, Pencil, X, Loader2,
    Minus, Plus, ArrowUp, ArrowDown, Award, MoreHorizontal, MinusCircle, PlusCircle, Flag, Upload
} from "lucide-react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/apiConfig";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CommentList from "@/components/forum/CommentList";

const getUserColor = (name: string) => {
    const colors = [
        'bg-rose-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
        'bg-violet-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-teal-500',
        'bg-orange-500', 'bg-cyan-500'
    ];
    let hash = 0;
    const userName = name || "Anonymous";
    for (let i = 0; i < userName.length; i++) {
        hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};



const ThreadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [thread, setThread] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [downvoteCount, setDownvoteCount] = useState(0);
    const [userVote, setUserVote] = useState(0);
    const [upvoteLoading, setUpvoteLoading] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editCategory, setEditCategory] = useState("General");
    const [editHashtags, setEditHashtags] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isMainReplying, setIsMainReplying] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('oldest');
    const [editImage, setEditImage] = useState<File | null>(null);

    const currentUser = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
    })();

    const fetchThreadDetail = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.COMMUNITY}?thread_id=${id}`);
            const result = await res.json();
            if (result.status === "success") {
                setThread(result.data.thread);
                setReplies(result.data.replies);
                setEditTitle(result.data.thread.title);
                setEditContent(result.data.thread.content);
                setEditCategory(result.data.thread.category || "General");
                setEditHashtags(result.data.thread.hashtags || "");
            } else {
                toast.error(result.message);
                navigate("/community");
            }
        } catch {
            toast.error("Failed to load thread");
            navigate("/community");
        } finally {
            setIsLoading(false);
        }
    };
    const fetchUpvotes = async () => {
        try {
            const res = await fetch(`${API_ENDPOINTS.UPVOTES}?target_id=${id}&target_type=thread&user_id=${currentUser?.id || 0}`);
            const result = await res.json();
            if (result.status === "success") {
                setUpvoteCount(result.upvotes || result.count || 0);
                setDownvoteCount(result.downvotes || 0);
                setUserVote(result.user_vote);
            }
        } catch { }
    };



    useEffect(() => {
        fetchThreadDetail();
        fetchUpvotes();
        
        // Check for edit query param
        const params = new URLSearchParams(window.location.search);
        if (params.get('edit') === 'true') {
            setIsEditing(true);
        }
    }, [id, currentUser?.id]);

    const onVoteReply = async (replyId: number, type: 'upvote' | 'downvote') => {
        if (!currentUser) { navigate("/login"); return; }
        try {
            const res = await fetch(API_ENDPOINTS.UPVOTES, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUser.id, target_id: replyId, target_type: 'reply', action_type: type }),
            });
            return await res.json();
        } catch { return { status: "error" }; }
    };

    const handleVote = async (type: 'upvote' | 'downvote') => {
        if (!currentUser) { navigate("/login"); return; }
        setUpvoteLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.UPVOTES, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    target_id: id,
                    target_type: 'thread',
                    action_type: type
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                let newUp = upvoteCount;
                let newDown = downvoteCount;
                
                if (type === 'upvote') {
                    if (result.action === 'added') newUp++;
                    else if (result.action === 'removed') newUp--;
                    else if (result.action === 'updated') { newUp++; newDown--; }
                } else {
                    if (result.action === 'added') newDown++;
                    else if (result.action === 'removed') newDown--;
                    else if (result.action === 'updated') { newDown++; newUp--; }
                }

                setUpvoteCount(result.new_upvotes ?? result.new_count ?? result.upvotes ?? result.count ?? newUp);
                setDownvoteCount(result.new_downvotes ?? result.downvotes ?? newDown);
                setUserVote(result.user_vote);
                toast.success("Vote updated!");
            }
        } catch { toast.error("Vote failed"); }
        finally { setUpvoteLoading(false); }
    };

    const handlePostReply = async (content: string, parentId: number | null = null) => {
        if (!currentUser) { navigate("/login"); return; }
        if (!content.trim()) { toast.error("Please write something"); return; }

        setIsPosting(true);
        try {
            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reply",
                    thread_id: id,
                    user_id: currentUser.id,
                    user_name: currentUser.fullName,
                    content: content.trim(),
                    parent_id: parentId
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Response published!");
                if (!parentId) setReplyContent("");
                fetchThreadDetail();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Reply failed");
        } finally {
            setIsPosting(false);
        }
    };

    const handleUpdateThread = async () => {
        if (!currentUser || !thread) return;
        if (!editTitle.trim() || !editContent.trim()) {
            toast.error("Please fill all fields");
            return;
        }

        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append("action", "edit");
            formData.append("thread_id", id as string);
            formData.append("user_id", currentUser.id);
            formData.append("title", editTitle.trim());
            formData.append("content", editContent.trim());
            formData.append("category", editCategory);
            formData.append("hashtags", editHashtags.trim());
            if (editImage) {
                formData.append("image", editImage);
            }

            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                body: formData,
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Thread updated!");
                setIsEditing(false);
                setEditImage(null);
                fetchThreadDetail();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Update failed");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteThread = async () => {
        if (!currentUser || !thread) return;
        if (!window.confirm("Are you sure you want to delete this discussion? This action cannot be undone.")) return;

        try {
            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "delete",
                    thread_id: id,
                    user_id: currentUser.id
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Discussion deleted");
                navigate("/community");
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleDeleteReply = async (replyId: number) => {
        if (!currentUser) return;
        if (!window.confirm("Delete this response?")) return;

        try {
            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "delete_reply",
                    reply_id: replyId,
                    user_id: currentUser.id
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Response deleted");
                fetchThreadDetail();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return dateStr; }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-background">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-background text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {!currentUser ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[32px] p-12 md:p-20 text-center shadow-xl"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <Lock size={40} className="text-primary" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black mb-4 dark:text-white">Discussion Restricted</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto">
                                To read this discussion and join the conversation, please log in to your account.
                            </p>
                            <Button 
                                onClick={() => navigate("/login")}
                                className="bg-primary text-black hover:bg-primary/90 font-black rounded-2xl h-14 px-12 text-lg shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            >
                                Log In to Read
                            </Button>
                        </motion.div>
                    ) : (
                        <>
                            <Link to="/community" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-bold text-sm mb-8 transition-colors group">
                                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Collective Mind
                            </Link>

                            {/* Main Thread Post - Threads Style */}
                            <div className="relative mb-8">
                                {/* Vertical Connection Line */}
                                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-100 dark:bg-zinc-900 hidden md:block" />

                                <div className="flex gap-4">
                                    {/* Avatar */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-full ${getUserColor(thread.user_name)} flex items-center justify-center text-lg font-black text-white border-2 border-white dark:border-background shadow-md ring-1 ring-black/5`}>
                                            {thread.user_name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Content Wrapper */}
                                    <div className="flex-grow pt-1 pb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-slate-900 dark:text-white hover:underline cursor-pointer">{thread.user_name}</span>
                                                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{formatDate(thread.created_at)}</span>
                                                {!!thread.is_pinned && (
                                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md text-[8px] font-black uppercase tracking-wider">Pinned</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">Sort by:</span>
                                                    <select
                                                        value={sortBy}
                                                        onChange={(e) => setSortBy(e.target.value as any)}
                                                        className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
                                                    >
                                                        <option value="oldest">Oldest</option>
                                                        <option value="newest">Newest</option>
                                                    </select>
                                                </div>
                                                {(currentUser?.id == thread.user_id || currentUser?.role === 'admin') && (
                                                    <>
                                                        <button
                                                            onClick={() => setIsEditing(true)}
                                                            className="p-2 text-slate-300 dark:text-zinc-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                            title="Edit Discussion"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={handleDeleteThread}
                                                            className="p-2 text-slate-300 dark:text-zinc-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                            title="Delete Discussion"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {isEditing ? (
                                            <div className="mb-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800">
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm font-bold mb-3 focus:outline-none focus:border-primary dark:text-white"
                                                    placeholder="Discussion Title"
                                                />
                                                
                                                <div className="mb-3 space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Update Category</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["General", "Questions", "Showcase", "Tutorials", "Feedback"].map(cat => (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => setEditCategory(cat)}
                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border transition-all ${editCategory === cat ? "bg-primary border-primary text-black" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400"}`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium mb-3 focus:outline-none focus:border-primary min-h-[120px] resize-none dark:text-white"
                                                    placeholder="Update your thinking..."
                                                />
                                                
                                                <div className="mb-3">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Hashtags</label>
                                                    <input
                                                        type="text"
                                                        value={editHashtags}
                                                        onChange={(e) => setEditHashtags(e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary dark:text-white"
                                                        placeholder="#ai #saas"
                                                    />
                                                </div>

                                                <div className="relative mb-3 group/file">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => setEditImage(e.target.files ? e.target.files[0] : null)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="w-full h-10 px-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center gap-2 transition-all group-hover/file:border-primary/50 overflow-hidden">
                                                        <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                                            <Upload size={12} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500 truncate">
                                                            {editImage ? editImage.name : "Change discussion image (Optional)"}
                                                        </span>
                                                        {editImage && (
                                                            <button 
                                                                type="button" 
                                                                onClick={(e) => { e.stopPropagation(); setEditImage(null); }}
                                                                className="ml-auto p-1 hover:bg-red-500/10 text-red-500 rounded-md z-20"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setIsEditing(false); setEditImage(null); }}
                                                        className="px-4 py-2 text-xs font-black text-slate-400 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-slate-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleUpdateThread}
                                                        disabled={isUpdating}
                                                        className="px-4 py-2 bg-primary text-black rounded-xl text-xs font-black disabled:opacity-50"
                                                    >
                                                        {isUpdating ? "Updating..." : "Save Changes"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-4">
                                                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                                                    {thread.title}
                                                </h1>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                                    {thread.content}
                                                </p>
                                                {thread.image_url && (
                                                    <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                                                        <img 
                                                            src={thread.image_url.startsWith('uploads/') 
                                                                ? `${API_BASE_URL}/${thread.image_url.startsWith('/') ? thread.image_url.slice(1) : thread.image_url}` 
                                                                : thread.image_url} 
                                                            alt="Discussion visual" 
                                                            className="w-full max-h-[600px] object-cover" 
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                if (!target.src.includes('knowva_api')) {
                                                                    // Try prefixing with knowva_api as a fallback
                                                                    target.src = `${API_ENDPOINTS.COMMUNITY.replace('/forum.php', '')}/${thread.image_url}`;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                {thread.hashtags && (
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {thread.hashtags.split(/\s+/).filter((s: string) => s.trim() !== "").map((tag: string, i: number) => {
                                                            const displayTag = tag.startsWith('#') ? tag : `#${tag}`;
                                                            return (
                                                                <span 
                                                                    key={i} 
                                                                    onClick={() => navigate(`/community?search=${encodeURIComponent(displayTag)}`)}
                                                                    className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                                                                >
                                                                    {displayTag}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Thread Actions */}
                                        <div className="flex items-center gap-6">
                                            <div className={`flex items-center bg-secondary/30 dark:bg-zinc-950/50 rounded-xl border transition-all overflow-hidden ${userVote !== 0 ? 'border-primary/30' : 'border-transparent dark:border-zinc-800/50'}`}>
                                                <button
                                                    onClick={() => handleVote('upvote')}
                                                    disabled={upvoteLoading}
                                                    className={`flex items-center gap-1.5 px-3 py-2 transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 dark:text-zinc-600 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}
                                                    title="Upvote"
                                                >
                                                    <ArrowUp size={20} className={userVote === 1 ? 'stroke-[3px]' : ''} />
                                                    <span className="text-sm font-black">{upvoteCount}</span>
                                                </button>
                                                <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10" />
                                                <button
                                                    onClick={() => handleVote('downvote')}
                                                    disabled={upvoteLoading}
                                                    className={`flex items-center gap-1.5 px-3 py-2 transition-all ${userVote === -1 ? 'text-blue-500 bg-blue-500/10' : 'text-slate-400 dark:text-zinc-600 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}
                                                    title="Downvote"
                                                >
                                                    <span className="text-sm font-black">{downvoteCount}</span>
                                                    <ArrowDown size={20} className={userVote === -1 ? 'stroke-[3px]' : ''} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setIsMainReplying(!isMainReplying)}
                                                className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-600 hover:text-primary transition-all text-xs font-black"
                                            >
                                                <MessageSquare size={18} />
                                                {(() => {
                                                    const countNested = (items: any[]): number => {
                                                        if (!items) return 0;
                                                        const childrenKey = items[0] && items[0].replies ? 'replies' : 'children';
                                                        return items.length + items.reduce((acc, item) => acc + countNested(item[childrenKey] || []), 0);
                                                    };
                                                    return countNested(replies);
                                                })()} Comments
                                            </button>
                                            <span className="text-[10px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-widest bg-slate-50 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-slate-100 dark:border-zinc-800">
                                                {thread.category}
                                            </span>
                                        </div>

                                        {/* Main Reply Form toggle */}
                                        {isMainReplying && !thread.is_locked && (
                                            <div className="mt-6 flex gap-3 max-w-2xl pr-4">
                                                <textarea
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="What are your thoughts?"
                                                    rows={3}
                                                    className="flex-grow px-4 py-3 bg-white dark:bg-background border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-primary transition-all text-sm resize-none shadow-sm dark:text-white"
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <Button disabled={isPosting} onClick={() => { handlePostReply(replyContent); setIsMainReplying(false); }} className="h-10 px-6 font-bold rounded-xl bg-primary text-black shadow-md hover:bg-primary/90 hover:scale-105 transition-all">
                                                        {isPosting ? <Loader2 className="animate-spin w-4 h-4" /> : "Comment"}
                                                    </Button>
                                                    <Button onClick={() => setIsMainReplying(false)} variant="ghost" className="h-10 px-6 font-bold rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all">
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        {isMainReplying && !!thread.is_locked && (
                                            <div className="mt-4 text-xs font-bold text-slate-400 bg-slate-50 p-3 rounded-lg flex items-center gap-2">
                                                <Lock size={14} /> This discussion is locked.
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>

                            {/* Replies Section - Threads Style */}
                            <div className="mb-12">
                                <CommentList
                                    replies={replies}
                                    currentUser={currentUser}
                                    handleDeleteReply={handleDeleteReply}
                                    handlePostReply={handlePostReply}
                                    formatDate={formatDate}
                                    onVote={onVoteReply}
                                    sortBy={sortBy}
                                />
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ThreadDetail;
