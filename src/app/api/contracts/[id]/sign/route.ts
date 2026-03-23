import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { signatureName } = body;
        const headersList = headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";

        if (!signatureName) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const contract = await prisma.contract.update({
            where: { id: params.id },
            data: {
                status: "assinado",
                signedAt: new Date(),
                signatureIp: ip,
                signatureName: signatureName,
            },
        });

        // If contract is signed, update the related quote status to "aprovado" if not already
        if (contract.quoteId) {
            await prisma.quote.update({
                where: { id: contract.quoteId },
                data: { status: "aprovado" }
            });
        }

        return NextResponse.json(contract);
    } catch (error) {
        console.error("[CONTRACT_SIGN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
