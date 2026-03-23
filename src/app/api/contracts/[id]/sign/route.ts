import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { getActivePaymentGateway } from "@/lib/payments/factory";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { signatureName } = body;

        if (!signatureName) {
            return new NextResponse("Nome do assinante é obrigatório", { status: 400 });
        }

        const headerList = headers();
        const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

        const contract = await prisma.contract.update({
            where: { id: params.id },
            data: {
                status: "assinado",
                signedAt: new Date(),
                signatureName,
                signatureIp: ip,
            },
            include: {
                quote: true,
                client: true,
            }
        });
        
        // --- COBRANÇA AUTOMÁTICA ---
        const gateway = await getActivePaymentGateway();
        
        if (gateway && contract.quote) {
            const total = Number(contract.quote.value);
            
            // 1. Criar registro de transação no banco
            const transaction = await prisma.transaction.create({
                data: {
                    description: `Pagamento: ${contract.quote.title}`,
                    amount: total,
                    type: "receita",
                    status: "pendente",
                    category: "servicos",
                    clientId: contract.clientId,
                    userId: contract.quote.userId,
                    gatewayProvider: gateway.provider,
                }
            });

            // 2. Gerar checkout no gateway
            try {
                const checkout = await gateway.createCheckout({
                    transactionId: transaction.id,
                    amount: total,
                    description: `Assinatura: ${contract.quote.title}`,
                    client: {
                        name: contract.client.name,
                        email: contract.client.email || "",
                        phone: contract.client.phone || "",
                    },
                    redirectUrl: `${process.env.NEXTAUTH_URL}/public/pago?id=${transaction.id}`,
                });

                // 3. Atualizar transação com o link de pagamento
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        gatewayId: checkout.externalId,
                        paymentUrl: checkout.url,
                    }
                });

                console.log(`[PAYMENT_TRIGGER] Checkout criado para contrato ${params.id}: ${checkout.url}`);
                
                // Retornar checkout junto com o contrato para redirecionamento imediato no front
                return NextResponse.json({ 
                    ...contract, 
                    paymentUrl: checkout.url 
                });
            } catch (payError) {
                console.error("[PAYMENT_TRIGGER_ERROR]", payError);
                // Retorna o contrato assinado mesmo se o pagamento falhar (fluxo degradado)
                return NextResponse.json(contract);
            }
        }

        return NextResponse.json(contract);
    } catch (error) {
        console.error("[CONTRACT_SIGN_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
