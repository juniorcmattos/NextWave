import { prisma } from "@/lib/db";

export async function generateInfinitePayLink(transactionId: string) {
    const config = await prisma.infinitePayConfig.findFirst({
        where: { id: "default", isActive: true }
    });

    if (!config || !config.infiniteTag) {
        throw new Error("Integração InfinitePay não configurada ou inativa.");
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { client: true }
    });

    if (!transaction) throw new Error("Transação não encontrada.");
    if (transaction.type !== "receita") throw new Error("Apenas receitas podem gerar cobrança.");

    const payload = {
        handle: config.infiniteTag,
        order_nsu: transaction.id,
        amount: Math.round(transaction.amount * 100), // Em centavos
        items: [
            {
                name: transaction.description,
                quantity: 1,
                price: Math.round(transaction.amount * 100)
            }
        ],
        redirect_url: `${process.env.NEXTAUTH_URL}/financeiro?status=success&id=${transaction.id}`,
        webhook_url: `${process.env.NEXTAUTH_URL}/api/webhooks/infinitepay`
    };

    try {
        const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
            // Nota: Conforme pesquisa, alguns endpoints podem não exigir Auth Header se for público ou usa o 'handle'
            // Mas geralmente recomenda-se conferir se há um Bearer Token.
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[INFINITEPAY_API_ERROR]", errorData);
            throw new Error(errorData.message || "Erro ao gerar link na InfinitePay");
        }

        const data = await response.json();

        // Atualiza a transação com o link e slug
        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                infinitePayUrl: data.url,
                infinitePaySlug: data.slug
            }
        });

        return data.url;
    } catch (error) {
        console.error("[INFINITEPAY_ERROR]", error);
        throw error;
    }
}
