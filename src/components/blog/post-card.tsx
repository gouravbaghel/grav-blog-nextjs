// Blog post card component
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
    post: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        coverImage: string | null;
        readingTime: number | null;
        createdAt: string | Date;
        author: { name: string | null; image: string | null };
        category: { name: string; slug: string; color: string | null } | null;
        tags: { tag: { name: string; slug: string } }[];
        _count: { likes: number; comments: number };
    };
    featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-1 ${featured ? "md:col-span-2 md:grid md:grid-cols-2" : ""
                }`}
        >
            {/* Cover image */}
            <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden">
                {post.coverImage ? (
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground/30">G</span>
                    </div>
                )}

                {/* Category badge */}
                {post.category && (
                    <div className="absolute top-3 left-3">
                        <Badge
                            className="text-white border-0 shadow-sm"
                            style={{ backgroundColor: post.category.color || "#6366f1" }}
                        >
                            {post.category.name}
                        </Badge>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-col justify-between p-5">
                <div>
                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {post.tags.slice(0, 3).map(({ tag }) => (
                                <Link key={tag.slug} href={`/tags/${tag.slug}`}>
                                    <Badge variant="secondary" className="text-xs font-normal hover:bg-secondary/80">
                                        #{tag.name}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`}>
                        <h3 className={`font-bold leading-tight text-foreground group-hover:text-violet-600 transition-colors ${featured ? "text-xl md:text-2xl" : "text-lg"
                            }`}>
                            {post.title}
                        </h3>
                    </Link>

                    {/* Excerpt */}
                    {post.excerpt && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-3">
                        {post.author.image && (
                            <Image
                                src={post.author.image}
                                alt={post.author.name || ""}
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                        )}
                        <span className="text-xs font-medium text-muted-foreground">
                            {post.author.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.createdAt)}
                        </span>
                        {post.readingTime && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readingTime} min
                            </span>
                        )}
                    </div>
                </div>

                {/* Engagement stats */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {post._count.likes}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {post._count.comments}
                    </span>
                </div>
            </div>
        </motion.article>
    );
}
