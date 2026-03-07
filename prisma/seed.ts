import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Category, PrismaClient, Tag } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gravblog.com" },
    update: {},
    create: {
      email: "admin@gravblog.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
      bio: "Blog administrator and content creator.",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create categories
  const categoriesData = [
    { name: "Web Development", slug: "web-development", color: "#6366f1" },
    { name: "JavaScript", slug: "javascript", color: "#f59e0b" },
    { name: "React", slug: "react", color: "#06b6d4" },
    { name: "TypeScript", slug: "typescript", color: "#3b82f6" },
    { name: "DevOps", slug: "devops", color: "#10b981" },
    { name: "AI & ML", slug: "ai-ml", color: "#ec4899" },
  ];

  const categories: Category[] = [];
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(created);
  }
  console.log(`${categories.length} categories created`);

  // Create tags
  const tagsData = [
    { name: "Next.js", slug: "nextjs" },
    { name: "Tailwind", slug: "tailwind" },
    { name: "Prisma", slug: "prisma" },
    { name: "Node.js", slug: "nodejs" },
    { name: "CSS", slug: "css" },
    { name: "Tutorial", slug: "tutorial" },
    { name: "Performance", slug: "performance" },
    { name: "Security", slug: "security" },
  ];

  const tags: Tag[] = [];
  for (const tag of tagsData) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    tags.push(created);
  }
  console.log(`${tags.length} tags created`);

  // Create sample posts
  const postsData = [
    {
      title: "Getting Started with Next.js 15",
      slug: "getting-started-with-nextjs-15",
      excerpt: "Learn how to build modern web applications with Next.js 15 and the App Router.",
      content: `## Introduction

Next.js 15 brings exciting improvements to the React framework. In this guide, we'll explore the key features and how to get started.

## Key Features

### App Router
The App Router provides a new way to build applications with React Server Components, nested layouts, and more.

\`\`\`typescript
// app/page.tsx
export default function HomePage() {
  return <h1>Hello, Next.js 15!</h1>;
}
\`\`\`

### Server Components
React Server Components allow you to render components on the server, reducing the JavaScript bundle sent to the client.

### Streaming
Next.js 15 supports streaming with Suspense boundaries, enabling progressive rendering.

## Getting Started

1. Create a new project:
\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Conclusion

Next.js 15 is a powerful framework for building modern web applications. Start building today!`,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
      published: true,
      featured: true,
      views: 1234,
      readingTime: 5,
      categoryIdx: 0,
      tagIdxs: [0, 5],
    },
    {
      title: "Mastering TypeScript: Advanced Patterns",
      slug: "mastering-typescript-advanced-patterns",
      excerpt: "Dive deep into TypeScript's advanced type system with practical patterns and examples.",
      content: `## TypeScript Advanced Patterns

TypeScript's type system is incredibly powerful. Let's explore some advanced patterns.

### Conditional Types

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
\`\`\`

### Template Literal Types

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`;
// "onClick", "onHover", etc.
\`\`\`

### Mapped Types

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
\`\`\`

### Utility Types

TypeScript comes with built-in utility types:

- \`Partial<T>\` - Makes all properties optional
- \`Required<T>\` - Makes all properties required
- \`Pick<T, K>\` - Picks specific properties
- \`Omit<T, K>\` - Omits specific properties

## Best Practices

1. **Use strict mode** - Always enable strict TypeScript checks
2. **Avoid any** - Use \`unknown\` instead of \`any\`
3. **Use discriminated unions** - For type-safe state management
4. **Leverage generics** - For reusable, type-safe code

## Conclusion

Mastering these patterns will make you a more effective TypeScript developer.`,
      coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800",
      published: true,
      featured: true,
      views: 891,
      readingTime: 7,
      categoryIdx: 3,
      tagIdxs: [5],
    },
    {
      title: "Building Beautiful UIs with Tailwind CSS",
      slug: "building-beautiful-uis-tailwind-css",
      excerpt: "Create stunning user interfaces using Tailwind CSS utility classes and best practices.",
      content: `## Why Tailwind CSS?

Tailwind CSS is a utility-first CSS framework that makes building custom designs fast and consistent.

### Basic Usage

\`\`\`html
<div class="flex items-center gap-4 p-6 bg-white rounded-xl shadow-lg">
  <img class="w-12 h-12 rounded-full" src="avatar.jpg" alt="Avatar" />
  <div>
    <h3 class="text-lg font-semibold text-gray-900">John Doe</h3>
    <p class="text-sm text-gray-500">Software Engineer</p>
  </div>
</div>
\`\`\`

### Dark Mode

\`\`\`html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content that adapts to theme
</div>
\`\`\`

### Responsive Design

\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
\`\`\`

## Tips

1. Use \`@apply\` sparingly
2. Create component abstractions in your framework
3. Leverage the configuration file for consistent design tokens
4. Use the official VS Code extension for autocomplete

## Conclusion

Tailwind CSS helps you build faster without sacrificing design quality.`,
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      published: true,
      featured: false,
      views: 567,
      readingTime: 4,
      categoryIdx: 0,
      tagIdxs: [1, 4, 5],
    },
    {
      title: "Database Design with Prisma ORM",
      slug: "database-design-prisma-orm",
      excerpt: "Learn how to design and manage databases effectively using Prisma ORM with PostgreSQL.",
      content: `## Introduction to Prisma

Prisma is a next-generation ORM that makes working with databases easy and type-safe.

### Schema Definition

\`\`\`prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String?
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  content  String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
\`\`\`

### Queries

\`\`\`typescript
// Find all posts with author
const posts = await prisma.post.findMany({
  include: { author: true },
  orderBy: { createdAt: 'desc' },
});

// Create with relation
const post = await prisma.post.create({
  data: {
    title: 'New Post',
    content: 'Content here',
    author: { connect: { id: userId } },
  },
});
\`\`\`

### Migrations

\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate
\`\`\`

## Best Practices

- Use \`cuid()\` or \`uuid()\` for IDs
- Add proper indexes for query performance
- Use relations instead of raw IDs where possible
- Leverage Prisma Client extensions for shared logic

## Conclusion

Prisma makes database development type-safe, productive, and enjoyable.`,
      coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
      published: true,
      featured: false,
      views: 432,
      readingTime: 6,
      categoryIdx: 0,
      tagIdxs: [2, 3, 5],
    },
  ];

  for (const postData of postsData) {
    const { categoryIdx, tagIdxs, ...data } = postData;
    await prisma.post.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        authorId: admin.id,
        categoryId: categories[categoryIdx].id,
        tags: {
          create: tagIdxs.map((idx) => ({
            tag: { connect: { id: tags[idx].id } },
          })),
        },
      },
    });
  }
  console.log(`${postsData.length} posts created`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
