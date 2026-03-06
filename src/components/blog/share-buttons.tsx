// Share buttons for blog posts
"use client";

import { Twitter, Linkedin, Link2, Facebook, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ShareButtonsProps {
    title: string;
    slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const url = `${process.env.NEXT_PUBLIC_APP_URL || ""}/blog/${slug}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            icon: Twitter,
            label: "Twitter",
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: "hover:text-sky-500",
        },
        {
            icon: Facebook,
            label: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "hover:text-blue-600",
        },
        {
            icon: Linkedin,
            label: "LinkedIn",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: "hover:text-blue-700",
        },
    ];

    const copyLink = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-2">Share:</span>
            {shareLinks.map(({ icon: Icon, label, href, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 rounded-full text-muted-foreground ${color}`}
                        title={`Share on ${label}`}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                </a>
            ))}
            <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full text-muted-foreground hover:text-green-500"
                onClick={copyLink}
                title="Copy link"
            >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
            </Button>
        </div>
    );
}
