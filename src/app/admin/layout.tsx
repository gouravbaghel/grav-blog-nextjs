// Admin layout with sidebar navigation
"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
    LayoutDashboard, FileText, FolderOpen, Tags, MessageSquare,
    Users, Mail, Settings, PenSquare, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/posts", label: "Posts", icon: FileText },
    { href: "/admin/posts/new", label: "New Post", icon: PenSquare },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/tags", label: "Tags", icon: Tags },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (!session || session.user.role !== "ADMIN") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
                    <Link href="/">
                        <Button>Go Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 p-4">
                <div className="mb-6">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Admin Panel
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage your blog</p>
                </div>

                <nav className="space-y-1 flex-1">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href}>
                            <Button
                                variant={pathname === href ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-2 ${pathname === href ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : ""
                                    }`}
                                size="sm"
                            >
                                <Icon className="h-4 w-4" /> {label}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6 md:p-8 overflow-auto">
                {/* Mobile nav */}
                <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href}>
                            <Button
                                variant={pathname === href ? "secondary" : "outline"}
                                size="sm"
                                className="gap-1 shrink-0"
                            >
                                <Icon className="h-3.5 w-3.5" /> {label}
                            </Button>
                        </Link>
                    ))}
                </div>

                {children}
            </main>
        </div>
    );
}
