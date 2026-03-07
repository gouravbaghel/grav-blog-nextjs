// Admin tags management
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createSlug } from "@/lib/utils";

interface Tag {
    id: string;
    name: string;
    slug: string;
    _count: { posts: number };
}

export default function AdminTagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", slug: "" });

    const fetchTags = useCallback(async () => {
        const data = await fetch("/api/tags").then((r) => r.json());
        setTags(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchTags();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [fetchTags]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setForm({ name: "", slug: "" });
            void fetchTags();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this tag?")) return;
        await fetch(`/api/tags/${id}`, { method: "DELETE" });
        void fetchTags();
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Tags</h1>

            <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end mb-8 p-4 border rounded-xl bg-card">
                <div className="flex-1 min-w-[200px]">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ name: e.target.value, slug: createSlug(e.target.value) })} placeholder="Tag name" className="mt-1" required />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 font-mono text-sm" required />
                </div>
                <Button type="submit" className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
            </form>

            {loading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            ) : (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-card">
                            <span className="font-medium text-sm">{tag.name}</span>
                            <Badge variant="secondary" className="text-xs">{tag._count.posts}</Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500" onClick={() => handleDelete(tag.id)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
