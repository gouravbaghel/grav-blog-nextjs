// Admin dashboard overview
"use client";

import { useEffect, useState } from "react";
import { FileText, Users, MessageSquare, Heart, Eye, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
    posts: number;
    comments: number;
    likes: number;
    views: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ posts: 0, comments: 0, likes: 0, views: 0 });

    useEffect(() => {
        fetch("/api/admin/stats")
            .then((res) => res.json())
            .then(setStats)
            .catch(console.error);
    }, []);

    const cards = [
        { title: "Total Posts", value: stats.posts, icon: FileText, color: "text-violet-600" },
        { title: "Total Comments", value: stats.comments, icon: MessageSquare, color: "text-blue-600" },
        { title: "Total Likes", value: stats.likes, icon: Heart, color: "text-red-500" },
        { title: "Total Views", value: stats.views, icon: Eye, color: "text-green-600" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ title, value, icon: Icon, color }) => (
                    <Card key={title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
