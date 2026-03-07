// Table of Contents component for blog posts
"use client";

import { useEffect, useMemo, useState } from "react";
import { List } from "lucide-react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");

    const headings = useMemo(() => {
        // Parse headings from markdown
        const regex = /^(#{2,4})\s+(.+)$/gm;
        const items: TocItem[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-");
            items.push({ id, text, level });
        }

        return items;
    }, [content]);

    useEffect(() => {
        // Observe headings for active state
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-80px 0px -80% 0px" }
        );

        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className="sticky top-24">
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <List className="h-4 w-4" /> Table of Contents
            </h4>
            <ul className="space-y-1">
                {headings.map(({ id, text, level }) => (
                    <li key={id} style={{ paddingLeft: `${(level - 2) * 12}px` }}>
                        <a
                            href={`#${id}`}
                            className={`block text-sm py-1 transition-colors border-l-2 pl-3 ${activeId === id
                                    ? "text-violet-600 border-violet-600 font-medium"
                                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground"
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
