import { PaymentGateway, CheckoutOptions, CheckoutResponse } from "../gateway";
import crypto from "crypto";

export class AbacatePayAdapter extends PaymentGateway {
    name = "AbacatePay";
    provider = "abacatepay";

    async createCheckout(options: CheckoutOptions): Promise<CheckoutResponse> {
        // AbacatePay billing creation
        // Ref: https://abacatepay.com/docs/api
        const payload = {
            amount: Math.round(options.amount * 100), // in cents
            externalId: options.transactionId,
            description: options.description,
            methods: ["PIX", "CARD"],
            customer: {
                name: options.client?.name || "Cliente CRM",
                email: options.client?.email,
                taxId: "", // Not available here
            },
            returnUrl: options.redirectUrl,
            completionUrl: options.redirectUrl,
        };

        const response = await fetch("https://api.abacatepay.com/v1/billing/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erro na AbacatePay");
        }

        const data = await response.json();
        // data.data.url or similar
        return {
            url: data.data.url || data.data.checkoutUrl,
            externalId: data.data.id,
            provider: this.provider
        };
    }

    async processWebhook(body: any, headers?: Headers, rawBody?: string) {
        // HMAC Signature Verification
        const signature = headers?.get("x-webhook-signature");
        const secret = this.config.webhookSecret;

        if (secret && signature && rawBody) {
            const hmac = crypto.createHmac("sha256", secret);
            const digest = hmac.update(rawBody).digest("hex");
            if (digest !== signature) {
                console.error("[ABACATEPAY] Assinatura inválida!");
                throw new Error("Invalid signature");
            }
        }

        // body structure: { event: 'billing.paid', data: { externalId: '...', status: 'PAID' } }
        const { event, data } = body;
        let status = "pendente";

        if (event === "billing.paid" || data.status === "PAID") {
            status = "pago";
        }

        return {
            transactionId: data.externalId,
            status
        };
    }
}
