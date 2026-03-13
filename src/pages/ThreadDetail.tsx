import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, ChevronLeft, Send, Loader2, Sparkles, User, Clock, 
  Hash, Pin, Lock, ShieldCheck, X, Triangle, Reply, MoreHorizontal, Pencil, Trash2 
} from "lucide-react";
import { API_ENDPOINTS } from "@/config/apiConfig";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ThreadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [thread, setThread] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [upvoteLoading, setUpvoteLoading] = useState(false);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

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
                setUpvoteCount(result.count);
                setHasUpvoted(result.has_upvoted);
            }
        } catch {}
    };

    useEffect(() => {
        fetchThreadDetail();
        fetchUpvotes();
    }, [id, currentUser?.id]);

    const handleUpvote = async () => {
        if (!currentUser) { navigate("/login"); return; }
        setUpvoteLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.UPVOTES, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    target_id: id,
                    target_type: 'thread'
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                setUpvoteCount(result.new_count);
                setHasUpvoted(result.action === 'added');
                toast.success(result.action === 'added' ? "Thread upvoted!" : "Upvote removed");
            }
        } catch { toast.error("Upvote failed"); }
        finally { setUpvoteLoading(false); }
    };

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) { navigate("/login"); return; }
        if (!replyContent.trim()) { toast.error("Please write something"); return; }

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
                    content: replyContent.trim()
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Response published!");
                setReplyContent("");
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
            const res = await fetch(API_ENDPOINTS.COMMUNITY, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "edit",
                    thread_id: id,
                    user_id: currentUser.id,
                    title: editTitle.trim(),
                    content: editContent.trim()
                }),
            });
            const result = await res.json();
            if (result.status === "success") {
                toast.success("Thread updated!");
                setIsEditing(false);
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
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    
                    <Link to="/community" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm mb-8 transition-colors group">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Collective Mind
                    </Link>

                    {/* Main Thread Post - Threads Style */}
                    <div className="relative mb-8">
                        {/* Vertical Connection Line */}
                        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-100 hidden md:block" />
                        
                        <div className="flex gap-4">
                            {/* Avatar */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-black text-slate-400 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                    {thread.user_name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Content Wrapper */}
                            <div className="flex-grow pt-1 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-900 hover:underline cursor-pointer">{thread.user_name}</span>
                                        <span className="text-xs text-slate-400 font-medium">{formatDate(thread.created_at)}</span>
                                        {!!thread.is_pinned && (
                                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md text-[8px] font-black uppercase tracking-wider">Pinned</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {(currentUser?.id == thread.user_id || currentUser?.role === 'admin') && (
                                            <>
                                                <button 
                                                    onClick={() => setIsEditing(true)}
                                                    className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="Edit Discussion"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={handleDeleteThread}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Discussion"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="mb-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <input 
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold mb-3 focus:outline-none focus:border-primary"
                                            placeholder="Discussion Title"
                                        />
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium mb-3 focus:outline-none focus:border-primary min-h-[120px] resize-none"
                                            placeholder="Update your thinking..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 text-xs font-black text-slate-400 hover:text-slate-900"
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
                                        <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight">
                                            {thread.title}
                                        </h1>
                                        <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                            {thread.content}
                                        </p>
                                    </div>
                                )}

                                {/* Thread Actions */}
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={handleUpvote}
                                        disabled={upvoteLoading}
                                        className={`flex items-center gap-1.5 text-xs font-black transition-all ${hasUpvoted ? "text-primary scale-110" : "text-slate-400 hover:text-primary"}`}
                                    >
                                        <Triangle size={18} className={hasUpvoted ? "fill-current" : ""} />
                                        {upvoteCount}
                                    </button>
                                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-all text-xs font-black">
                                        <MessageSquare size={18} />
                                        {replies.length}
                                    </button>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                        {thread.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Replies Section - Threads Style */}
                    <div className="space-y-6 mb-12">
                        {replies.length === 0 ? (
                            <div className="ml-16 py-8 text-slate-400 text-sm font-bold border-l-2 border-slate-50 pl-6">
                                No responses yet. Be the first to reply...
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {replies.map((reply, idx) => (
                                    <motion.div 
                                        key={reply.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="relative group"
                                    >
                                        {/* Reply Vertical Line (unless last) */}
                                        {idx !== replies.length - 1 && (
                                            <div className="absolute left-6 top-14 bottom-[-24px] w-0.5 bg-slate-50 hidden md:block" />
                                        )}

                                        <div className="flex gap-4">
                                            {/* Reply Avatar */}
                                            <div className="flex-shrink-0 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-sm font-black text-slate-400 border-2 border-white shadow-sm group-hover:ring-1 group-hover:ring-primary/20 transition-all">
                                                    {reply.user_name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Reply Content */}
                                            <div className="flex-grow pt-0.5">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{reply.user_name}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">{formatDate(reply.created_at)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {(currentUser?.id == reply.user_id || currentUser?.role === 'admin') && (
                                                            <button 
                                                                onClick={() => handleDeleteReply(reply.id)}
                                                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                                title="Delete Response"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                        <Triangle size={12} className="text-slate-100 cursor-pointer hover:text-primary transition-colors" />
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mb-3 pr-4">
                                                    {reply.content}
                                                </p>
                                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400">
                                                    <button className="hover:text-primary transition-colors">REPLY</button>
                                                    <button className="hover:text-primary transition-colors">LIKE</button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reply Form */}
                    {!thread.is_locked ? (
                        <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 -mr-32 -mt-32 rounded-full blur-[80px]" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-2">Contribute Thinking</h3>
                                <p className="text-slate-400 text-sm mb-8">Your insights help the community evolve rapidly.</p>
                                
                                <form onSubmit={handlePostReply} className="space-y-6">
                                    <textarea 
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Add your expert opinion..."
                                        rows={5}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[24px] focus:outline-none focus:border-primary transition-all font-medium text-white resize-none"
                                    />
                                    <Button 
                                        type="submit"
                                        disabled={isPosting}
                                        className="w-full bg-primary text-black hover:bg-primary/90 font-black rounded-2xl h-14 transition-all"
                                    >
                                        {isPosting ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                                        Post Response
                                    </Button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-100 border border-slate-200 rounded-[32px] p-12 text-center text-slate-500">
                            <Lock size={32} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold">This discussion is locked</h3>
                            <p className="text-sm">No new responses can be added at this time.</p>
                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ThreadDetail;
