// Edit post page - loads existing post data and allows editing
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, EyeOff, ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import { getReadingTime } from "@/lib/utils";
import Link from "next/link";

interface Category { id: string; name: string }
interface Tag { id: string; name: string; slug: string }

export default function EditPostPage({ params }: { params: Promise<{ postId: string }> }) {
    const { postId } = use(params);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [form, setForm] = useState({
        title: "", slug: "", excerpt: "", content: "",
        coverImage: "", categoryId: "", published: false, featured: false,
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/posts/${postId}`).then((r) => r.json()),
            fetch("/api/categories").then((r) => r.json()),
            fetch("/api/tags").then((r) => r.json()),
        ]).then(([post, cats, tags]) => {
            setForm({
                title: post.title, slug: post.slug, excerpt: post.excerpt || "",
                content: post.content, coverImage: post.coverImage || "",
                categoryId: post.categoryId || "", published: post.published, featured: post.featured,
            });
            setSelectedTags(post.tags?.map((t: any) => t.tag.id) || []);
            setCategories(cats);
            setAllTags(tags);
            setLoading(false);
        });
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, tagIds: selectedTags }),
            });
            if (res.ok) router.push("/admin/posts");
            else {
                const data = await res.json();
                alert(data.error || "Failed to update");
            }
        } catch { alert("Failed to update"); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/posts"><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h1 className="text-2xl font-bold">Edit Post</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPreview(!preview)} className="gap-1.5">
                        {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {preview ? "Edit" : "Preview"}
                    </Button>
                    <Badge variant="secondary">{getReadingTime(form.content)} min read</Badge>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 text-lg font-semibold" required /></div>
                        <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1.5 font-mono text-sm" required /></div>
                        <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="mt-1.5" rows={2} /></div>
                        <div>
                            <Label>Content (Markdown)</Label>
                            {preview ? (
                                <div className="prose dark:prose-invert max-w-none border rounded-lg p-6 min-h-[400px] bg-card mt-1.5"><MarkdownRenderer content={form.content} /></div>
                            ) : (
                                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1.5 font-mono text-sm min-h-[400px]" required />
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="border rounded-xl p-4 space-y-4 bg-card">
                            <h3 className="font-semibold text-sm">Publish Settings</h3>
                            <div className="flex items-center justify-between"><Label htmlFor="published">Published</Label><input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-violet-600" /></div>
                            <div className="flex items-center justify-between"><Label htmlFor="featured">Featured</Label><input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-violet-600" /></div>
                        </div>

                        <div className="border rounded-xl p-4 space-y-4 bg-card">
                            <h3 className="font-semibold text-sm">Cover Image</h3>
                            <Input placeholder="Image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
                            {form.coverImage && (
                                <div className="relative aspect-video rounded-lg overflow-hidden border">
                                    <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setForm({ ...form, coverImage: "" })}><X className="h-3 w-3" /></Button>
                                </div>
                            )}
                        </div>

                        <div className="border rounded-xl p-4 space-y-4 bg-card">
                            <h3 className="font-semibold text-sm">Category</h3>
                            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full h-10 px-3 rounded-lg border bg-background text-sm">
                                <option value="">No category</option>
                                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>

                        <div className="border rounded-xl p-4 space-y-4 bg-card">
                            <h3 className="font-semibold text-sm">Tags</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {allTags.map((tag) => (
                                    <Badge key={tag.id} variant={selectedTags.includes(tag.id) ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedTags((prev) => prev.includes(tag.id) ? prev.filter((t) => t !== tag.id) : [...prev, tag.id])}>
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 gap-1.5" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {saving ? "Saving..." : "Update Post"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
