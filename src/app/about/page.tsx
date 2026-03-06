// About page
import { Separator } from "@/components/ui/separator";

export const metadata = {
    title: "About | GravBlog",
    description: "Learn more about GravBlog and the team behind it.",
};

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                About GravBlog
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
                A modern developer blog platform built with the latest web technologies.
            </p>

            <Separator className="my-8" />

            <div className="prose dark:prose-invert max-w-none">
                <h2>Our Mission</h2>
                <p>
                    GravBlog is a platform designed for developers and tech enthusiasts to share knowledge,
                    ideas, and experiences. We believe in the power of writing to clarify thoughts, teach
                    others, and build communities.
                </p>

                <h2>Tech Stack</h2>
                <ul>
                    <li><strong>Frontend:</strong> Next.js 15 with App Router & TypeScript</li>
                    <li><strong>Styling:</strong> Tailwind CSS & ShadCN UI</li>
                    <li><strong>Database:</strong> PostgreSQL with Prisma ORM</li>
                    <li><strong>Authentication:</strong> NextAuth.js</li>
                    <li><strong>Deployment:</strong> Vercel</li>
                </ul>

                <h2>Features</h2>
                <ul>
                    <li>Markdown-powered blog posts with syntax highlighting</li>
                    <li>Full-text search and category filtering</li>
                    <li>Interactive comments and likes</li>
                    <li>Dark mode support</li>
                    <li>Admin dashboard for content management</li>
                    <li>SEO optimized with dynamic metadata</li>
                    <li>Responsive design for all devices</li>
                </ul>

                <h2>Open Source</h2>
                <p>
                    GravBlog is built as a showcase of modern web development best practices.
                    Feel free to explore, learn, and contribute!
                </p>
            </div>
        </div>
    );
}
