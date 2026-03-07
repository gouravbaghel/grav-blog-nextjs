// Blog listing page with search, filtering, and pagination
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Search } from "lucide-react";
import { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog",
    description: "Browse all articles on GravBlog.",
};

const POSTS_PER_PAGE = 9;
const postListInclude = {
    author: { select: { name: true, image: true } },
    category: { select: { name: true, slug: true, color: true } },
    tags: { include: { tag: true } },
    _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostInclude;

type BlogPost = Prisma.PostGetPayload<{ include: typeof postListInclude }>;

interface BlogPageProps {
    searchParams: Promise<{ page?: string; category?: string; tag?: string; q?: string; featured?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const category = params.category;
    const tag = params.tag;
    const query = params.q;
    const featured = params.featured === "true";

    // Build filter conditions
    const where: Prisma.PostWhereInput = { published: true };
    if (category) where.category = { slug: category };
    if (tag) where.tags = { some: { tag: { slug: tag } } };
    if (featured) where.featured = true;
    if (query) {
        where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
        ];
    }

    let posts: BlogPost[] = [];
    let totalPosts = 0;
    let categories: Array<{ id: string; name: string; slug: string; color: string | null; _count: { posts: number } }> = [];

    try {
        [posts, totalPosts, categories] = await Promise.all([
            prisma.post.findMany({
                where,
                include: postListInclude,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * POSTS_PER_PAGE,
                take: POSTS_PER_PAGE,
            }),
            prisma.post.count({ where }),
            prisma.category.findMany({
                include: { _count: { select: { posts: true } } },
                orderBy: { name: "asc" },
            }),
        ]);
    } catch {
        // DB not ready
    }

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12">
            {/* Page header */}
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {query ? `Search: "${query}"` : featured ? "Featured Articles" : "All Articles"}
                </h1>
                <p className="text-muted-foreground">
                    {totalPosts} {totalPosts === 1 ? "article" : "articles"} found
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Main content */}
                <div className="flex-1">
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        {post.coverImage ? (
                                            <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="50vw" />
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
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {post.tags.slice(0, 2).map(({ tag }) => (
                                                <Badge key={tag.slug} variant="secondary" className="text-xs font-normal">#{tag.name}</Badge>
                                            ))}
                                        </div>
                                        <h2 className="font-bold text-lg leading-tight group-hover:text-violet-600 transition-colors">{post.title}</h2>
                                        {post.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                                            <span>{post.author.name}</span>
                                            <span>{formatDate(post.createdAt)}{post.readingTime ? ` · ${post.readingTime} min` : ""}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border rounded-xl bg-muted/30">
                            <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                            <p className="text-muted-foreground">Try a different search or browse categories.</p>
                        </div>
                    )}

                    <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" />
                </div>

                {/* Sidebar */}
                <aside className="lg:w-64 shrink-0 space-y-8">
                    {categories.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-4">Categories</h3>
                            <div className="space-y-1">
                                <Link href="/blog" className={`block px-3 py-2 text-sm rounded-lg transition-colors ${!category ? "bg-accent font-medium" : "hover:bg-accent"}`}>
                                    All
                                </Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/blog?category=${cat.slug}`}
                                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${category === cat.slug ? "bg-accent font-medium" : "hover:bg-accent"}`}
                                    >
                                        <span>{cat.name}</span>
                                        <span className="text-xs text-muted-foreground">{cat._count.posts}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
