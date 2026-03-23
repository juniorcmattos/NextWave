import { prisma } from "@/lib/db";
import { InfinitePayAdapter } from "./adapters/infinitepay";
import { AbacatePayAdapter } from "./adapters/abacatepay";
import { PaymentGateway } from "./gateway";

export async function getActivePaymentGateway(): Promise<PaymentGateway | null> {
    const config = await prisma.paymentGatewayConfig.findFirst({
        where: { isActive: true }
    });

    if (!config) return null;

    const credentials = JSON.parse(config.credentials);

    switch (config.provider) {
        case "infinitepay":
            return new InfinitePayAdapter(credentials);
        case "abacatepay":
            return new AbacatePayAdapter(credentials);
        // case "mercadopago":
        //     return new MercadoPagoAdapter(credentials);
        default:
            return null;
    }
}
