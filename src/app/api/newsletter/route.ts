// Newsletter subscription API
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
        }

        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existing) {
            if (!existing.active) {
                await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: { active: true },
                });
                return NextResponse.json({ message: "Welcome back! You've been re-subscribed." });
            }
            return NextResponse.json({ error: "You're already subscribed!" }, { status: 409 });
        }

        await prisma.newsletterSubscriber.create({ data: { email } });
        return NextResponse.json({ message: "Successfully subscribed!" }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
