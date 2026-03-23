import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

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
        const { name, email, phone, source, value, notes, status } = body;

        const lead = await prisma.lead.update({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: {
                name,
                email,
                phone,
                source,
                value: value !== undefined ? parseFloat(value) : undefined,
                notes,
                status,
            },
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
