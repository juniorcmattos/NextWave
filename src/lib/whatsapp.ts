import { prisma } from "@/lib/db";

export async function sendWhatsAppMessage(to: string, message: string) {
    try {
        const configs: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM "WhatsAppConfig" WHERE "id" = 'default' LIMIT 1`
        );
        const config = configs[0];

        if (!config || !config.apiUrl || !config.apiKey) {
            console.warn("[WHATSAPP_SERVICE] Configuração ausente ou incompleta.");
            return false;
        }

        // Limpar o número (remover caracteres não numéricos)
        const cleanNumber = to.replace(/\D/g, "");

        // Evolution API endpoint (ajustar conforme a versão/instância)
        // Geralmente: {apiUrl}/message/sendText/{instance}
        const instance = "NextWave"; // Nome padrão da instância
        const url = `${config.apiUrl}/message/sendText/${instance}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": config.apiKey
            },
            body: JSON.stringify({
                number: cleanNumber,
                options: {
                    delay: 1200,
                    presence: "composing",
                    linkPreview: true
                },
                textMessage: {
                    text: message
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("[WHATSAPP_SEND_ERROR]", err);
            return false;
        }

        return true;
    } catch (error) {
        console.error("[WHATSAPP_SERVICE_ERROR]", error);
        return false;
    }
}
