"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    if (status === "loading" || !session?.user) {
        return <div className="min-h-[60vh] flex items-center justify-center animate-pulse">Loading profile...</div>;
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4 min-h-[70vh]">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <Avatar className="h-24 w-24 ring-4 ring-violet-500/20">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback className="text-3xl">
                            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-center md:text-left space-y-1">
                        <h2 className="text-2xl font-semibold">{session.user.name}</h2>
                        <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-1.5">
                            <Mail className="w-4 h-4" />
                            {session.user.email}
                        </p>
                        <p className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-xs font-medium mt-2">
                            <UserIcon className="w-3.5 h-3.5" />
                            Role: {session.user.role}
                        </p>
                    </div>
                </div>

                <div className="border-t pt-6 flex justify-end">
                    <Button
                        variant="destructive"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full sm:w-auto gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
