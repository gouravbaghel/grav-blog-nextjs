// Homepage with hero, featured posts, latest posts, categories, and newsletter
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newsletter } from "@/components/newsletter";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getFeaturedPosts() {
  return prisma.post.findMany({
    where: { published: true, featured: true },
    include: {
      author: { select: { name: true, image: true } },
      category: { select: { name: true, slug: true, color: true } },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

async function getLatestPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: { select: { name: true, image: true } },
      category: { select: { name: true, slug: true, color: true } },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export default async function HomePage() {
  let featuredPosts: Awaited<ReturnType<typeof getFeaturedPosts>> = [];
  let latestPosts: Awaited<ReturnType<typeof getLatestPosts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [featuredPosts, latestPosts, categories] = await Promise.all([
      getFeaturedPosts(),
      getLatestPosts(),
      getCategories(),
    ]);
  } catch {
    // DB not connected yet — show empty state
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 gap-1">
              <Sparkles className="h-3 w-3" /> Welcome to GravBlog
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Insights for the{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                modern developer
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Deep dives into technology, clean code practices, design patterns,
              and everything in between. Written by developers, for developers.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/blog">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2">
                  <BookOpen className="h-4 w-4" /> Start Reading
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="gap-2">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-16 space-y-20">
        {/* ── Featured Posts ─── */}
        {featuredPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <TrendingUp className="h-5 w-5 text-violet-600" /> Featured
              </h2>
              <Link href="/blog?featured=true">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post: any, i: number) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={`group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:-translate-y-1 ${i === 0 ? "md:col-span-2 md:row-span-2" : ""
                    }`}
                >
                  <div className={`relative overflow-hidden ${i === 0 ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes={i === 0 ? "66vw" : "33vw"}
                        priority={i === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      {post.category && (
                        <Badge className="mb-2 border-0" style={{ backgroundColor: post.category.color || "#6366f1" }}>
                          {post.category.name}
                        </Badge>
                      )}
                      <h3 className={`font-bold leading-tight ${i === 0 ? "text-xl md:text-2xl" : "text-lg"}`}>
                        {post.title}
                      </h3>
                      <p className="text-sm text-white/80 mt-2 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-white/70">
                        <span>{post.author.name}</span>
                        <span>·</span>
                        <span>{formatDate(post.createdAt)}</span>
                        {post.readingTime && (
                          <>
                            <span>·</span>
                            <span>{post.readingTime} min read</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Latest Posts ─── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Latest Articles</h2>
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground/20" />
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-3 left-3">
                        <Badge className="text-white border-0 shadow-sm" style={{ backgroundColor: post.category.color || "#6366f1" }}>
                          {post.category.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {post.tags.slice(0, 2).map(({ tag }: { tag: any }) => (
                        <Badge key={tag.slug} variant="secondary" className="text-xs font-normal">
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-violet-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {post.author.image && (
                          <Image src={post.author.image} alt="" width={20} height={20} className="rounded-full" />
                        )}
                        <span>{post.author.name}</span>
                      </div>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-xl bg-muted/30">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">Articles will appear here once published.</p>
            </div>
          )}
        </section>

        {/* ── Categories ─── */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative overflow-hidden rounded-xl border p-6 bg-card hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div
                    className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{ backgroundColor: cat.color || "#6366f1" }}
                  />
                  <h3 className="font-semibold mb-1" style={{ color: cat.color || "#6366f1" }}>
                    {cat.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cat._count.posts} {cat._count.posts === 1 ? "article" : "articles"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Newsletter ─── */}
        <Newsletter />
      </div>
    </div>
  );
}
