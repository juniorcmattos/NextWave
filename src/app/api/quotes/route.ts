import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const quoteSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().optional().or(z.literal("")),
    value: z.preprocess((val) => Number(val), z.number()),
    clientId: z.string().min(1, "Cliente é obrigatório"),
    validUntil: z.string().optional().or(z.null()),
    items: z.array(z.object({
        description: z.string().min(1),
        quantity: z.preprocess((val) => Number(val), z.number()),
        price: z.preprocess((val) => Number(val), z.number()),
    })).min(1),
});

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
        const validatedData = quoteSchema.parse(body);

        const quote = await prisma.quote.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                value: validatedData.value,
                clientId: validatedData.clientId,
                userId: session.user.id,
                validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
                items: {
                    create: validatedData.items.map((item) => ({
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
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
