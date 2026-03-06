// Admin posts management page
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Edit, Eye, PenSquare, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Post {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    featured: boolean;
    views: number;
    createdAt: string;
    category: { name: string } | null;
    _count: { likes: number; comments: number };
}

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts?limit=100");
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (err) {
            console.error("Failed to load posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await fetch(`/api/posts/${postId}`, { method: "DELETE" });
            setPosts(posts.filter((p) => p.id !== postId));
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Posts</h1>
                <Link href="/admin/posts/new">
                    <Button className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600">
                        <PenSquare className="h-4 w-4" /> New Post
                    </Button>
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-16 border rounded-xl bg-muted/30">
                    <PenSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first blog post to get started.</p>
                    <Link href="/admin/posts/new">
                        <Button>Create Post</Button>
                    </Link>
                </div>
            ) : (
                <div className="border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Title</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Category</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Date</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Stats</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-3">
                                            <div>
                                                <p className="font-medium text-sm">{post.title}</p>
                                                <p className="text-xs text-muted-foreground">/{post.slug}</p>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1.5">
                                                <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                                                    {post.published ? "Published" : "Draft"}
                                                </Badge>
                                                {post.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                                            </div>
                                        </td>
                                        <td className="p-3 hidden md:table-cell text-sm text-muted-foreground">
                                            {post.category?.name || "—"}
                                        </td>
                                        <td className="p-3 hidden md:table-cell text-sm text-muted-foreground">
                                            {formatDate(post.createdAt)}
                                        </td>
                                        <td className="p-3 hidden md:table-cell">
                                            <div className="flex gap-3 text-xs text-muted-foreground">
                                                <span>{post.views} views</span>
                                                <span>{post._count.likes} likes</span>
                                                <span>{post._count.comments} comments</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/blog/${post.slug}`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/posts/${post.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:text-red-500"
                                                    onClick={() => handleDelete(post.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
