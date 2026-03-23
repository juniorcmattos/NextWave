import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

const leadUpdateSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    source: z.string().optional().or(z.literal("")),
    value: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().optional()),
    notes: z.string().optional().or(z.literal("")),
    status: z.string().optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = leadUpdateSchema.parse(body);

        const lead = await prisma.lead.update({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: validatedData,
        });

        return NextResponse.json(lead);
    } catch (error) {
        console.error("[LEAD_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await prisma.lead.delete({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[LEAD_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
