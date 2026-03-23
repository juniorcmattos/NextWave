import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const leadSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    source: z.string().optional().or(z.literal("")),
    value: z.preprocess((val) => Number(val), z.number().default(0)),
    notes: z.string().optional().or(z.literal("")),
    status: z.string().default("novo"),
});

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
        const validatedData = leadSchema.parse(body);

        const lead = await prisma.lead.create({
            data: {
                ...validatedData,
                userId: session.user.id,
            },
        });

        return NextResponse.json(lead);
    } catch (error) {
        console.error("[LEADS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
