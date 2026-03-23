import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const quotes = await prisma.quote.findMany({
            where: { userId: session.user.id },
            include: { client: true, items: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(quotes);
    } catch (error) {
        console.error("[QUOTES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { title, description, value, clientId, items, validUntil } = body;

        const quote = await prisma.quote.create({
            data: {
                title,
                description,
                value: parseFloat(value),
                clientId,
                userId: session.user.id,
                validUntil: validUntil ? new Date(validUntil) : null,
                items: {
                    create: items.map((item: any) => ({
                        description: item.description,
                        quantity: parseFloat(item.quantity),
                        price: parseFloat(item.price),
                    })),
                },
            },
            include: { items: true },
        });

        return NextResponse.json(quote);
    } catch (error) {
        console.error("[QUOTES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
