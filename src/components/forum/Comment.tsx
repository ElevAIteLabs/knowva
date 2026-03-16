import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MessageSquare, ArrowUp, ArrowDown, Share2, MoreHorizontal, 
    Flag, Trash2, Loader2, Plus, Minus 
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface CommentProps {
    reply: any;
    currentUser: any;
    handleDeleteReply: (id: number) => void;
    handlePostReply: (content: string, parentId: number) => Promise<void>;
    formatDate: (date: string) => string;
    onVote: (id: number, type: 'upvote' | 'downvote') => Promise<any>;
    depth?: number;
    isLast?: boolean;
}

const Comment: React.FC<CommentProps> = ({ 
    reply, 
    currentUser, 
    handleDeleteReply, 
    handlePostReply, 
    formatDate, 
    onVote,
    depth = 0,
    isLast = false
}) => {
    // Default to collapsed for all nested replies to show only main comments initially
    const [isCollapsed, setIsCollapsed] = useState(depth > 0);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const [upvoteCount, setUpvoteCount] = useState(parseInt(reply.upvotes_count || 0));
    const [userVote, setUserVote] = useState(parseInt(reply.user_vote || 0));

    const handleLocalVote = async (type: 'upvote' | 'downvote') => {
        const result = await onVote(reply.id, type);
        if (result?.status === "success") {
            setUpvoteCount(result.new_count);
            setUserVote(result.user_vote);
        }
    };

    const submitReply = async () => {
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        await handlePostReply(replyContent, reply.id);
        setIsSubmitting(false);
        setIsReplying(false);
        setReplyContent("");
    };

    const totalRepliesCount = (r: any): number => {
        const replies = r.replies || r.children || [];
        if (replies.length === 0) return 0;
        return replies.length + replies.reduce((acc: number, child: any) => acc + totalRepliesCount(child), 0);
    };

    if (isCollapsed) {
        return (
            <div className="flex items-center gap-3 mt-4 animate-in fade-in slide-in-from-left-2 duration-300 ml-2">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800/50 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer flex-shrink-0"
                >
                    <Plus size={16} strokeWidth={3} />
                </button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCollapsed(false)}>
                    <div className={`w-6 h-6 rounded-full ${getUserColor(reply.user_name)} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                        {reply.user_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-[13px] text-slate-700 dark:text-zinc-300">{reply.user_name}</span>
                    <span className="text-slate-400 dark:text-zinc-500 text-xs">• {formatDate(reply.created_at)}</span>
                    <span className="flex items-center gap-1 text-[11px] font-black text-primary ml-2 uppercase tracking-tight">
                        +{totalRepliesCount(reply)} replies
                    </span>
                </div>
            </div>
        );
    }

    const replies = reply.replies || reply.children || [];

    return (
        <div className="flex w-full group/reply relative mt-4">
            {/* Thread Line Architecture */}
            <div className="flex flex-col items-center w-8 flex-shrink-0 relative">
                {/* Horizontal branch line for nested comments */}
                {depth > 0 && (
                    <div className="absolute left-[-16px] top-4 w-4 h-[2px] bg-slate-200 dark:bg-zinc-800" />
                )}
                
                {/* Vertical Line */}
                <div 
                    onClick={() => setIsCollapsed(true)}
                    className="w-[2px] h-full bg-slate-200 dark:bg-zinc-800 hover:bg-primary/50 transition-colors cursor-pointer absolute left-1/2 -translate-x-1/2 z-10" 
                />
                
                {/* Avatar dot/button */}
                <div 
                    className="relative z-20 mt-1 cursor-pointer"
                    onClick={() => setIsCollapsed(true)}
                >
                    <div className={`w-7 h-7 rounded-full ${getUserColor(reply.user_name)} flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-4 ring-white dark:ring-[#F8FAFC] dark:ring-background/0`}>
                        {reply.user_name.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-grow min-w-0 pb-1 pl-1">
                {/* Meta */}
                <div className="flex items-center gap-2 mb-1 group/meta">
                    <button 
                        onClick={() => setIsCollapsed(true)}
                        className="flex items-center justify-center w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-primary transition-all mr-0.5"
                        title="Collapse thread"
                    >
                        <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="font-bold text-[14px] text-slate-900 dark:text-zinc-100">{reply.user_name}</span>
                    <span className="text-slate-400 dark:text-zinc-500 text-xs font-medium">• {formatDate(reply.created_at)}</span>
                </div>

                {/* Text */}
                <div className="text-slate-800 dark:text-slate-200 text-[14px] leading-relaxed whitespace-pre-wrap py-0.5 font-medium pr-4 break-words">
                    {reply.content}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-500 mt-1 mb-1 -ml-1">
                    <div className="flex items-center bg-slate-100/50 dark:bg-zinc-900/50 rounded-full px-0.5">
                        <button
                            onClick={() => handleLocalVote('upvote')}
                            className={`flex items-center justify-center w-7 h-7 rounded-full hover:bg-white dark:hover:bg-zinc-800 transition-all ${userVote === 1 ? 'text-orange-500' : ''}`}
                        >
                            <ArrowUp size={14} strokeWidth={3} />
                        </button>
                        <span className={`px-1 text-[11px] min-w-[16px] text-center font-bold ${userVote === 1 ? 'text-orange-600' : (userVote === -1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-zinc-400')}`}>
                            {upvoteCount || 0}
                        </span>
                        <button
                            onClick={() => handleLocalVote('downvote')}
                            className={`flex items-center justify-center w-7 h-7 rounded-full hover:bg-white dark:hover:bg-zinc-800 transition-all ${userVote === -1 ? 'text-blue-500' : ''}`}
                        >
                            <ArrowDown size={14} strokeWidth={3} />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 px-3 py-1.5 rounded-full transition-all text-[11px] font-bold"
                    >
                        <MessageSquare size={14} /> Reply
                    </button>

                    <div className="relative">
                        <button onClick={() => setShowOptions(!showOptions)} className="flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-900 w-7 h-7 rounded-full transition-colors">
                            <MoreHorizontal size={14} />
                        </button>
                        <AnimatePresence>
                            {showOptions && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-800 overflow-hidden z-[100]"
                                >
                                    <button className="w-full flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-bold transition-colors text-left font-sans">
                                        <Flag size={12} /> Report
                                    </button>
                                    {(currentUser?.id == reply.user_id || currentUser?.role === 'admin') && (
                                        <button 
                                            onClick={() => { setShowOptions(false); handleDeleteReply(reply.id); }} 
                                            className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-bold transition-colors text-left border-t border-slate-100 dark:border-zinc-900 font-sans"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Reply Form */}
                <AnimatePresence>
                    {isReplying && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 mb-4 mr-4 overflow-hidden"
                        >
                            <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm">
                                <textarea
                                    autoFocus
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Reply to ${reply.user_name}...`}
                                    rows={3}
                                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[13px] font-medium resize-none dark:text-slate-200"
                                />
                                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/50">
                                    <button
                                        onClick={() => setIsReplying(false)}
                                        className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        disabled={isSubmitting || !replyContent.trim()}
                                        onClick={submitReply}
                                        className="h-8 px-4 text-[11px] font-bold rounded-lg bg-primary text-black"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin w-3 h-3" /> : "Post Reply"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Nested Replies */}
                {replies.length > 0 && (
                    <div className="w-full">
                        {[...replies].sort((a: any, b: any) => {
                            const timeA = new Date(a.created_at).getTime();
                            const timeB = new Date(b.created_at).getTime();
                            // Usually nested replies are best viewed oldest-to-newest to follow the conversation
                            // but we can follow the global preference if preferred. 
                            // Reddit usually does "top/best" but here we use the chosen sort.
                            return timeA - timeB; // Keep conversations chronological for better readability
                        }).map((child: any, index: number) => (
                            <Comment 
                                key={child.id}
                                reply={child}
                                currentUser={currentUser}
                                handleDeleteReply={handleDeleteReply}
                                handlePostReply={handlePostReply}
                                formatDate={formatDate}
                                onVote={onVote}
                                depth={depth + 1}
                                isLast={index === replies.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comment;
