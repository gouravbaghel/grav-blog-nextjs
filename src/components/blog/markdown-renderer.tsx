// Markdown renderer component with syntax highlighting
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";

// Import highlight.js theme
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                rehypeHighlight,
                [rehypeAutolinkHeadings, { behavior: "wrap" }],
            ]}
        >
            {content}
        </ReactMarkdown>
    );
}
