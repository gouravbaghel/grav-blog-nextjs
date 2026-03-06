// Comment system with threaded replies
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Reply, Trash2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string | null; image: string | null };
    replies: Comment[];
}

interface CommentsProps {
    postId: string;
}

export function Comments({ postId }: CommentsProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");

    // Fetch comments
    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            const data = await res.json();
            setComments(data);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault();
        const content = parentId ? replyContent : newComment;
        if (!content.trim() || !session) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, parentId }),
            });

            if (res.ok) {
                if (parentId) {
                    setReplyContent("");
                    setReplyingTo(null);
                } else {
                    setNewComment("");
                }
                fetchComments();
            }
        } catch (err) {
            console.error("Failed to post comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: "DELETE",
            });
            fetchComments();
        } catch (err) {
            console.error("Failed to delete comment:", err);
        }
    };

    const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-muted" : ""}`}
        >
            <div className="flex gap-3 py-4">
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.author.image || ""} />
                    <AvatarFallback className="text-xs">
                        {comment.author.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                    </div>

                    <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap break-words">
                        {comment.content}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                        {session && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground"
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            >
                                <Reply className="h-3 w-3 mr-1" /> Reply
                            </Button>
                        )}
                        {session?.user?.id === comment.author.id && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-red-500"
                                onClick={() => handleDelete(comment.id)}
                            >
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                        )}
                    </div>

                    {/* Reply form */}
                    <AnimatePresence>
                        {replyingTo === comment.id && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={(e) => handleSubmit(e, comment.id)}
                                className="mt-3 flex gap-2"
                            >
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="min-h-[60px] text-sm"
                                    rows={2}
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={submitting || !replyContent.trim()}
                                    className="shrink-0"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Nested replies */}
                    {comment.replies?.map((reply) => (
                        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                    ))}
                </div>
            </div>
        </motion.div>
    );

    return (
        <section className="mt-12">
            <h3 className="flex items-center gap-2 text-xl font-bold mb-6">
                <MessageCircle className="h-5 w-5" />
                Comments ({comments.length})
            </h3>

            {/* New comment form */}
            {session ? (
                <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="mb-3"
                        rows={3}
                    />
                    <Button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Post Comment
                    </Button>
                </form>
            ) : (
                <div className="mb-8 p-4 rounded-lg border bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">
                        <Link href="/auth/signin" className="text-violet-600 hover:underline font-medium">
                            Sign in
                        </Link>{" "}
                        to leave a comment.
                    </p>
                </div>
            )}

            {/* Comments list */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to share your thoughts!
                </p>
            ) : (
                <div className="divide-y">
                    {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            )}
        </section>
    );
}
