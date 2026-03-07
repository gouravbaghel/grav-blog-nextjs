// Admin categories management
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createSlug } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    _count: { posts: number };
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", slug: "", color: "#6366f1" });

    const fetchCategories = useCallback(async () => {
        const data = await fetch("/api/categories").then((r) => r.json());
        setCategories(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchCategories();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [fetchCategories]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setForm({ name: "", slug: "", color: "#6366f1" });
            void fetchCategories();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category?")) return;
        await fetch(`/api/categories/${id}`, { method: "DELETE" });
        void fetchCategories();
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Categories</h1>

            {/* Create form */}
            <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end mb-8 p-4 border rounded-xl bg-card">
                <div className="flex-1 min-w-[200px]">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: createSlug(e.target.value) })} placeholder="Category name" className="mt-1" required />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 font-mono text-sm" required />
                </div>
                <div className="w-24">
                    <Label>Color</Label>
                    <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="mt-1 h-10 p-1 cursor-pointer" />
                </div>
                <Button type="submit" className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
            </form>

            {/* List */}
            {loading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            ) : (
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || "#6366f1" }} />
                                <span className="font-medium">{cat.name}</span>
                                <span className="text-xs text-muted-foreground">/{cat.slug}</span>
                                <Badge variant="secondary" className="text-xs">{cat._count.posts} posts</Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(cat.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
