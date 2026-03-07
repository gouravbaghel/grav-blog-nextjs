// Individual blog post page with markdown rendering, TOC, and engagement
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Eye, ArrowLeft } from "lucide-react";
import { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareButtons } from "@/components/blog/share-buttons";
import { LikeButton } from "@/components/blog/like-button";
import { Comments } from "@/components/blog/comments";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

interface PostPageProps {
    params: Promise<{ slug: string }>;
}

const postInclude = {
    author: { select: { id: true, name: true, image: true, bio: true } },
    category: { select: { name: true, slug: true, color: true } },
    tags: { include: { tag: true } },
    _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostInclude;

type PostDetail = Prisma.PostGetPayload<{ include: typeof postInclude }>;

// Generate metadata for SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const post = await prisma.post.findUnique({
            where: { slug },
            select: { title: true, excerpt: true, coverImage: true },
        });
        if (!post) return {};
        return {
            title: post.title,
            description: post.excerpt || undefined,
            openGraph: {
                title: post.title,
                description: post.excerpt || undefined,
                images: post.coverImage ? [{ url: post.coverImage }] : [],
                type: "article",
            },
            twitter: {
                card: "summary_large_image",
                title: post.title,
                description: post.excerpt || undefined,
                images: post.coverImage ? [post.coverImage] : [],
            },
        };
    } catch {
        return {};
    }
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;
    let post: PostDetail | null = null;
    let userLiked = false;

    try {
        post = await prisma.post.findUnique({
            where: { slug, published: true },
            include: postInclude,
        });

        // Increment views
        if (post) {
            await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
        }

        // Check if user liked
        const session = await auth();
        if (post && session?.user?.id) {
            const like = await prisma.like.findUnique({
                where: { userId_postId: { userId: session.user.id, postId: post.id } },
            });
            userLiked = !!like;
        }
    } catch {
        notFound();
    }

    if (!post) {
        notFound();
    }

    return (
        <article className="min-h-screen">
            {/* Hero cover */}
            {post.coverImage && (
                <div className="relative w-full h-[40vh] md:h-[50vh]">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>
            )}

            <div className="container mx-auto max-w-6xl px-4">
                <div className="flex flex-col lg:flex-row gap-10 py-10">
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Back link */}
                        <Link href="/blog">
                            <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground">
                                <ArrowLeft className="h-4 w-4" /> Back to blog
                            </Button>
                        </Link>

                        {/* Category & tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {post.category && (
                                <Link href={`/blog?category=${post.category.slug}`}>
                                    <Badge style={{ backgroundColor: post.category.color || "#6366f1" }} className="text-white border-0">
                                        {post.category.name}
                                    </Badge>
                                </Link>
                            )}
                            {post.tags.map(({ tag }) => (
                                <Link key={tag.slug} href={`/tags/${tag.slug}`}>
                                    <Badge variant="secondary" className="font-normal">#{tag.name}</Badge>
                                </Link>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                            {post.title}
                        </h1>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={post.author.image || ""} />
                                    <AvatarFallback>{post.author.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{post.author.name}</span>
                            </div>
                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(post.createdAt)}</span>
                            {post.readingTime && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readingTime} min read</span>}
                            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {post.views} views</span>
                        </div>

                        <Separator className="mb-8" />

                        {/* Markdown content */}
                        <div className="prose dark:prose-invert max-w-none">
                            <MarkdownRenderer content={post.content} />
                        </div>

                        <Separator className="my-8" />

                        {/* Engagement row */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <LikeButton postId={post.id} initialLikes={post._count.likes} initialLiked={userLiked} />
                            <ShareButtons title={post.title} slug={post.slug} />
                        </div>

                        {/* Author bio */}
                        <div className="mt-8 p-6 rounded-xl border bg-card">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={post.author.image || ""} />
                                    <AvatarFallback>{post.author.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold">{post.author.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{post.author.bio || "Author on GravBlog"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <Comments postId={post.id} />
                    </div>

                    {/* Sidebar with TOC */}
                    <aside className="hidden lg:block lg:w-64 shrink-0">
                        <TableOfContents content={post.content} />
                    </aside>
                </div>
            </div>
        </article>
    );
}
