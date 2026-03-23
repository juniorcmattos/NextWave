import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { status, title, description, value, validUntil } = body;

        const quote = await prisma.quote.update({
            where: { id: params.id, userId: session.user.id },
            data: {
                status,
                title,
                description,
                value: value !== undefined ? parseFloat(value) : undefined,
                validUntil: validUntil ? new Date(validUntil) : undefined,
            },
        });

        // Special case: if approved, maybe create a contract placeholder
        if (status === "aprovado") {
            const existingContract = await prisma.contract.findUnique({
                where: { quoteId: quote.id }
            });
            if (!existingContract) {
                await prisma.contract.create({
                    data: {
                        content: `Contrato referente ao orçamento: ${quote.title}`,
                        quoteId: quote.id,
                        clientId: quote.clientId!,
                        status: "pendente",
                    }
                });
            }
        }

        return NextResponse.json(quote);
    } catch (error) {
        console.error("[QUOTE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
