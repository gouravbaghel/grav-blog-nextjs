// Site header with navigation, search, auth, and dark mode toggle
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, PenSquare, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export function Header() {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/blog", label: "Blog" },
        { href: "/categories", label: "Categories" },
        { href: "/about", label: "About" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-sm transition-transform group-hover:scale-110">
                        G
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        GravBlog
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    {/* Search toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-full"
                        onClick={() => setSearchOpen(!searchOpen)}
                        aria-label="Search"
                    >
                        <Search className="h-4 w-4" />
                    </Button>

                    <ThemeToggle />

                    {/* Auth actions */}
                    {session?.user ? (
                        <div className="hidden md:flex items-center gap-2">
                            {session.user.role === "ADMIN" && (
                                <>
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="gap-1.5">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Link href="/admin/posts/new">
                                        <Button size="sm" className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                                            <PenSquare className="h-4 w-4" />
                                            Write
                                        </Button>
                                    </Link>
                                </>
                            )}
                            <Link href="/profile">
                                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-violet-500 transition-all">
                                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                                    <AvatarFallback className="text-xs">
                                        {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/auth/signin" className="hidden md:block">
                            <Button variant="outline" size="sm">
                                Sign In
                            </Button>
                        </Link>
                    )}

                    {/* Mobile menu toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden w-9 h-9 rounded-full"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Search overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 border-b bg-background p-4"
                    >
                        <form onSubmit={handleSearch} className="container mx-auto max-w-2xl">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b bg-background overflow-hidden"
                    >
                        <nav className="container mx-auto flex flex-col gap-1 p-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {session?.user ? (
                                <>
                                    {session.user.role === "ADMIN" && (
                                        <>
                                            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                                <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5">
                                                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                                                </Button>
                                            </Link>
                                            <Link href="/admin/posts/new" onClick={() => setMobileMenuOpen(false)}>
                                                <Button size="sm" className="w-full gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600">
                                                    <PenSquare className="h-4 w-4" /> Write
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: "/" }); }}>
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                                </Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
