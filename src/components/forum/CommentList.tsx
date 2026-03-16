import React from "react";
import Comment from "./Comment";
import { motion } from "framer-motion";

interface CommentListProps {
    replies: any[];
    currentUser: any;
    handleDeleteReply: (id: number) => void;
    handlePostReply: (content: string, parentId: number | null) => Promise<void>;
    formatDate: (date: string) => string;
    onVote: (id: number, type: 'upvote' | 'downvote') => Promise<any>;
    sortBy: 'newest' | 'oldest';
}

const CommentList: React.FC<CommentListProps> = ({ 
    replies, 
    currentUser, 
    handleDeleteReply, 
    handlePostReply, 
    formatDate, 
    onVote,
    sortBy
}) => {
    
    // Function to ensure we have a tree structure
    const buildTree = (items: any[]) => {
        const map = new Map();
        const tree: any[] = [];

        items.forEach(item => {
            const childrenKey = item.replies ? 'replies' : 'children';
            map.set(item.id, { ...item, [childrenKey]: item[childrenKey] || [] });
        });

        items.forEach(item => {
            if (item.parent_id && map.has(item.parent_id)) {
                const parent = map.get(item.parent_id);
                const childrenKey = parent.replies ? 'replies' : 'children';
                if (!parent[childrenKey].find((c: any) => c.id === item.id)) {
                    parent[childrenKey].push(map.get(item.id));
                }
            } else if (!item.parent_id) {
                tree.push(map.get(item.id));
            }
        });
        return tree;
    };

    const nestedReplies = buildTree(replies);

    const sortedReplies = [...nestedReplies].sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

    if (sortedReplies.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 border-t border-slate-100 dark:border-zinc-900 mt-8">
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-full mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                </div>
                <p className="font-bold text-sm">No thoughts shared yet.</p>
                <p className="text-xs">Be the first to start the conversation!</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 mt-6">
            {sortedReplies.map((reply, idx) => (
                <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                >
                    <Comment 
                        reply={reply}
                        currentUser={currentUser}
                        handleDeleteReply={handleDeleteReply}
                        handlePostReply={handlePostReply}
                        formatDate={formatDate}
                        onVote={onVote}
                        depth={0}
                        isLast={idx === sortedReplies.length - 1}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default CommentList;
