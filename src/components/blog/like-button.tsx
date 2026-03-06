// Like / Clap button with animation
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
    postId: string;
    initialLikes: number;
    initialLiked: boolean;
}

export function LikeButton({ postId, initialLikes, initialLiked }: LikeButtonProps) {
    const { data: session } = useSession();
    const [liked, setLiked] = useState(initialLiked);
    const [likes, setLikes] = useState(initialLikes);
    const [animating, setAnimating] = useState(false);

    const handleLike = async () => {
        if (!session) return;

        setAnimating(true);
        setLiked(!liked);
        setLikes((prev) => (liked ? prev - 1 : prev + 1));

        try {
            await fetch(`/api/posts/${postId}/like`, {
                method: liked ? "DELETE" : "POST",
            });
        } catch {
            // Revert on error
            setLiked(liked);
            setLikes(initialLikes);
        }

        setTimeout(() => setAnimating(false), 600);
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`gap-1.5 transition-colors ${liked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
                    }`}
                disabled={!session}
                title={!session ? "Sign in to like" : liked ? "Unlike" : "Like"}
            >
                <motion.div animate={animating ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                    <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                </motion.div>
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={likes}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        className="text-sm font-medium"
                    >
                        {likes}
                    </motion.span>
                </AnimatePresence>
            </Button>
        </div>
    );
}
