// Categories API - CRUD operations
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPrismaErrorCode } from "@/lib/prisma-errors";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { posts: true } } },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(categories);
    } catch {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, slug, description, color } = await request.json();
        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name, slug, description, color },
        });
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2002")) {
            return NextResponse.json({ error: "Category already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
