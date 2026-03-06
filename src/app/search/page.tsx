"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!query) return;

        const fetchResults = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error("Failed to search");
                const data = await res.json();
                setPosts(data.posts || []);
            } catch (err) {
                setError("Something went wrong while searching.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (!query) {
        return (
            <div className="text-center py-20 border rounded-xl bg-muted/30">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Search for articles</h3>
                <p className="text-muted-foreground">Enter a search term above to find related content using AI semantic search.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                <p className="text-muted-foreground animate-pulse">Running semantic search...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 border border-red-200 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-3">
                    <span className="text-muted-foreground font-normal">AI Results for:</span> "{query}"
                </h1>
                <p className="text-muted-foreground">
                    {posts.length} {posts.length === 1 ? "article" : "articles"} found based on conceptual meaning.
                </p>
            </div>

            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="relative aspect-[16/9] overflow-hidden">
                                {post.coverImage ? (
                                    <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                                        <BookOpen className="h-8 w-8 text-muted-foreground/20" />
                                    </div>
                                )}
                                {post.category && (
                                    <Badge className="absolute top-3 left-3 text-white border-0" style={{ backgroundColor: post.category.color || "#6366f1" }}>
                                        {post.category.name}
                                    </Badge>
                                )}
                            </div>
                            <div className="p-5">
                                <h2 className="font-bold text-lg leading-tight group-hover:text-violet-600 transition-colors">{post.title}</h2>
                                {post.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                                    <span>{post.author.name}</span>
                                    <span>{formatDate(new Date(post.createdAt))}{post.readingTime ? ` · ${post.readingTime} min` : ""}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border rounded-xl bg-muted/30">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4 animate-bounce" />
                    <h3 className="text-xl font-semibold mb-2">No matching concepts</h3>
                    <p className="text-muted-foreground">We couldn't find any articles conceptually related to your query.</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
            <Suspense fallback={
                <div className="py-20 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }>
                <SearchResults />
            </Suspense>
        </div>
    );
}
