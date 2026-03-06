import Link from "next/link";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Categories",
    description: "Browse all topics and categories on GravBlog.",
};

export default async function CategoriesPage() {
    let categories: Array<{ id: string; name: string; slug: string; description: string | null; color: string | null; _count: { posts: number } }> = [];

    try {
        categories = await prisma.category.findMany({
            include: { _count: { select: { posts: true } } },
            orderBy: { name: "asc" },
        });
    } catch {
        // DB not ready or error
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-14 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Browse Categories
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                    Finding the right content has never been easier. Explore topics that matter to you.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/blog?category=${cat.slug}`}
                            className="group block p-6 border rounded-2xl bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                            style={{ borderColor: cat.color ? `${cat.color}40` : "inherit" }}
                        >
                            <div
                                className="absolute top-0 left-0 w-full h-1.5 opacity-80 transition-opacity group-hover:opacity-100"
                                style={{ backgroundColor: cat.color || "#6366f1" }}
                            />

                            <div className="flex justify-between items-start mb-4 pt-2">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm"
                                        style={{ backgroundColor: `${cat.color}20` || "#6366f120" }}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: cat.color || "#6366f1" }}
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold group-hover:text-violet-600 transition-colors">
                                        {cat.name}
                                    </h2>
                                </div>
                            </div>

                            {cat.description ? (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-4 mb-6">
                                    {cat.description}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-4 mb-6">
                                    Explore all articles related to {cat.name}.
                                </p>
                            )}

                            <div className="flex items-center justify-between text-sm font-medium mt-auto border-t pt-4 border-border/50">
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                    View articles
                                </span>
                                <span className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-full text-xs text-foreground">
                                    {cat._count.posts} {cat._count.posts === 1 ? "post" : "posts"}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-card/50">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">Categories will appear here once they are created.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
