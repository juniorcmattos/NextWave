import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const leads = await prisma.lead.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(leads);
    } catch (error) {
        console.error("[LEADS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, phone, source, value, notes, status } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const lead = await prisma.lead.create({
            data: {
                name,
                email,
                phone,
                source,
                value: parseFloat(value) || 0,
                notes,
                status: status || "novo",
                userId: session.user.id,
            },
        });

        return NextResponse.json(lead);
    } catch (error) {
        console.error("[LEADS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
